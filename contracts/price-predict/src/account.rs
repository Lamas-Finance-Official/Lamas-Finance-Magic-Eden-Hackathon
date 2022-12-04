use crate::{
    error::GameError,
    state::{Prediction, ProgramState, RoundResult},
    STATE_PDA_SEED,
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct Init<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(init, payer = owner, space = 8 + ProgramState::SPACE, seeds = [STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    pub mint: Account<'info, Mint>,
    #[account(mut, constraint = treasury.mint == mint.key() @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct NextRound<'info> {
    #[account(mut, constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(init, payer = owner, space = 8 + RoundResult::SPACE)]
    pub round_result: Account<'info, RoundResult>,

    pub mint: Account<'info, Mint>,
    #[account(
		init,
		payer = owner,
		token::mint = mint,
		token::authority = program_state,
	)]
    pub pool: Account<'info, TokenAccount>,

    /// CHECK: Checked using program_state
    #[account(constraint = chainlink_feed.key() == program_state.chainlink_feed @ GameError::ViolatedChainlinkFeed)]
    pub chainlink_feed: AccountInfo<'info>,
    /// CHECK: Checked using program_state
    #[account(constraint = chainlink_program.key() == program_state.chainlink_program @ GameError::ViolatedChainlinkProgram)]
    pub chainlink_program: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Predict<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = user_token.mint == program_state.mint @ GameError::InvalidUserToken)]
    pub user_token: Account<'info, TokenAccount>,

    #[account(mut, seeds = [STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(constraint = round_result.key() == program_state.round_result @ GameError::ViolatedRoundResultConstraint)]
    pub round_result: Account<'info, RoundResult>,
    #[account(init, payer = user, space = 8 + Prediction::SPACE)]
    pub prediction: Account<'info, Prediction>,

    #[account(mut, constraint = pool.key() == round_result.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ComputeRoundResultStart<'info> {
    #[account(mut, constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(mut, constraint = round_result.key() == program_state.round_result @ GameError::ViolatedRoundResultConstraint)]
    pub round_result: Account<'info, RoundResult>,

    /// CHECK: Checked using program_state
    #[account(constraint = chainlink_feed.key() == program_state.chainlink_feed @ GameError::ViolatedChainlinkFeed)]
    pub chainlink_feed: AccountInfo<'info>,
    /// CHECK: Checked using program_state
    #[account(constraint = chainlink_program.key() == program_state.chainlink_program @ GameError::ViolatedChainlinkProgram)]
    pub chainlink_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ComputeRoundResultEnd<'info> {
    #[account(mut, constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(mut, constraint = round_result.key() == program_state.round_result @ GameError::ViolatedRoundResultConstraint)]
    pub round_result: Account<'info, RoundResult>,
}

#[derive(Accounts)]
#[instruction(state_bump: u8)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = user_token.mint == program_state.mint @ GameError::InvalidUserToken)]
    pub user_token: Account<'info, TokenAccount>,

    #[account(mut, seeds = [STATE_PDA_SEED], bump = state_bump)]
    pub program_state: Box<Account<'info, ProgramState>>,
    #[account(mut, constraint = round_result.key() == prediction.round_result @ GameError::ViolatedRoundResultConstraint)]
    pub round_result: Account<'info, RoundResult>,
    #[account(
		mut,
		close = user,
		constraint = prediction.owner == user.key() @ GameError::InvalidOwner
	)]
    pub prediction: Account<'info, Prediction>,

    #[account(mut, constraint = mint.key() == program_state.mint @ GameError::InvalidMint)]
    pub mint: Account<'info, Mint>,
    #[account(mut, constraint = pool.key() == round_result.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = treasury.key() == program_state.treasury @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(state_bump: u8)]
pub struct ClearRoundResult<'info> {
    #[account(mut, constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [STATE_PDA_SEED], bump = state_bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(mut, close = owner, constraint = round_result.key() != program_state.round_result @ GameError::ViolatedRoundResultConstraint)]
    pub round_result: Account<'info, RoundResult>,
    #[account(mut, constraint = pool.key() == round_result.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = treasury.key() == program_state.treasury @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
