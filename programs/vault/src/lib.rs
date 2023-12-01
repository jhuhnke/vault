use anchor_lang::prelude::*;

declare_id!("APdp1uxa4UKMutUDnKXGJ67ecLaLhvNgDZwUJ4hTpCTC");

#[program]
pub mod vault {
    use anchor_lang::system_program::{Transfer, transfer};

    use super::*;

    pub fn deposit(ctx: Context<Vault>, lamports: u64) -> Result<()> {
        let accounts = Transfer {
            from: ctx.accounts.owner.to_account_info(), 
            to: ctx.accounts.vault.to_account_info()
        };

        let cpi = CpiContext::new(
            ctx.accounts.system_program.to_account_info(), 
            accounts
        );

        transfer(cpi, lamports)
    }

    pub fn withdraw(ctx: Context<Vault>, lamports: u64) -> Result<()> {
        let accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(), 
            to: ctx.accounts.owner.to_account_info()
        };

        let signer_seeds: [&[&[u8]]; 1] = [&[
            b"vault", 
            &ctx.accounts.owner.to_account_info().key.as_ref(), 
            &[ctx.bumps.vault]
        ]]; 

        let cpi = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(), 
            accounts, 
            &signer_seeds,
        );

        transfer(cpi, lamports)
    }
}

#[derive(Accounts)]
pub struct Vault<'info> {
    #[account(mut)]
    owner: Signer<'info>, 
    #[account(
        mut, 
        seeds = [b"vault", owner.key().as_ref()], 
        bump
    )]
    vault: SystemAccount<'info>, 
    system_program: Program<'info, System>
}