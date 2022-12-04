use crate::{account::*, error::GameError, state::*};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, CloseAccount, Transfer};
use chainlink_solana as chainlink;
use std::{
    convert::{TryFrom, TryInto},
    ops::Div,
};

declare_id!("SqFtqbsedB3HVwYd89wxTwL4UXV5JASq3JoPcApjNMJ");

mod account;
mod error;
mod state;

type ProgramResult = Result<()>;

const DECIMAL: u32 = 12;
const DIVISOR: u32 = 1000;
const PRECISION: u128 = 10000 * 100;
const STATE_PDA_SEED: &[u8] = b"program_state";

#[program]
pub mod price_predict {
    use super::*;

    pub fn init(
        ctx: Context<Init>,
        chainlink_program: Pubkey,
        chainlink_feed: Pubkey,
        profit_tax_percentage: u32,
        tax_burn_percentage: u32,
        min_bet_amount: u64,
        bonus_points: Vec<[u32; 2]>,
    ) -> ProgramResult {
        let mut bonus_points = bonus_points;
        // Sort descending
        bonus_points.sort_unstable_by_key(|v| std::cmp::Reverse(v[0]));

        *ctx.accounts.program_state = ProgramState {
            owner: ctx.accounts.owner.key(),
            mint: ctx.accounts.mint.key(),
            treasury: ctx.accounts.treasury.key(),
            round_result: Pubkey::default(),
            chainlink_program,
            chainlink_feed,
            profit_tax_percentage,
            tax_burn_percentage,
            min_bet_amount,
            bonus_points,
            stage: Stage::WaitNextRound as u8,
        };

        Ok(())
    }

    pub fn next_round(ctx: Context<NextRound>) -> ProgramResult {
        require!(
            ctx.accounts.program_state.stage == Stage::WaitNextRound as u8,
            GameError::InvalidStage
        );

        let price_start_stage = {
            let round = chainlink::latest_round_data(
                ctx.accounts.chainlink_program.to_account_info(),
                ctx.accounts.chainlink_feed.to_account_info(),
            )?;

            let decimals = chainlink::decimals(
                ctx.accounts.chainlink_program.to_account_info(),
                ctx.accounts.chainlink_feed.to_account_info(),
            )?;

            require!(decimals as u32 <= DECIMAL, GameError::NotEnoughDecimal);
            (round.answer as u128)
                .checked_mul(10u128.pow(DECIMAL - decimals as u32))
                .ok_or(GameError::IntegerOverflow)?
        };

        *ctx.accounts.round_result = RoundResult {
            pool: ctx.accounts.pool.key(),
            price_start_stage,
            price_end_stage: 0,
            sum_stake: 0,
            sum_stake_mul_score: 0,
            result_vec0: 0.0,
            unix_time_start_round: Clock::get()?.unix_timestamp as u64,
            unix_time_end_round: 0,
            finalized: 0,
        };
        ctx.accounts.program_state.stage = Stage::PredictStage as u8;
        ctx.accounts.program_state.round_result = ctx.accounts.round_result.key();

        msg!("price_start: {}", price_start_stage);
        Ok(())
    }

    pub fn predict(ctx: Context<Predict>, stake_amount: u64, predict_price: u128) -> ProgramResult {
        require!(
            ctx.accounts.program_state.stage == Stage::PredictStage as u8,
            GameError::InvalidStage
        );

        require!(
            stake_amount >= ctx.accounts.program_state.min_bet_amount,
            GameError::BetTooSmall
        );

        *ctx.accounts.prediction = Prediction {
            owner: ctx.accounts.user.key(),
            round_result: ctx.accounts.program_state.round_result,
            unix_time_predict: Clock::get()?.unix_timestamp as u64,
            stake_amount,
            predict_vector0: price_predict_to_vec0(
                ctx.accounts.round_result.price_start_stage,
                predict_price,
            )?,
            predict_price,
        };

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
            stake_amount,
        )?;

        emit!(ctx.accounts.prediction.to_predict_event());
        Ok(())
    }

    pub fn compute_round_result_start(ctx: Context<ComputeRoundResultStart>) -> ProgramResult {
        require!(
            ctx.accounts.program_state.stage == Stage::PredictStage as u8,
            GameError::InvalidStage
        );

        let price_end_stage = {
            let round = chainlink::latest_round_data(
                ctx.accounts.chainlink_program.to_account_info(),
                ctx.accounts.chainlink_feed.to_account_info(),
            )?;

            let decimals = chainlink::decimals(
                ctx.accounts.chainlink_program.to_account_info(),
                ctx.accounts.chainlink_feed.to_account_info(),
            )?;

            require!(decimals as u32 <= DECIMAL, GameError::NotEnoughDecimal);
            (round.answer as u128)
                .checked_mul(10u128.pow(DECIMAL - decimals as u32))
                .ok_or(GameError::IntegerOverflow)?
        };

        ctx.accounts.round_result.price_end_stage = price_end_stage;
        ctx.accounts.round_result.result_vec0 =
            price_predict_to_vec0(ctx.accounts.round_result.price_start_stage, price_end_stage)?;
        ctx.accounts.round_result.unix_time_end_round = Clock::get()?.unix_timestamp as u64;
        ctx.accounts.program_state.stage = Stage::ComputeStage as u8;

        msg!("price_end: {}", price_end_stage);
        Ok(())
    }

    pub fn compute_round_result_end(
        ctx: Context<ComputeRoundResultEnd>,
        sum_stake: u128,
        sum_stake_mul_score: u128,
    ) -> ProgramResult {
        require!(
            ctx.accounts.program_state.stage == Stage::ComputeStage as u8,
            GameError::InvalidStage
        );

        ctx.accounts.round_result.sum_stake = sum_stake;
        ctx.accounts.round_result.sum_stake_mul_score = sum_stake_mul_score;
        ctx.accounts.round_result.finalized = 1;
        ctx.accounts.program_state.stage = Stage::WaitNextRound as u8;

        Ok(())
    }

    pub fn claim_reward(ctx: Context<ClaimReward>, state_bump: u8) -> ProgramResult {
        require!(
            ctx.accounts.round_result.finalized == 1,
            GameError::InvalidStage,
        );

        let ProgramState {
            profit_tax_percentage,
            tax_burn_percentage,
            bonus_points,
            ..
        } = &**ctx.accounts.program_state;
        let profit_tax_percentage = *profit_tax_percentage;
        let tax_burn_percentage = *tax_burn_percentage;

        let mut score = score_from_vec0(
            ctx.accounts.prediction.predict_vector0,
            ctx.accounts.round_result.result_vec0,
        );

        let time_before_finalize = ctx.accounts.round_result.unix_time_end_round
            - ctx.accounts.prediction.unix_time_predict;
        for [time, bonus_point] in bonus_points.iter().copied() {
            if time_before_finalize >= time as u64 {
                score += bonus_point;
                break;
            }
        }

        let reward: u64 = (score as u128)
            .checked_mul(ctx.accounts.prediction.stake_amount as u128)
            .ok_or(GameError::IntegerOverflow)?
            .checked_mul(ctx.accounts.round_result.sum_stake)
            .ok_or(GameError::IntegerMultiplyOverflow)?
            .div(ctx.accounts.round_result.sum_stake_mul_score)
            .try_into()
            .map_err(|_| GameError::IntegerConvertOverflow)?;

        let profit = reward
            .checked_sub(ctx.accounts.prediction.stake_amount)
            .unwrap_or(0);

        let tax = profit * profit_tax_percentage as u64 / DIVISOR as u64;
        let burn = tax * tax_burn_percentage as u64 / DIVISOR as u64;
        let reward = reward - tax;
        let usable_tax = tax - burn;

        msg!("Transfering token to user");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool.to_account_info(),
                    to: ctx.accounts.user_token.to_account_info(),
                    authority: ctx.accounts.program_state.to_account_info(),
                },
            )
            .with_signer(&[&[&STATE_PDA_SEED[..], &[state_bump]]]),
            reward,
        )?;

        msg!("Transfering tax to treasury");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                    authority: ctx.accounts.program_state.to_account_info(),
                },
            )
            .with_signer(&[&[&STATE_PDA_SEED[..], &[state_bump]]]),
            usable_tax,
        )?;

        msg!("Burning part of the tax");
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.pool.to_account_info(),
                    authority: ctx.accounts.program_state.to_account_info(),
                },
            )
            .with_signer(&[&[&STATE_PDA_SEED[..], &[state_bump]]]),
            burn,
        )?;

        emit!(ctx.accounts.prediction.to_claim_event(reward, tax, score));
        Ok(())
    }

    pub fn clear_round_result(ctx: Context<ClearRoundResult>, state_bump: u8) -> ProgramResult {
        require!(
            ctx.accounts.round_result.finalized == 1,
            GameError::InvalidStage,
        );

        require!(
            Clock::get()?.unix_timestamp as u64 - ctx.accounts.round_result.unix_time_end_round
                > 30 * 24 * 60 * 60, /* 30 day */
            GameError::TooSoon,
        );

        msg!("Transfering remaining token in pool to treasury");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                    authority: ctx.accounts.program_state.to_account_info(),
                },
            )
            .with_signer(&[&[&STATE_PDA_SEED[..], &[state_bump]]]),
            ctx.accounts.pool.amount,
        )?;

        msg!("Closing result pool");
        token::close_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                CloseAccount {
                    account: ctx.accounts.pool.to_account_info(),
                    destination: ctx.accounts.treasury.to_account_info(),
                    authority: ctx.accounts.program_state.to_account_info(),
                },
            )
            .with_signer(&[&[&STATE_PDA_SEED[..], &[state_bump]]]),
        )?;

        Ok(())
    }
}

// result = price_end / (price_start + price_end)
fn price_predict_to_vec0(price_start: u128, price_end: u128) -> Result<f64> {
    let vec0 = u32::try_from(
        price_end
            .checked_mul(PRECISION as u128)
            .ok_or(GameError::IntegerMultiplyOverflow)?
            .div(price_start + price_end),
    )
    .map_err(|_| GameError::IntegerConvertOverflow)?;

    Ok(vec0 as f64 * 100.0 / PRECISION as f64)
}

fn score_from_vec0(predict: f64, actual: f64) -> u32 {
    let predict = [predict, 100.0 - predict];
    let actual = [actual, 100.0 - actual];

    let dot_product = predict[0] * actual[0] + predict[1] * actual[1];
    let vec_len = f64::sqrt(predict[0].powi(2) + predict[1].powi(2))
        * f64::sqrt(actual[0].powi(2) + actual[1].powi(2));

    let angle = f64::acos(dot_product / vec_len);
    if angle <= std::f64::consts::PI / 1000.0 {
        1000
    } else {
        (std::f64::consts::PI / angle).round() as u32
    }
}

#[cfg(test)]
mod test {
    use super::{price_predict_to_vec0, score_from_vec0};

    #[test]
    fn score() {
        let price_start = 2800;
        let actual_vec0 = price_predict_to_vec0(price_start, 3000).unwrap();
        for i in 2880..=2920 {
            let vec0 = price_predict_to_vec0(price_start, i).unwrap();
            println!(
                "{} => {:.4} => {}",
                i,
                vec0,
                score_from_vec0(vec0, actual_vec0)
            );
        }
    }
}
