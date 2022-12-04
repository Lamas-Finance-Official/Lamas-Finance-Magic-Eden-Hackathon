use anchor_lang::prelude::*;

#[error_code]
pub enum GameError {
    #[msg("Program is not in an expected stage")]
    InvalidStage,
    #[msg("Can not buy zero ticket")]
    BuyZeroTicket,
    #[msg("Number of ticket in the instruction and number of account info to store those ticket does not match")]
    NumTicketNotMatch,
    #[msg("Duplocated lottery number")]
    DuplicatedLotteryNumber,
    #[msg("Out of range lottery number")]
    OutOfRangeLotteryNumber,
    #[msg("Integer overflow")]
    IntegerOverflow,
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
}
