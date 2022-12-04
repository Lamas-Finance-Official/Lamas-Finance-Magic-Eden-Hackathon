import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CONFIG, getPdaAuthority, getProgramState, program, provider, STAGE } from './config';

(async () => {
	console.log('Fetching all round result...');
	const roundResults = await program.account.roundResult.all();
	console.log(`Found ${roundResults.length} round result`);

	console.log('Fetching ProgramState...');
	const programState = await getProgramState();
	const state = await program.account.programState.fetch(programState);
	console.log('Current round:', state.roundCounter.toNumber() - 1);

	console.log('Getting PDA Authority...');
	const pdaAuthority = await getPdaAuthority();

	const deleteRoundCreateBefore = Date.now() / 1000 - 48 * 60 * 60;
	console.log('Delete round create before: ', new Date(deleteRoundCreateBefore * 1000));
	for (const roundResult of roundResults) {
		if (roundResult.account.unixTimeStartRound.toNumber() > deleteRoundCreateBefore) {
			console.log('Skiping round result', roundResult.account.roundIndex.toNumber(), roundResult.publicKey.toBase58(), `stage=${roundResult.account.stage}`);
			continue;
		}

		if (roundResult.account.stage !== STAGE.ENDED && roundResult.account.stage !== STAGE.CANCELED) {
			console.log('Skiping round result', roundResult.account.roundIndex.toNumber(), roundResult.publicKey.toBase58(), `stage=${roundResult.account.stage}`);
			continue;
		}

		console.log('Clearing', roundResult.account.roundIndex.toNumber(), roundResult.publicKey.toBase58());
		const tx = await program.methods
			.clearRoundResult()
			.accounts({
				owner: CONFIG.OWNER.publicKey,
				programState,
				round: roundResult.publicKey,
				pool: roundResult.account.pool,
				treasury: CONFIG.TREASURY,
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
