use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    error::GameError,
    state::{Prediction, ProgramState, RoundResult},
    up_or_down::{POOL_OWNER_SEED, PROGRAM_STATE_PDA_SEED, ROUND_PDA_SEED},
};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
		init,
		payer = owner,
		space = 8 + ProgramState::SIZE,
		seeds = [PROGRAM_STATE_PDA_SEED],
		bump
	)]
    pub program_state: Box<Account<'info, ProgramState>>,

    pub mint: Account<'info, Mint>,
    #[account(mut, constraint = treasury.mint == mint.key() @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateRound<'info> {
    #[account(mut, constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Box<Account<'info, ProgramState>>,

    #[account(
		init,
		payer = owner,
		space = 8 + RoundResult::SIZE,
		seeds = [ROUND_PDA_SEED, &program_state.round_counter.to_be_bytes()],
		bump
	)]
    pub round: Account<'info, RoundResult>,
    #[account(
		init,
		payer = owner,
		token::mint = mint,
		token::authority = pool_authority
	)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = program_state.mint == mint.key() @ GameError::InvalidMint)]
    pub mint: Account<'info, Mint>,

    /// CHECK
    #[account(mut, seeds = [POOL_OWNER_SEED], bump)]
    pub pool_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct StartRound<'info> {
    #[account(mut, constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Box<Account<'info, ProgramState>>,
    #[account(mut, seeds = [ROUND_PDA_SEED, &round.round_index.to_be_bytes()], bump)]
    pub round: Account<'info, RoundResult>,

    #[account(mut, constraint = pool.key() == round.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = treasury.key() == program_state.treasury @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Predict<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = user_token.mint == program_state.mint @ GameError::InvalidUserToken)]
    pub user_token: Account<'info, TokenAccount>,

    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(
		mut,
		seeds = [ROUND_PDA_SEED, &round.round_index.to_be_bytes()],
		bump
	)]
    pub round: Box<Account<'info, RoundResult>>,
    #[account(mut, constraint = pool.key() == round.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,

    #[account(init, payer = user, space = 8 + Prediction::SIZE)]
    pub prediction: Account<'info, Prediction>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizePredictionStage<'info> {
    #[account(constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(
		mut,
		seeds = [ROUND_PDA_SEED, &round.round_index.to_be_bytes()],
		bump
	)]
    pub round: Box<Account<'info, RoundResult>>,

    /// CHECK: Only the owner can execute this instruction
    pub chainlink_feed: AccountInfo<'info>,
    /// CHECK: Only the owner can execute this instruction
    pub chainlink_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct FinalizeLiveStage<'info> {
    #[account(constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(
		mut,
		seeds = [ROUND_PDA_SEED, &round.round_index.to_be_bytes()],
		bump
	)]
    pub round: Box<Account<'info, RoundResult>>,

    /// CHECK: Only the owner can execute this instruction
    pub chainlink_feed: AccountInfo<'info>,
    /// CHECK: Only the owner can execute this instruction
    pub chainlink_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = user_token.mint == program_state.mint @ GameError::InvalidUserToken)]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,

    #[account(mut, constraint = program_state.mint == mint.key() @ GameError::InvalidMint)]
    pub mint: Account<'info, Mint>,
    #[account(
		mut,
		constraint = round.key() == prediction.result @ GameError::ViolatedRoundResultConstraint,
		seeds = [ROUND_PDA_SEED, &round.round_index.to_be_bytes()],
		bump
	)]
    pub round: Box<Account<'info, RoundResult>>,
    #[account(mut, constraint = pool.key() == round.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = treasury.key() == program_state.treasury @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,

    /// CHECK: Token transfer will fail if this is not the correct pda authority
    pub pda_authority: AccountInfo<'info>,

    #[account(mut, owner = crate::id(), constraint = prediction.owner == user.key() @ GameError::ViolatedPredictionConstraint, close = user)]
    pub prediction: Account<'info, Prediction>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelRound<'info> {
    #[account(mut, constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(
		mut,
		seeds = [ROUND_PDA_SEED, &round.round_index.to_be_bytes()],
		bump
	)]
    pub round: Box<Account<'info, RoundResult>>,
}

#[derive(Accounts)]
pub struct ClearRoundResult<'info> {
    #[account(mut, constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Account<'info, ProgramState>,
    #[account(
		mut,
		seeds = [ROUND_PDA_SEED, &round.round_index.to_be_bytes()],
		bump,
		close = owner
	)]
    pub round: Box<Account<'info, RoundResult>>,
    #[account(mut, constraint = pool.key() == round.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = treasury.key() == program_state.treasury @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,

    /// CHECK: Token transfer will fail if this is not the correct pda authority
    pub pda_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}
