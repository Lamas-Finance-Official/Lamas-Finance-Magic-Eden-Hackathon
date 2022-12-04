use anchor_lang::prelude::*;

#[account]
pub struct LotteryState {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub pool: Pubkey,
    pub treasury: Pubkey,
    pub round_result: Pubkey,
    pub stage: GameStage,
}

#[account]
pub struct LotteryRoundResult {
    pub pool: Pubkey,
    pub pool_value_when_round_end: u64,
    pub profit_tax_percentage: u8,
    pub tax_burn_percentage: u8,
    pub ticket_price: u64,
    pub lottery_max_num: u8,
    pub lottery_len: u8,
    pub lottery_result: [u8; 6],
    pub reward_distribution_percentage: [u8; 7],
    pub reward_map_num_match_to_token: [u64; 7],

    pub unix_time_start_round: u64,
    pub unix_time_end_round: u64,
}

#[account]
pub struct LotteryTicket {
    pub owner: Pubkey,
    pub round_result: Pubkey,
    pub lottery_number: [u8; 6],
    pub unix_time_buy: u64,
}

#[account]
pub struct VrfLock {}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum GameStage {
    WaitNextRound = 0,
    BuyTicket = 1,
    WaitFinalizeRound = 2,
}
