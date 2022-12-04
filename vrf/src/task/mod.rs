use std::{collections::HashMap, str::FromStr, sync::Arc, time::Duration};

use anchor_client::{
    solana_client::{
        nonblocking::{pubsub_client::PubsubClient, rpc_client::RpcClient},
        rpc_client::GetConfirmedSignaturesForAddress2Config,
        rpc_config::{RpcTransactionLogsConfig, RpcTransactionLogsFilter},
        rpc_response::{RpcConfirmedTransactionStatusWithSignature, RpcLogsResponse},
    },
    solana_sdk::{commitment_config::CommitmentConfig, signature::Signature},
};
use futures_util::stream::StreamExt;
use solana_transaction_status::{UiTransactionEncoding, UiTransactionStatusMeta};

use crate::{
    db::{self, RetryableTransaction},
    task::vrf::{process_log_response, VrfResponse},
    VrfConfig,
};

mod vrf;

async fn process<S: AsRef<str>>(
    config: &VrfConfig,
    rpc_client: &RpcClient,
    program_id: &str,
    signature: &str,
    span: &tracing::Span,
    logs: &[S],
) {
    match db::process_transaction(program_id, signature) {
        Ok(true) => {}
        Ok(false) => return,
        Err(err) => {
            span.in_scope(|| tracing::info!("[DB] Start process transaction error: {err:#}"));
            return;
        }
    }

    let result = process_log_response(config, rpc_client, signature, span, logs).await;

    let _enter = span.enter();
    let db_result = match result {
        Ok(resp) => {
            tracing::info!("Processed ({signature})");
            if let Some(VrfResponse {
                response_transaction,
                seeds,
                proof,
            }) = resp
            {
                db::complete_processing(&program_id, &signature, response_transaction, seeds, proof)
            } else {
                db::complete_none_vrf_processing(&program_id, &signature)
            }
        }
        Err(err) => {
            tracing::warn!("Error process log ({signature}):\n {:#}", err.error);
            db::error_processing(&program_id, &signature, err.is_fatal, format!("{:#}", err.error))
        }
    };

    if let Err(err) = db_result {
        tracing::error!("[DB] Complete transaction error: {err:#}");
    }
}

pub async fn logs_subscribe(config: Arc<VrfConfig>, program_id: Arc<String>, rpc_client: Arc<RpcClient>) -> ! {
    loop {
        let pubsub_client = PubsubClient::new(config.cluster.ws_url()).await.unwrap();

        let (mut recv_stream, _) = pubsub_client
            .logs_subscribe(
                RpcTransactionLogsFilter::Mentions(vec![(*program_id).clone()]),
                RpcTransactionLogsConfig {
                    commitment: Some(config.commitment),
                },
            )
            .await
            .unwrap();

        tracing::info!("Listening for logs from: {}", &program_id);
        while let Some(response) = recv_stream.next().await {
            let config = config.clone();
            let rpc_client = rpc_client.clone();
            let program_id = program_id.clone();

            tokio::spawn(async move {
                let program_id: &str = &program_id;

                let RpcLogsResponse { signature, err, logs } = response.value;
                let span = tracing::info_span!("Process transaction", program_id, transaction = signature);
                let enter = span.enter();
                if let Some(err) = err {
                    tracing::info!("Skipping error transaction ({signature}):\n{err:#}");
                    return;
                }

                let str_logs = logs.join("\n");
                match db::new_transaction(&program_id, &signature, &str_logs) {
                    Ok(true) => {
                        tracing::info!("New transaction added: {}\n{}", &signature, &str_logs);
                        drop(enter);

                        process(&config, &rpc_client, &program_id, &signature, &span, &logs).await;
                    }
                    Ok(false) => {}
                    Err(err) => {
                        tracing::error!("[DB] Add new transaction error: {err:#}");
                    }
                }
            });
        }

        tracing::warn!("Logs subscribe stream ({}) stopped, retrying after 2s", &program_id);
        tokio::time::sleep(Duration::from_secs(2)).await;
    }
}

pub async fn retry_failed_transaction(config: Arc<VrfConfig>, rpc_client: Arc<RpcClient>) -> ! {
    loop {
        match db::get_retryable_transaction(Duration::from_secs(config.retry_interval_seconds * 2)) {
            Ok(transactions) => {
                for trans in transactions {
                    let RetryableTransaction {
                        program_id,
                        transaction,
                        log_messages,
                        ..
                    } = trans;

                    let span = tracing::info_span!("Retry transaction", program_id, transaction);
                    let logs = log_messages.split("\n").collect::<Vec<_>>();

                    process(&config, &rpc_client, &program_id, &transaction, &span, &logs).await;
                }
            }
            Err(err) => {
                tracing::error!("[DB] Get retryable transaction error {err:#}");
            }
        }

        tokio::time::sleep(Duration::from_secs(config.retry_interval_seconds)).await;
    }
}

pub async fn process_old_transaction(config: Arc<VrfConfig>, rpc_client: Arc<RpcClient>) {
    const CACHE_SIZE: usize = 5000;
    let processed_transaction_cache = &mut HashMap::new();
    let programs = config
        .program_ids
        .iter()
        .map(|program_id| (program_id, program_id.to_string()))
        .collect::<Vec<_>>();

    loop {
        for (program_pubkey, program_id) in programs.iter() {
            let transactions = processed_transaction_cache
                .entry(program_id)
                .or_insert_with(|| indexmap::IndexSet::new());

            let mut before = None;
            if let Ok(trans) = db::get_transactions(program_id, 1000) {
                if transactions.len() + trans.len() > CACHE_SIZE {
                    transactions.drain(0..(transactions.len() + trans.len() - CACHE_SIZE));
                }

                transactions.extend(trans);
                before = transactions.last().map(|str| Signature::from_str(str).unwrap());
            }

            if let Ok(signatures) = rpc_client
                .get_signatures_for_address_with_config(
                    program_pubkey,
                    GetConfirmedSignaturesForAddress2Config {
                        before,
                        until: None,
                        limit: None,
                        commitment: Some(CommitmentConfig::finalized()),
                    },
                )
                .await
            {
                let fetched_len = signatures.len();
                let signatures = signatures
                    .into_iter()
                    .filter(|sig| sig.err.is_none())
                    .filter(|sig| !transactions.contains(&sig.signature))
                    .collect::<Vec<_>>();

                if signatures.is_empty() {
                    continue;
                }

                tracing::info!(
                    "Process old transaction: processing {} in {} fetched transactions",
                    signatures.len(),
                    fetched_len
                );

                for trans_sig in signatures {
                    let RpcConfirmedTransactionStatusWithSignature { signature, .. } = trans_sig;

                    if let Ok(encoded_transaction) = rpc_client
                        .get_transaction(
                            &Signature::from_str(&signature).expect("invalid signature return from get_signatures"),
                            UiTransactionEncoding::Json,
                        )
                        .await
                    {
                        if let Some(UiTransactionStatusMeta {
                            err: None,
                            log_messages: Some(logs),
                            ..
                        }) = encoded_transaction.transaction.meta
                        {
                            let str_logs = logs.join("\n");
                            match db::new_transaction(&program_id, &signature, &str_logs) {
                                Ok(true) => {
                                    let span = tracing::info_span!("Process old transaction", program_id, transaction = signature);
                                    process(&config, &rpc_client, program_id, &signature, &span, &logs).await;
                                }
                                Ok(false) => {}
                                Err(err) => {
                                    tracing::event!(
                                        tracing::Level::ERROR,
                                        program_id,
                                        transaction = signature,
                                        "[DB] Add old transaction error: {err:#}",
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }

        tokio::time::sleep(Duration::from_secs(30)).await;
    }
}
