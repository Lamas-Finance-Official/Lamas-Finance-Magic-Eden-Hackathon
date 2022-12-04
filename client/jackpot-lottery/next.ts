import { BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, createAccount as createTokenAccount } from '@solana/spl-token';
import { Keypair, PublicKey } from '@solana/web3.js';
import { CONFIG, createAccountInstruction, program, provider } from './config';

(async () => {
	const nextRoundResult = Keypair.generate();
	console.log(
		`Starting a new round with ${CONFIG.TAX_PERCENTAGE}% tax and will burn ${CONFIG.BURN_PERCENTAGE}% of the collected tax\n` +
			`Lottery: len=${CONFIG.LOTTERY_TICKET_LEN}, num=1-${CONFIG.LOTTERY_TICKET_MAX_NUM}\n` +
			`Ticket price: ${CONFIG.TICKET_PRICE}`
	);
	console.log('Round result:', nextRoundResult.publicKey.toBase58());

	console.log('Creating a ResultPool token account...');
	const nextRoundPool = await createTokenAccount(
		provider.connection,
		CONFIG.OWNER,
		new PublicKey(CONFIG.MINT),
		CONFIG.OWNER.publicKey,
		Keypair.generate()
	);

	console.log('Executing...');
	const tx = await program.methods
		.nextRound(
			CONFIG.TAX_PERCENTAGE,
			CONFIG.BURN_PERCENTAGE,
			new BN(CONFIG.TICKET_PRICE),
			CONFIG.LOTTERY_TICKET_MAX_NUM,
			CONFIG.LOTTERY_TICKET_LEN,
			CONFIG.REWARD_DISTRIBUTION_PERCENTAGE
		)
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			state: CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE,
			nextRoundResult: nextRoundResult.publicKey,
			nextRoundPool: nextRoundPool,
			tokenProgram: TOKEN_PROGRAM_ID,
		})
		.preInstructions([await createAccountInstruction(program.account.lotteryRoundResult, nextRoundResult)])
		.signers([CONFIG.OWNER, nextRoundResult])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});
	console.log(trans.meta.logMessages);
})();
