import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CONFIG, getPdaAuthority, getProgramState, program, provider, STAGE } from './config';

(async () => {
	console.log('Fetching all round result...');
	const roundResults = await program.account.roundResult.all();
	console.log(`Found ${roundResults.length} round result`);

	console.log('Fetching ProgramState...');
	const programState = await getProgramState();
	const state = await program.account.programState.fetch(programState);
	console.log('Current round:', state.roundCounter.toNumber());

	for (const roundResult of roundResults) {
		if (roundResult.account.stage === STAGE.ENDED || roundResult.account.stage === STAGE.CANCELED) {
			console.log('Skiping round result', roundResult.account.roundIndex.toNumber(), roundResult.publicKey.toBase58());
			continue;
		}

		console.log('Canceling', roundResult.account.roundIndex.toNumber(), roundResult.publicKey.toBase58());
		const tx = await program.methods
			.cancelRound()
			.accounts({
				owner: CONFIG.OWNER.publicKey,
				programState,
				round: roundResult.publicKey,
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
