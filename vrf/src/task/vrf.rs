use std::cell::RefCell;

use anchor_client::{
    anchor_lang::{AnchorDeserialize, AnchorSerialize, Discriminator},
    solana_client::{
        client_error::ClientErrorKind,
        nonblocking::rpc_client::RpcClient,
        rpc_request::{RpcError, RpcResponseErrorData},
        rpc_response::RpcSimulateTransactionResult,
    },
    solana_sdk::{
        instruction::{AccountMeta, Instruction},
        signature::Signer,
        transaction::{Transaction, TransactionError},
    },
};
use once_cell::unsync::Lazy;
use vrf::{
    openssl::{CipherSuite, ECVRF},
    VRF,
};

use crate::{
    error::{FatalProcessError, ProcessError},
    VrfConfig,
};

thread_local! {
    static VRF: RefCell<Lazy<ECVRF>> = RefCell::new(Lazy::new(|| {
        ECVRF::from_suite(CipherSuite::SECP256K1_SHA256_TAI).unwrap()
    }));
}

pub struct VrfResponse {
    pub response_transaction: String,
    pub seeds: Vec<u8>,
    pub proof: Vec<u8>,
}

pub async fn process_log_response<S: AsRef<str>>(
    config: &VrfConfig,
    rpc_client: &RpcClient,
    transaction: &str,
    span: &tracing::Span,
    logs: &[S],
) -> Result<Option<VrfResponse>, ProcessError> {
    let (events, errors) = crate::parse_log::process(&logs, &config.program_ids);

    if !errors.is_empty() {
        return Err(ProcessError {
            is_fatal: true,
            error: anyhow::Error::msg(errors.into_iter().map(|err| format!("{err:?}\n")).collect::<String>()),
        });
    }

    let event = {
        let event = events
            .into_iter()
            .filter(|event| vrf_lib::RequestVrf::discriminator() == event.data[0..8])
            .next();

        match event {
            Some(event) => event,
            None => return Ok(None),
        }
    };

    let request_vrf = vrf_lib::RequestVrf::deserialize(&mut &event.data[8..]).fatal_error_with_context("Deserialize RequestVrf Event")?;
    if !request_vrf.ix_data.starts_with(&[0; vrf_lib::VrfResult::RANDOM_BYTE_LEN]) {
        span.in_scope(|| tracing::warn!("Random byte slice not match, data lost may occur"));
    }

    span.in_scope(|| tracing::info!("Gathering transaction hash.."));
    let seeds = {
        let mut seeds = Vec::with_capacity(config.num_confirmed_block * anchor_client::solana_sdk::hash::HASH_BYTES);

        let mut block_hash = rpc_client.get_latest_blockhash().await?;
        seeds.extend_from_slice(block_hash.as_ref());

        span.in_scope(|| tracing::info!("Gathering transaction hash 1/{}", config.num_confirmed_block));

        for index in 1..config.num_confirmed_block {
            let next_block_hash = rpc_client.get_new_latest_blockhash(&block_hash).await?;
            seeds.extend_from_slice(next_block_hash.as_ref());
            block_hash = next_block_hash;

            span.in_scope(|| tracing::info!("Gathering transaction hash {}/{}", index + 1, config.num_confirmed_block));
        }

        seeds
    };

    let (proof, random) = {
        let (proof, hash) = VRF.with(|vrf| {
            let mut vrf = vrf.borrow_mut();
            let proof = vrf.prove(&config.secret, &seeds).unwrap();
            let hash = vrf.proof_to_hash(&proof).unwrap();
            (proof, hash)
        });

        let mut random = [0u8; vrf_lib::VrfResult::RANDOM_BYTE_LEN];
        random.copy_from_slice(&hash[..vrf_lib::VrfResult::RANDOM_BYTE_LEN]);
        (proof, random)
    };

    span.in_scope(|| tracing::info!("Random value: {:?}", &random));

    let mut trans = {
        let mut ix_data = request_vrf.ix_sighash.to_vec();
        {
            let mut request_transaction = [0; vrf_lib::VrfResult::SIGNATURE_BYTE_LEN];
            bs58::decode(transaction)
                .into(&mut request_transaction)
                .expect("Pubkey::from_str transaction signature");

            let result = vrf_lib::VrfResult {
                random,
                request_transaction,
            };

            let result = result.try_to_vec().unwrap();
            ix_data.extend_from_slice(&result);
            if request_vrf.ix_data.len() < result.len() {
                // Incompatible layout
                return Err(ProcessError {
                    is_fatal: true,
                    error: anyhow::anyhow!(
                        "VrfResult incompatible layout: ix_data.len()={}, vrf_result.len()={}",
                        request_vrf.ix_data.len(),
                        result.len()
                    ),
                });
            }

            ix_data.extend_from_slice(&request_vrf.ix_data[result.len()..]);
        }

        let mut accounts = Vec::with_capacity(request_vrf.accounts.len() + 1);
        accounts.push(AccountMeta {
            pubkey: config.owner.pubkey(),
            is_signer: true,
            is_writable: false,
        });
        accounts.extend(request_vrf.accounts.into_iter().map(|acc| AccountMeta {
            pubkey: acc.pubkey,
            is_signer: false,
            is_writable: acc.is_writable,
        }));

        let instruction = Instruction {
            program_id: event.program_id,
            data: ix_data,
            accounts,
        };

        let latest_hash = rpc_client.get_latest_blockhash().await?;
        Transaction::new_signed_with_payer(&[instruction], Some(&config.owner.pubkey()), &[&config.owner], latest_hash)
    };

    for _ in 0..2 {
        span.in_scope(|| tracing::info!("Sending request..."));

        match rpc_client.send_and_confirm_transaction(&trans).await {
            Ok(signature) => {
                return Ok(Some(VrfResponse {
                    response_transaction: signature.to_string(),
                    seeds,
                    proof,
                }))
            }
            Err(err) => match err.kind() {
                ClientErrorKind::RpcError(RpcError::RpcResponseError { data, .. }) => {
                    if let RpcResponseErrorData::SendTransactionPreflightFailure(RpcSimulateTransactionResult {
                        logs: Some(logs), ..
                    }) = data
                    {
                        let mut errors = "Simulation error logs:".to_string();
                        for log in logs {
                            errors.push('\t');
                            errors.push_str(log);
                            errors.push('\n');
                        }

                        return Err(err).fatal_error_with_context(errors);
                    }

                    return Err(err).fatal_error();
                }
                ClientErrorKind::TransactionError(TransactionError::BlockhashNotFound)
                | ClientErrorKind::TransactionError(TransactionError::AlreadyProcessed) => {
                    let new_blockhash = rpc_client.get_new_latest_blockhash(&trans.message.recent_blockhash).await?;
                    trans.message.recent_blockhash = new_blockhash;
                    continue;
                }
                _ => return Err(err).fatal_error(),
            },
        }
    }

    Err(ProcessError {
        is_fatal: false,
        error: anyhow::Error::msg("Failed to send transaction"),
    })
}
