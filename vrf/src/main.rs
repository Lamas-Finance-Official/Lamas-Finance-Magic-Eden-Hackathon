use std::sync::Arc;

use anchor_client::{
    solana_client::nonblocking::rpc_client::RpcClient,
    solana_sdk::{
        commitment_config::{CommitmentConfig, CommitmentLevel},
        pubkey::Pubkey,
        signature::Keypair,
    },
    Cluster,
};
use anyhow::Context;
use serde_with::{serde_as, DisplayFromStr};

mod db;
mod error;
mod parse_log;
mod task;

#[serde_as]
#[derive(Debug, serde::Deserialize, Clone)]
#[serde(rename_all = "kebab-case")]
struct Config {
    owner: Vec<u8>,
    secret: Vec<u8>,
    #[serde_as(as = "DisplayFromStr")]
    cluster: Cluster,
    #[serde_as(as = "DisplayFromStr")]
    commitment: CommitmentLevel,
    #[serde_as(as = "Vec<DisplayFromStr>")]
    program_ids: Vec<Pubkey>,
    num_confirmed_block: usize,
    retry_interval_seconds: u64,
    database_url: String,
}

#[derive(Debug)]
pub struct VrfConfig {
    owner: Keypair,
    secret: Vec<u8>,
    cluster: Cluster,
    commitment: CommitmentConfig,
    program_ids: Vec<Pubkey>,
    num_confirmed_block: usize,
    retry_interval_seconds: u64,
    database_url: String,
}

impl TryFrom<Config> for VrfConfig {
    type Error = anyhow::Error;

    fn try_from(config: Config) -> Result<Self, Self::Error> {
        let owner = Keypair::from_bytes(&config.owner).context("recover owner Keypair from bytes")?;
        let commitment = CommitmentConfig {
            commitment: config.commitment,
        };

        Ok(Self {
            owner,
            secret: config.secret,
            cluster: config.cluster,
            commitment,
            program_ids: config.program_ids,
            num_confirmed_block: config.num_confirmed_block,
            retry_interval_seconds: config.retry_interval_seconds,
            database_url: config.database_url,
        })
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let config: Config = config::Config::builder()
        .add_source(config::File::with_name("vrf-config.toml"))
        .add_source(config::Environment::with_prefix("VRF"))
        .build()?
        .try_deserialize()?;

    let config = Arc::new(VrfConfig::try_from(config)?);

    println!("---");
    println!("Running VRF handler with:");
    println!("Cluster: ({}) {}", &config.cluster, config.cluster.url());
    println!("Commitment: {}", &config.commitment.commitment);
    println!("Database: {}", &config.database_url);
    println!("---");

    db::init(&config.database_url);
    db::run_migration()?;

    let rpc_client = Arc::new(RpcClient::new_with_commitment(config.cluster.url().to_string(), config.commitment));

    for program_id in &config.program_ids {
        tokio::spawn(task::logs_subscribe(
            config.clone(),
            Arc::new(program_id.to_string()),
            rpc_client.clone(),
        ));
    }

    let _ = tokio::join!(
        tokio::spawn(task::process_old_transaction(config.clone(), rpc_client.clone())),
        tokio::spawn(task::retry_failed_transaction(config.clone(), rpc_client.clone())),
    );

    Ok(())
}

#[test]
fn test() {
    use anchor_client::anchor_lang::AnchorDeserialize;
    let data = base64::decode("u8/SGUIPrZw9agqPSg1p6ELEArLonrhCU8MbEba0/4jZcF+gtclzxgCUNXcAAAAAAAAAAAAAAABAQg8AAAAAAA==").unwrap();

    #[derive(AnchorDeserialize, Debug)]
    struct SpinResult {
        user: Pubkey,
        bet_amount: u64,
        multiplier: u64,
        decimal: u64,
    }

    let r = SpinResult::deserialize(&mut &data[8..]);
    println!("{r:#?}");
}

#[test]
fn test2() {
    let arr = [1, 2, 3];
    println!("{:?}", &arr[4..]);
}
