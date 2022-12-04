use anchor_lang::prelude::*;

#[error_code]
pub enum GameError {
    #[msg("Program is not in an expected stage")]
    InvalidStage,
    #[msg("Bet amount is smaller than allowed")]
    BetTooSmall,
    #[msg("Integer overflow")]
    IntegerOverflow,
    #[msg("Invalid Owner")]
    InvalidOwner,
    #[msg("Invalid Mint")]
    InvalidMint,
    #[msg("Invalid User Token")]
    InvalidUserToken,
    #[msg("Timing Error")]
    TimingError,
    #[msg("Violated round result constraint")]
    ViolatedRoundResultConstraint,
    #[msg("Violated pool constraint")]
    ViolatedPoolConstraint,
    #[msg("Violated treasury constraint")]
    ViolatedTreasuryConstraint,
    #[msg("Violated prediction constraint")]
    ViolatedPredictionConstraint,
}
