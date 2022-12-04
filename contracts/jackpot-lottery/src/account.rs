use crate::{
    state::{LotteryRoundResult, LotteryState, LotteryTicket, VrfLock},
    GameError,
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct Init<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(zero)]
    pub state: Account<'info, LotteryState>,
    pub mint: Account<'info, Mint>,
    #[account(mut, constraint = pool.mint == mint.key() @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = treasury.mint == mint.key() @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct NextRound<'info> {
    #[account(mut, address = state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub state: Account<'info, LotteryState>,
    #[account(zero)]
    pub next_round_result: Account<'info, LotteryRoundResult>,
    #[account(mut, constraint = next_round_pool.mint == state.mint @ GameError::ViolatedPoolConstraint)]
    pub next_round_pool: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = user_token.mint == state.mint @ GameError::InvalidUserToken)]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub state: Account<'info, LotteryState>,
    #[account(mut, address = state.round_result)]
    pub round_result: Account<'info, LotteryRoundResult>,
    #[account(mut, address = state.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RollLottery<'info> {
    #[account(mut, address = state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub state: Account<'info, LotteryState>,
    #[account(mut, address = state.round_result @ GameError::ViolatedRoundResultConstraint)]
    pub round_result: Account<'info, LotteryRoundResult>,

    /// CHECK
    #[account(init_if_needed, payer = owner, space = 8, seeds = [b"vrf-lock", &round_result.key().to_bytes()[..]], bump)]
    pub vrf_lock: Account<'info, VrfLock>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VrfFullfilled<'info> {
    #[account(mut, address = state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub state: Account<'info, LotteryState>,
    #[account(mut, address = state.round_result @ GameError::ViolatedRoundResultConstraint)]
    pub round_result: Account<'info, LotteryRoundResult>,

    /// CHECK
    #[account(mut, close = owner, seeds = [b"vrf-lock", &round_result.key().to_bytes()[..]], bump)]
    pub vrf_lock: Account<'info, VrfLock>,
}

#[derive(Accounts)]
pub struct FinalizeRound<'info> {
    #[account(mut, address = state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub state: Account<'info, LotteryState>,
    #[account(mut, address = state.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, address = state.round_result @ GameError::ViolatedRoundResultConstraint)]
    pub round_result: Account<'info, LotteryRoundResult>,
    #[account(mut, address = round_result.pool @ GameError::ViolatedPoolConstraint)]
    pub round_result_pool: Account<'info, TokenAccount>,
    /// CHECK: Token transfer will fail if this is not the correct pda authority
    pub pda_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = user_token.mint == state.mint @ GameError::InvalidUserToken)]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub state: Box<Account<'info, LotteryState>>,

    #[account(mut, address = state.mint @ GameError::InvalidMint)]
    pub mint: Account<'info, Mint>,
    #[account(
        owner = crate::id(),
        address = lottery_ticket.round_result @ GameError::ViolatedRoundResultConstraint,
    )]
    pub round_result: Account<'info, LotteryRoundResult>,
    #[account(mut, address = round_result.pool @ GameError::ViolatedPoolConstraint)]
    pub result_pool: Account<'info, TokenAccount>,
    #[account(mut, address = state.treasury @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,
    /// CHECK: Token transfer will fail if this is not the correct pda authority
    pub pda_authority: AccountInfo<'info>,

    #[account(
        mut,
        owner = crate::id(),
        constraint = lottery_ticket.owner == user.key() @ GameError::ViolatedLotteryTicketConstraint,
        close = user
    )]
    pub lottery_ticket: Account<'info, LotteryTicket>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClearRoundResult<'info> {
    #[account(mut, constraint = owner.key() == state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub state: Account<'info, LotteryState>,

    #[account(mut, address = state.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, address = state.round_result @ GameError::ViolatedRoundResultConstraint, close = owner)]
    pub round_result: Account<'info, LotteryRoundResult>,
    #[account(mut, address = round_result.pool @ GameError::ViolatedPoolConstraint)]
    pub round_result_pool: Account<'info, TokenAccount>,

    /// CHECK: Token transfer will fail if this is not the correct pda authority
    pub pda_authority: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}
