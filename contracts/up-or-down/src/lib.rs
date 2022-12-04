use crate::{
    account::*,
    decimal::Decimal,
    error::GameError,
    state::{GameStage, Prediction, ProgramState, RoundResult},
};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, CloseAccount, Transfer};
use chainlink_solana as chainlink;

declare_id!("BbCEshx6obrBjzWPXBRxq99GcFVPB8ioe48pUYr711zy");

mod account;
mod decimal;
mod error;
mod state;

type ProgramResult = Result<()>;

#[cfg(feature = "timing-error")]
const TIMING_ERROR_S: i64 = 10;

#[program]
pub mod up_or_down {
    use super::*;

    pub const POOL_OWNER_SEED: &[u8] = b"lamas_finance";
    pub const PROGRAM_STATE_PDA_SEED: &[u8] = b"state";
    pub const ROUND_PDA_SEED: &[u8] = b"round";

    pub fn init(ctx: Context<Initialize>) -> ProgramResult {
        // Init program state
        **ctx.accounts.program_state = ProgramState {
            owner: ctx.accounts.owner.key(),
            mint: ctx.accounts.mint.key(),
            treasury: ctx.accounts.treasury.key(),
            round_counter: 1,
        };

        Ok(())
    }

    pub fn create_round(
        ctx: Context<CreateRound>,
        min_bet_amount: u64,
        profit_tax_percentage: u64,
        tax_burn_percentage: u64,
        unix_time_start_round: u64,
        unix_time_start_live_stage: u64,
        unix_time_end_live_stage: u64,
    ) -> ProgramResult {
        let round_index = {
            let round_index = ctx.accounts.program_state.round_counter;
            ctx.accounts.program_state.round_counter += 1;
            round_index
        };

        *ctx.accounts.round = RoundResult {
            round_index,
            pool: ctx.accounts.pool.key(),
            up_pool_value: 0,
            down_pool_value: 0,
            did_up_win: false,
            min_bet_amount,
            profit_tax_percentage,
            tax_burn_percentage,
            price_end_predict_stage: Decimal::default(),
            price_end_live_stage: Decimal::default(),
            unix_time_start_round,
            unix_time_start_live_stage,
            unix_time_end_live_stage,
            stage: GameStage::WaitStartRound as u8,
        };

        Ok(())
    }

    pub fn start_round(ctx: Context<StartRound>, init_pool_amount: u64) -> ProgramResult {
        require!(
            ctx.accounts.round.stage == GameStage::WaitStartRound as u8,
            GameError::InvalidStage
        );

        let now = Clock::get()?.unix_timestamp;
        #[cfg(feature = "timing-error")]
        if (ctx.accounts.round.unix_time_start_round as i64 - now).abs() > TIMING_ERROR_S {
            return Err(GameError::TimingError.into());
        }

        ctx.accounts.round.stage = GameStage::Prediction as u8;
        ctx.accounts.round.unix_time_start_round = now as u64;

        msg!("Transfering init amount from treasury to pool");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.treasury.to_account_info(),
                    to: ctx.accounts.pool.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            init_pool_amount,
        )?;

        ctx.accounts.round.up_pool_value = init_pool_amount / 2;
        ctx.accounts.round.down_pool_value = init_pool_amount - ctx.accounts.round.up_pool_value;

        Ok(())
    }

    pub fn predict(ctx: Context<Predict>, is_up: bool, amount: u64) -> ProgramResult {
        require!(
            ctx.accounts.round.stage == GameStage::Prediction as u8,
            GameError::InvalidStage
        );
        require!(
            amount >= ctx.accounts.round.min_bet_amount,
            GameError::BetTooSmall
        );

        // Store prediction
        *ctx.accounts.prediction = Prediction {
            owner: ctx.accounts.user.key(),
            result: ctx.accounts.round.key(),
            is_up,
            amount,
        };

        if is_up {
            ctx.accounts.round.up_pool_value += amount;
        } else {
            ctx.accounts.round.down_pool_value += amount;
        }

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
            amount,
        )?;

        Ok(())
    }

    pub fn finalize_prediction_stage(ctx: Context<FinalizePredictionStage>) -> ProgramResult {
        require!(
            ctx.accounts.round.stage == GameStage::Prediction as u8,
            GameError::InvalidStage
        );

        let now = Clock::get()?.unix_timestamp;
        #[cfg(feature = "timing-error")]
        if (ctx.accounts.round.unix_time_start_live_stage as i64 - now).abs() > TIMING_ERROR_S {
            return Err(GameError::TimingError.into());
        }

        let decimal = {
            let round = chainlink::latest_round_data(
                ctx.accounts.chainlink_program.to_account_info(),
                ctx.accounts.chainlink_feed.to_account_info(),
            )?;

            let decimals = chainlink::decimals(
                ctx.accounts.chainlink_program.to_account_info(),
                ctx.accounts.chainlink_feed.to_account_info(),
            )?;

            Decimal::new(round.answer, u32::from(decimals))
        };

        msg!("Price at prediction stage: {}", &decimal);
        ctx.accounts.round.stage = GameStage::Live as u8;
        ctx.accounts.round.price_end_predict_stage = decimal;
        ctx.accounts.round.unix_time_start_live_stage = now as u64;

        Ok(())
    }

    pub fn finalize_live_stage(ctx: Context<FinalizeLiveStage>) -> ProgramResult {
        require!(
            ctx.accounts.round.stage == GameStage::Live as u8,
            GameError::InvalidStage
        );

        let now = Clock::get()?.unix_timestamp;
        #[cfg(feature = "timing-error")]
        if (ctx.accounts.round.unix_time_end_live_stage as i64 - now).abs() > TIMING_ERROR_S {
            return Err(GameError::TimingError.into());
        }

        let decimal = {
            let round = chainlink::latest_round_data(
                ctx.accounts.chainlink_program.to_account_info(),
                ctx.accounts.chainlink_feed.to_account_info(),
            )?;

            let decimals = chainlink::decimals(
                ctx.accounts.chainlink_program.to_account_info(),
                ctx.accounts.chainlink_feed.to_account_info(),
            )?;

            Decimal::new(round.answer, u32::from(decimals))
        };

        msg!("Price at live stage: {}", &decimal);
        ctx.accounts.round.stage = GameStage::Ended as u8;
        ctx.accounts.round.price_end_live_stage = decimal;
        ctx.accounts.round.did_up_win =
            ctx.accounts.round.price_end_live_stage > ctx.accounts.round.price_end_predict_stage;
        ctx.accounts.round.unix_time_end_live_stage = now as u64;

        Ok(())
    }

    pub fn claim_reward(ctx: Context<ClaimReward>) -> ProgramResult {
        require!(
            ctx.accounts.round.to_account_info().owner == &crate::id(),
            GameError::InvalidOwner
        );

        require!(
            ctx.accounts.round.stage == GameStage::Ended as u8
                || ctx.accounts.round.stage == GameStage::Canceled as u8,
            GameError::InvalidStage
        );

        let (_, pda_bump) = Pubkey::find_program_address(&[POOL_OWNER_SEED], ctx.program_id);
        if ctx.accounts.round.stage == GameStage::Canceled as u8 {
            msg!("Returning token to user");

            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.pool.to_account_info(),
                        to: ctx.accounts.user_token.to_account_info(),
                        authority: ctx.accounts.pda_authority.to_account_info(),
                    },
                )
                .with_signer(&[&[&POOL_OWNER_SEED[..], &[pda_bump]]]),
                ctx.accounts.prediction.amount,
            )?;

            return Ok(());
        }

        // Return Ok on incorrect prediction to close the prediction account
        if ctx.accounts.prediction.is_up != ctx.accounts.round.did_up_win {
            msg!("Incorrect prediction");
            return Ok(());
        }

        let RoundResult {
            did_up_win,
            up_pool_value,
            down_pool_value,
            profit_tax_percentage,
            tax_burn_percentage,
            ..
        } = **ctx.accounts.round;

        let reward: u64 = {
            let dividend = (up_pool_value as u128 + down_pool_value as u128)
                * ctx.accounts.prediction.amount as u128;

            let reward = if did_up_win {
                dividend / up_pool_value as u128
            } else {
                dividend / down_pool_value as u128
            };

            u64::try_from(reward).map_err(|_| GameError::IntegerOverflow)?
        };

        let profit = reward
            .checked_sub(ctx.accounts.prediction.amount)
            .unwrap_or(0);

        let tax = profit * profit_tax_percentage / 100;
        let burn = tax * tax_burn_percentage / 100;
        let reward = reward - tax;
        let usable_tax = tax - burn;

        msg!("Transfering token to user");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool.to_account_info(),
                    to: ctx.accounts.user_token.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&POOL_OWNER_SEED[..], &[pda_bump]]]),
            reward,
        )?;

        msg!("Transfering tax to treasury");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&POOL_OWNER_SEED[..], &[pda_bump]]]),
            usable_tax,
        )?;

        msg!("Burning part of the tax");
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.pool.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&POOL_OWNER_SEED[..], &[pda_bump]]]),
            burn,
        )?;

        Ok(())
    }

    pub fn cancel_round(ctx: Context<CancelRound>) -> ProgramResult {
        require!(
            ctx.accounts.round.stage != GameStage::Ended as u8
                && ctx.accounts.round.stage != GameStage::Canceled as u8,
            GameError::InvalidStage
        );

        ctx.accounts.round.stage = GameStage::Canceled as u8;
        Ok(())
    }

    pub fn clear_round_result(ctx: Context<ClearRoundResult>) -> ProgramResult {
        require!(
            ctx.accounts.round.stage == GameStage::Ended as u8
                || ctx.accounts.round.stage == GameStage::Canceled as u8,
            GameError::InvalidStage
        );

        let (_, pda_bump) = Pubkey::find_program_address(&[POOL_OWNER_SEED], ctx.program_id);

        msg!("Transfering remaining token in pool to treasury");
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&POOL_OWNER_SEED[..], &[pda_bump]]]),
            ctx.accounts.pool.amount,
        )?;

        msg!("Closing result pool");
        token::close_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                CloseAccount {
                    account: ctx.accounts.pool.to_account_info(),
                    destination: ctx.accounts.treasury.to_account_info(),
                    authority: ctx.accounts.pda_authority.to_account_info(),
                },
            )
            .with_signer(&[&[&POOL_OWNER_SEED[..], &[pda_bump]]]),
        )?;

        Ok(())
    }
}
