use crate::{
    account::*,
    error::GameError,
    random::random,
    state::{GameStage, LotteryRoundResult, LotteryState, LotteryTicket},
};
use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, spl_token::instruction::AuthorityType, Burn, CloseAccount, SetAuthority, Transfer,
};

declare_id!("Bw2HwtYcTro3nzYt2XFqKA3iu4worp5qkgmrNXVZYEAE");

mod account;
mod error;
mod random;
mod state;

type ProgramResult = Result<()>;

#[program]
pub mod jackpot_lottery {
    use super::*;

    const PDA_SEED: &[u8] = b"lamas_finance";

    pub fn init(ctx: Context<Init>) -> ProgramResult {
        *ctx.accounts.state = LotteryState {
            owner: ctx.accounts.owner.key(),
            mint: ctx.accounts.mint.key(),
            pool: ctx.accounts.pool.key(),
            treasury: ctx.accounts.treasury.key(),
            round_result: Pubkey::default(),
            stage: GameStage::WaitNextRound,
        };

        // Update pool owner
        let (authority, _) = Pubkey::find_program_address(&[PDA_SEED], ctx.program_id);

        msg!("Transfering Pool authority to pda");
        token::set_authority(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                SetAuthority {
                    current_authority: ctx.accounts.owner.to_account_info(),
                    account_or_mint: ctx.accounts.pool.to_account_info(),
                },
            ),
            AuthorityType::AccountOwner,
            Some(authority),
        )?;

        Ok(())
    }

    pub fn next_round(
        ctx: Context<NextRound>,
        profit_tax_percentage: u8,
        tax_burn_percentage: u8,
        ticket_price: u64,
        lottery_max_num: u8,
        lottery_len: u8,
        reward_distribution_percentage: [u8; 7],
    ) -> ProgramResult {
        let state = &mut ctx.accounts.state;
        require!(
            state.stage == GameStage::WaitNextRound,
            GameError::InvalidStage
        );

        *ctx.accounts.next_round_result = LotteryRoundResult {
            pool: ctx.accounts.next_round_pool.key(),
            pool_value_when_round_end: 0,
            profit_tax_percentage,
            tax_burn_percentage,
            ticket_price,
            lottery_max_num,
            lottery_len,
            lottery_result: [0; 6],
            reward_distribution_percentage,
            reward_map_num_match_to_token: [0; 7],
            unix_time_start_round: Clock::get()?.unix_timestamp as u64,
            unix_time_end_round: 0,
        };

        state.round_result = ctx.accounts.next_round_result.key();
        state.stage = GameStage::BuyTicket;

        // Update pool owner
        let (authority, _) = Pubkey::find_program_address(&[PDA_SEED], ctx.program_id);

        msg!("Transfering ResultPool authority to pda");
        token::set_authority(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                SetAuthority {
                    current_authority: ctx.accounts.owner.to_account_info(),
                    account_or_mint: ctx.accounts.next_round_pool.to_account_info(),
                },
            ),
            AuthorityType::AccountOwner,
            Some(authority),
        )?;

        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, tickets: Vec<[u8; 6]>) -> ProgramResult {
        let state = &ctx.accounts.state;
        require!(state.stage == GameStage::BuyTicket, GameError::InvalidStage);
        require!(!tickets.is_empty(), GameError::BuyZeroTicket);

        let round = &ctx.accounts.round_result;
        let ticket_account_infos = ctx.remaining_accounts;
        require!(
            ticket_account_infos.len() == tickets.len(),
            GameError::NumTicketNotMatch
        );

        for (mut ticket, account_info) in tickets.into_iter().zip(ticket_account_infos.iter()) {
            ticket[0..round.lottery_len as usize].sort_unstable();
            msg!("Checking ticket: {:?}", &ticket);
            for i in 0..round.lottery_len as usize {
                if i < round.lottery_len as usize - 1 {
                    require!(
                        ticket[i] != ticket[i + 1],
                        GameError::DuplicatedLotteryNumber
                    );
                }

                require!(
                    (1..=round.lottery_max_num).contains(&ticket[i]),
                    GameError::OutOfRangeLotteryNumber
                );
            }

            let mut account_info: Account<LotteryTicket> =
                Account::try_from_unchecked(account_info)?;

            *account_info = LotteryTicket {
                owner: ctx.accounts.user.key(),
                round_result: ctx.accounts.round_result.key(),
                lottery_number: ticket,
                unix_time_buy: Clock::get()?.unix_timestamp as u64,
            };

            account_info.exit(&crate::ID)?;
        }

        let total_price = ticket_account_infos.len() as u64 * round.ticket_price;
        // Drop all Ref before CPI
        drop(round);
        drop(state);

        msg!("Transfering stake to pool");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token.to_account_info(),
                    to: ctx.accounts.pool.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            total_price,
        )?;

        Ok(())
    }

    pub fn roll_lottery(ctx: Context<RollLottery>) -> ProgramResult {
        require!(
            GameStage::BuyTicket == ctx.accounts.state.stage,
            GameError::InvalidStage
        );

        vrf_lib::request_random(
            instruction::OnVrfFulfilled {
                result: vrf_lib::VrfResult::default(),
            },
            vec![
                vrf_lib::account_meta(&ctx.accounts.state).mutable(),
                vrf_lib::account_meta(&ctx.accounts.round_result).mutable(),
                vrf_lib::account_meta(&ctx.accounts.vrf_lock).mutable(),
            ],
        );

        Ok(())
    }

    pub fn on_vrf_fulfilled(
        ctx: Context<VrfFullfilled>,
        result: vrf_lib::VrfResult,
    ) -> ProgramResult {
        let state = &mut ctx.accounts.state;
        let round = &mut ctx.accounts.round_result;

        require!(GameStage::BuyTicket == state.stage, GameError::InvalidStage);
        let mut lottery_result = [0; 6];
        random(
            1..=round.lottery_max_num,
            &mut lottery_result[0..round.lottery_len as usize],
            &result.random,
        );

        msg!("Lottery result: {:?}", lottery_result);
        round.lottery_result = lottery_result;
        round.unix_time_end_round = Clock::get()?.unix_timestamp as u64;
        state.stage = GameStage::WaitFinalizeRound;
        Ok(())
    }

    /// Server count all number of winning ticket then call this instruction
    /// to transfer appropriate amount of token to the result pool
    ///
    /// `num_winning_ticket`: Map the amount of matching number to the amount of winning ticket
    ///                       if there not enough match to count as winning then the server can skip
    ///                       that check and set the value to 0.
    ///
    /// Example:
    ///     - 3 player match 4 number
    ///     - 1 player match 3 number
    ///     - matching 1 or 2 number dont yield any reward
    ///
    /// `num_winning_ticket` will be [0, 0, 0, 1, 3, 0, 0]
    pub fn finalize_round(
        ctx: Context<FinalizeRound>,
        num_winning_ticket: [u64; 7],
    ) -> ProgramResult {
        let state = &mut ctx.accounts.state;
        let round = &mut ctx.accounts.round_result;

        require!(
            GameStage::WaitFinalizeRound == state.stage,
            GameError::InvalidStage
        );

        let pool_value = ctx.accounts.pool.amount;
        let mut reward_pool_value = 0;
        for (i, num_ticket) in num_winning_ticket.into_iter().enumerate() {
            let reward_percentage = round.reward_distribution_percentage[i];
            let reward_token_per_ticket = &mut round.reward_map_num_match_to_token[i];

            if num_ticket == 0 || reward_percentage == 0 {
                *reward_token_per_ticket = 0;
                continue;
            }

            let num_token = pool_value * reward_percentage as u64 / 100;
            *reward_token_per_ticket = num_token / num_ticket;
            reward_pool_value += num_token;
        }
        state.stage = GameStage::WaitNextRound;

        let (_, pda_bump) = Pubkey::find_program_address(&[PDA_SEED], ctx.program_id);

        // Transfer to result
        msg!("Transfering token from Pool to ResultPool");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool.to_account_info(),
                    to: ctx.accounts.round_result_pool.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&PDA_SEED[..], &[pda_bump]]]),
            reward_pool_value,
        )?;

        Ok(())
    }

    pub fn claim_reward(ctx: Context<ClaimReward>) -> ProgramResult {
        let round = &ctx.accounts.round_result;
        let ticket = &ctx.accounts.lottery_ticket;

        let reward = {
            let num_match = count_matching(
                &ticket.lottery_number[0..round.lottery_len as usize],
                &round.lottery_result[0..round.lottery_len as usize],
            );

            round.reward_map_num_match_to_token[num_match]
        };

        // Return Ok from losing ticket to close the ticket account
        if reward == 0 {
            return Ok(());
        }

        let profit = reward.checked_sub(round.ticket_price).unwrap_or(0);
        let tax = profit * round.profit_tax_percentage as u64 / 100;
        let burn = tax * round.tax_burn_percentage as u64 / 100;
        let reward = reward - tax;
        let usable_tax = tax - burn;

        let (_, pda_bump) = Pubkey::find_program_address(&[PDA_SEED], ctx.program_id);

        msg!("Transfering token to user");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.result_pool.to_account_info(),
                    to: ctx.accounts.user_token.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&PDA_SEED[..], &[pda_bump]]]),
            reward,
        )?;

        msg!("Transfering tax to treasury");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.result_pool.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&PDA_SEED[..], &[pda_bump]]]),
            usable_tax,
        )?;

        msg!("Burning part of the tax");
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.result_pool.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&PDA_SEED[..], &[pda_bump]]]),
            burn,
        )?;

        Ok(())
    }

    pub fn clear_round_result(ctx: Context<ClearRoundResult>) -> ProgramResult {
        let (_, pda_bump) = Pubkey::find_program_address(&[PDA_SEED], ctx.program_id);

        msg!("Transfering remaining token in result pool to game pool");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.round_result_pool.to_account_info(),
                    to: ctx.accounts.pool.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&PDA_SEED[..], &[pda_bump]]]),
            ctx.accounts.round_result_pool.amount,
        )?;

        msg!("Closing result pool");
        token::close_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                CloseAccount {
                    account: ctx.accounts.round_result_pool.to_account_info(),
                    destination: ctx.accounts.pool.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&PDA_SEED[..], &[pda_bump]]]),
        )?;

        Ok(())
    }
}

fn count_matching(a: &[u8], b: &[u8]) -> usize {
    let mut i = 0;
    let mut j = 0;

    let mut count = 0;
    while i < a.len() && j < b.len() {
        if a[i] == b[j] {
            count += 1;
            i += 1;
            j += 1;
        } else if a[i] > b[j] {
            j += 1;
        } else {
            i += 1;
        }
    }

    count
}

#[cfg(test)]
#[test]
fn test_count_matching() {
    assert_eq!(count_matching(&[1, 2, 3, 4], &[5, 6, 7, 8]), 0);
    assert_eq!(count_matching(&[1, 3, 4, 7], &[2, 5, 6, 7]), 1);
    assert_eq!(count_matching(&[1, 3, 4, 6], &[4, 5, 6, 7]), 2);
    assert_eq!(count_matching(&[1, 3, 4, 6], &[3, 4, 5, 6]), 3);
    assert_eq!(count_matching(&[3, 4, 5, 6], &[3, 4, 5, 6]), 4);
}
