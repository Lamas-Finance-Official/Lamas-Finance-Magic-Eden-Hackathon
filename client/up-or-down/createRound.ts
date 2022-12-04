import { BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, createAccount as createTokenAccount } from '@solana/spl-token';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { CONFIG, getPdaAuthority, getProgramState, getRoundResult, program, provider } from './config';

(async () => {
	console.log('Fetching ProgramState...');
	const programState = await getProgramState();
	const state = await program.account.programState.fetch(programState);
	const numRound = state.roundCounter.toNumber();

	console.log(
		`Starting a new round with ${CONFIG.TAX_PERCENTAGE}% tax and will burn ${CONFIG.BURN_PERCENTAGE}% of the collected tax`
	);

	console.log('Getting PDA Authority...');
	const pdaAuthority = await getPdaAuthority();

	const nextRoundResult = await getRoundResult(numRound)
	console.log('Round result:', numRound, nextRoundResult.toBase58());

	const nextRoundPool = Keypair.generate();
	console.log('Round pool:', nextRoundPool.publicKey.toBase58());
	const timeStart = Math.ceil(Date.now() / (30 * 60 * 1000)) * 30 * 60;

	console.log('Executing...');
	const tx = await program.methods
		.createRound(
			new BN(CONFIG.MIN_BET_AMOUNT),
			new BN(CONFIG.TAX_PERCENTAGE),
			new BN(CONFIG.BURN_PERCENTAGE),
			new BN(timeStart),
			new BN(timeStart + 15 * 60),
			new BN(timeStart * 30 * 60),
		)
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			programState,
			round: nextRoundResult,
			pool: nextRoundPool.publicKey,
			poolAuthority: pdaAuthority,
			mint: CONFIG.MINT,
			tokenProgram: TOKEN_PROGRAM_ID,
			systemProgram: SystemProgram.programId
		})
		.signers([CONFIG.OWNER, nextRoundPool])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});
	console.log(trans.meta.logMessages);
})();
