import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CONFIG, getPdaAuthority, program, provider } from './config';

(async () => {
	console.log('Fetching all round result...');
	const roundResults = await program.account.lotteryRoundResult.all();
	console.log(`Found ${roundResults.length} round result`);

	console.log('Fetching ProgramState...');
	const programState = await program.account.lotteryState.fetch(CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE, 'confirmed');
	console.log('Current round:', programState.roundResult.toBase58());

	console.log('Getting PDA Authority...');
	const pdaAuthority = await getPdaAuthority();

	for (const roundResult of roundResults) {
		const timeStartRound = new Date(roundResult.account.unixTimeStartRound.toNumber() * 1000);
		const timeEndRound = new Date(roundResult.account.unixTimeEndRound.toNumber() * 1000);

		if (roundResult.publicKey.equals(programState.roundResult)) {
			console.log('Skipped round result', roundResult.publicKey.toBase58());
			continue;
		}

		console.log('Clearing', roundResult.publicKey.toBase58());
		const tx = await program.methods
			.clearRoundResult()
			.accounts({
				owner: CONFIG.OWNER.publicKey,
				state: CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE,
				pool: roundResult.account.pool,
				roundResult: roundResult.publicKey,
				roundResultPool: roundResult.account.pool,
				pdaAuthority: pdaAuthority,
				tokenProgram: TOKEN_PROGRAM_ID,
			})
			.signers([CONFIG.OWNER])
			.rpc({ commitment: 'confirmed' });

		console.log('Fetching transaction logs...');
		const trans = await provider.connection.getTransaction(tx, {
			commitment: 'confirmed',
		});
		console.log(trans.meta.logMessages);
	}
})();
