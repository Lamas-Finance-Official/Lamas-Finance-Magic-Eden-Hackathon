use crate::Decimal;
use anchor_lang::prelude::*;

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum GameStage {
    WaitStartRound = 0,
    Prediction = 1,
    Live = 2,
    Ended = 3,
    Canceled = 4,
}

#[account]
pub struct ProgramState {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub treasury: Pubkey,
    pub round_counter: u64,
}

impl ProgramState {
    // 32 * 3 + 8 * 2 = 112
    pub const SIZE: usize = 256;
}

/// Note: we use this as Box<AccountInfo<_>>
/// to avoid exceeding Stack memory limit
#[account]
pub struct RoundResult {
    pub round_index: u64,
    pub pool: Pubkey,
    pub up_pool_value: u64,
    pub down_pool_value: u64,
    pub did_up_win: bool,
    pub min_bet_amount: u64,
    pub profit_tax_percentage: u64,
    pub tax_burn_percentage: u64,
    pub price_end_predict_stage: Decimal,
    pub price_end_live_stage: Decimal,
    pub unix_time_start_round: u64,
    pub unix_time_start_live_stage: u64,
    pub unix_time_end_live_stage: u64,
    pub stage: u8,
}

impl RoundResult {
    // 32 + 1 + 8 * 9 + Decimal::SIZE * 2 = 145
    pub const SIZE: usize = 256;
}

#[account]
pub struct Prediction {
    pub owner: Pubkey,
    pub result: Pubkey,
    pub is_up: bool,
    pub amount: u64,
}

impl Prediction {
    // 32 * 2 + 1 + 8 = 73
    pub const SIZE: usize = 96;
}
