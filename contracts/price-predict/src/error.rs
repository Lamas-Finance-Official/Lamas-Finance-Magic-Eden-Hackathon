use anchor_lang::prelude::*;

#[error_code]
pub enum GameError {
    #[msg("Program is not in an expected stage")]
    InvalidStage,
    #[msg("Integer overflow")]
    IntegerOverflow,
    #[msg("Integer multiply overflow")]
    IntegerMultiplyOverflow,
    #[msg("Integer convert overflow")]
    IntegerConvertOverflow,
    #[msg("Invalid Owner")]
    InvalidOwner,
    #[msg("Invalid Mint")]
    InvalidMint,
    #[msg("Invalid User Token")]
    InvalidUserToken,
    #[msg("Violated round result constraint")]
    ViolatedRoundResultConstraint,
    #[msg("Violated pool constraint")]
    ViolatedPoolConstraint,
    #[msg("Violated treasury constraint")]
    ViolatedTreasuryConstraint,
    #[msg("Violated lottery ticket constraint")]
    ViolatedLotteryTicketConstraint,
    #[msg("Violated chainlink feed")]
    ViolatedChainlinkFeed,
    #[msg("Violated chainlink program")]
    ViolatedChainlinkProgram,
    #[msg("Not enough decimal")]
    NotEnoughDecimal,
    #[msg("Bet too small")]
    BetTooSmall,
    #[msg("Too soon")]
    TooSoon,
}
