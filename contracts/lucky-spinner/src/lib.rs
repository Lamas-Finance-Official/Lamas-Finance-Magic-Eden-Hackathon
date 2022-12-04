use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, spl_token::instruction::AuthorityType, Burn, Mint, SetAuthority, Token, TokenAccount,
    Transfer,
};

declare_id!("DEoxdV1CCWvbeGp8PpwkUifmm3pV5AgtFwFaS4P7qZeZ");

/// Tax and multiplier decimal value
const DECIMAL: u64 = 1000000;

const POOL_OWNER_PDA_SEED: &[u8] = b"lamas_finance";
const PROGRAM_STATE_PDA_SEED: &[u8] = b"lamas_program_state";

type ProgramResult = Result<()>;

#[program]
pub mod lucky_spinner {
    use super::*;

    pub fn init(
        ctx: Context<Initialize>,
        profit_tax_percentage: u64,
        tax_burn_percentage: u64,
        min_bet_amount: u64,
        rates: Vec<[u64; 2]>,
    ) -> ProgramResult {
        // Init program state
        **ctx.accounts.program_state = ProgramState {
            owner: ctx.accounts.owner.key(),
            mint: ctx.accounts.mint.key(),
            pool: ctx.accounts.pool.key(),
            treasury: ctx.accounts.treasury.key(),
            profit_tax_percentage,
            tax_burn_percentage,
            min_bet_amount,
            rates,
        };

        // Update pools owner
        let (authority, _) = Pubkey::find_program_address(&[POOL_OWNER_PDA_SEED], ctx.program_id);

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

    pub fn update(
        ctx: Context<Update>,
        profit_tax_percentage: u64,
        tax_burn_percentage: u64,
        min_bet_amount: u64,
        rates: Vec<[u64; 2]>,
    ) -> ProgramResult {
        ctx.accounts.program_state.profit_tax_percentage = profit_tax_percentage;
        ctx.accounts.program_state.tax_burn_percentage = tax_burn_percentage;
        ctx.accounts.program_state.min_bet_amount = min_bet_amount;
        ctx.accounts.program_state.rates = rates;
        Ok(())
    }

    pub fn spin(ctx: Context<Spin>, amount: u64) -> ProgramResult {
        require!(
            amount >= ctx.accounts.program_state.min_bet_amount,
            GameError::BetTooSmall
        );

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

        vrf_lib::request_random(
            instruction::OnVrfFulfilled {
                result: vrf_lib::VrfResult::default(),
                amount,
            },
            vec![
                vrf_lib::account_meta(&ctx.accounts.user).mutable(),
                vrf_lib::account_meta(&ctx.accounts.user_token).mutable(),
                vrf_lib::account_meta(&ctx.accounts.program_state.key()).mutable(),
                vrf_lib::account_meta(&ctx.accounts.mint).mutable(),
                vrf_lib::account_meta(&ctx.accounts.pool).mutable(),
                vrf_lib::account_meta(&ctx.accounts.treasury).mutable(),
                vrf_lib::account_meta(&ctx.accounts.token_program.key()),
                vrf_lib::account_meta(&ctx.accounts.pda_authority),
                vrf_lib::account_meta(&ctx.accounts.vrf_lock).mutable(),
            ],
        );

        Ok(())
    }

    pub fn on_vrf_fulfilled(
        ctx: Context<VrfFulfilled>,
        result: vrf_lib::VrfResult,
        amount: u64,
    ) -> Result<()> {
        let request_trans = result.request_transaction;
        let multiplier = random_rates(&ctx.accounts.program_state.rates, result);

        emit!(SpinResult {
            request_trans,
            user: ctx.accounts.user.key(),
            bet_amount: amount,
            multiplier,
            decimal: DECIMAL
        });

        let reward = u64::try_from((amount as u128 * multiplier as u128) / DECIMAL as u128)
            .map_err(|_| GameError::IntegerOverflow)?;

        let tax = if reward > amount {
            u64::try_from(
                (reward - amount) as u128
                    * ctx.accounts.program_state.profit_tax_percentage as u128
                    / DECIMAL as u128,
            )
            .map_err(|_| GameError::IntegerOverflow)?
        } else {
            0
        };

        let burn = u64::try_from(
            tax as u128 * ctx.accounts.program_state.tax_burn_percentage as u128 / DECIMAL as u128,
        )
        .map_err(|_| GameError::IntegerOverflow)?;
        let reward = reward - tax;
        let usable_tax = tax - burn;

        let (_, pda_bump) = Pubkey::find_program_address(&[POOL_OWNER_PDA_SEED], ctx.program_id);

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
            .with_signer(&[&[&POOL_OWNER_PDA_SEED[..], &[pda_bump]]]),
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
            .with_signer(&[&[&POOL_OWNER_PDA_SEED[..], &[pda_bump]]]),
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
            .with_signer(&[&[&POOL_OWNER_PDA_SEED[..], &[pda_bump]]]),
            burn,
        )?;

        Ok(())
    }
}

#[event]
pub struct SpinResult {
    pub request_trans: [u8; 64],
    pub user: Pubkey,
    pub bet_amount: u64,
    pub multiplier: u64,
    pub decimal: u64,
}

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
    #[msg("Violated pool constraint")]
    ViolatedPoolConstraint,
    #[msg("Violated treasury constraint")]
    ViolatedTreasuryConstraint,
}

#[account]
pub struct ProgramState {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub pool: Pubkey,
    pub treasury: Pubkey,

    pub profit_tax_percentage: u64,
    pub tax_burn_percentage: u64,
    pub min_bet_amount: u64,

    pub rates: Vec<[u64; 2]>,
}

impl ProgramState {
    const SPACE: usize =
        32 * 4 // Pubkey
        + 8 * 4 // u64
        + 4 + (8 + 8) * 16 // Vec - max 16 element
        ;
}

#[account]
pub struct VrfLock {}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(init, payer = owner, space = 8 + ProgramState::SPACE, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Box<Account<'info, ProgramState>>,

    pub mint: Account<'info, Mint>,
    #[account(mut, constraint = pool.mint == mint.key() @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = treasury.mint == mint.key() @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Spin<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, constraint = user_token.mint == program_state.mint @ GameError::InvalidUserToken)]
    pub user_token: Account<'info, TokenAccount>,

    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Box<Account<'info, ProgramState>>,

    #[account(mut, constraint = mint.key() == program_state.mint @ GameError::InvalidMint)]
    pub mint: Account<'info, Mint>,
    #[account(mut, constraint = pool.key() == program_state.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = treasury.key() == program_state.treasury @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,

    /// CHECK: checked using PDA
    #[account(seeds = [POOL_OWNER_PDA_SEED], bump)]
    pub pda_authority: AccountInfo<'info>,

    /// CHECK
    #[account(init_if_needed, payer = user, space = 8, seeds = [b"vrf-lock", &user.key().to_bytes()[..]], bump)]
    pub vrf_lock: Account<'info, VrfLock>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VrfFulfilled<'info> {
    #[account(mut, constraint = owner.key() == program_state.owner @ GameError::InvalidOwner)]
    pub owner: Signer<'info>,
    /// CHECK
    #[account(mut)]
    pub user: AccountInfo<'info>,
    #[account(mut, constraint = user_token.mint == program_state.mint @ GameError::InvalidUserToken)]
    pub user_token: Account<'info, TokenAccount>,

    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Box<Account<'info, ProgramState>>,

    #[account(mut, constraint = mint.key() == program_state.mint @ GameError::InvalidMint)]
    pub mint: Account<'info, Mint>,
    #[account(mut, constraint = pool.key() == program_state.pool @ GameError::ViolatedPoolConstraint)]
    pub pool: Account<'info, TokenAccount>,
    #[account(mut, constraint = treasury.key() == program_state.treasury @ GameError::ViolatedTreasuryConstraint)]
    pub treasury: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,

    /// CHECK: checked using PDA
    #[account(seeds = [POOL_OWNER_PDA_SEED], bump)]
    pub pda_authority: AccountInfo<'info>,

    /// CHECK
    #[account(mut, close = user, seeds = [b"vrf-lock", &user.key().to_bytes()[..]], bump)]
    pub vrf_lock: Account<'info, VrfLock>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, seeds = [PROGRAM_STATE_PDA_SEED], bump)]
    pub program_state: Box<Account<'info, ProgramState>>,
}

fn random_rates(rates: &[[u64; 2]], random: vrf_lib::VrfResult) -> u64 {
    let sum: u64 = rates.iter().map(|v| v[0]).sum();
    let mut sum = random.bound(0..=sum);

    for [weight, multiplier] in rates.iter().copied() {
        if sum < weight {
            return multiplier;
        }

        sum -= weight;
    }

    0
}
