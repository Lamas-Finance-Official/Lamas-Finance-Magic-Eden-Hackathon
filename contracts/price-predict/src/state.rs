use anchor_lang::prelude::*;

pub enum Stage {
    WaitNextRound = 1,
    PredictStage = 2,
    ComputeStage = 3,
}

#[account]
pub struct ProgramState {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub treasury: Pubkey,
    pub round_result: Pubkey,
    pub chainlink_program: Pubkey,
    pub chainlink_feed: Pubkey,

    pub min_bet_amount: u64,
    pub profit_tax_percentage: u32,
    pub tax_burn_percentage: u32,

    /// ASSUMPTION: sorted, maximum 16 element
    pub bonus_points: Vec<[u32; 2]>,

    pub stage: u8,
}

impl ProgramState {
    pub const SPACE: usize =
		32 * 6 // Pubkey
		+ 8 * 1 // u64
		+ 4 * 2 // u32
		+ 4 + (4 + 4) * 16 // Vec - assuming 16 element max
		+ 1 // u8
		+ 256 // preserved
		;
}

#[account]
pub struct RoundResult {
    pub pool: Pubkey,
    pub price_start_stage: u128,
    pub price_end_stage: u128,
    pub sum_stake: u128,
    pub sum_stake_mul_score: u128,
    pub result_vec0: f64,
    pub unix_time_start_round: u64,
    pub unix_time_end_round: u64,
    pub finalized: u8,
}

impl RoundResult {
    pub const SPACE: usize =
		32 * 1 // Pubkey
		+ 16 * 4 // u128
		+ 8 * 2 // u64 or f64
		+ 1 // u8
		+ 256 // preserved
		;
}

#[account]
pub struct Prediction {
    pub owner: Pubkey,
    pub round_result: Pubkey,
    pub unix_time_predict: u64,
    pub stake_amount: u64,
    pub predict_vector0: f64,
    pub predict_price: u128,
}

impl Prediction {
    pub const SPACE: usize =
		32 * 2 // Pubkey
		+ 8 * 3 // u64 or f64
		+ 16
		+ 240 // preserved
		;

    pub fn to_predict_event(&self) -> UserPredictEvent {
        UserPredictEvent {
            owner: self.owner,
            round_result: self.round_result,
            unix_time_predict: self.unix_time_predict,
            stake_amount: self.stake_amount,
            predict_vector0: self.predict_vector0,
        }
    }

    pub fn to_claim_event(&self, reward: u64, tax: u64, score: u32) -> UserClaimEvent {
        UserClaimEvent {
            owner: self.owner,
            round_result: self.round_result,
            stake_amount: self.stake_amount,
            reward,
            tax,
            score,
        }
    }
}

#[event]
pub struct UserPredictEvent {
    pub owner: Pubkey,
    pub round_result: Pubkey,
    pub unix_time_predict: u64,
    pub stake_amount: u64,
    pub predict_vector0: f64,
}

#[event]
pub struct UserClaimEvent {
    pub owner: Pubkey,
    pub round_result: Pubkey,
    pub stake_amount: u64,
    pub reward: u64,
    pub tax: u64,
    pub score: u32,
}
