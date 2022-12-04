import { CONFIG, getProgramStatePDA, program, provider } from './config';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { EventParser } from '@project-serum/anchor';

(async () => {
	const [statePubkey, stateBump] = await getProgramStatePDA();
	const state = await program.account.programState.fetch(statePubkey, 'confirmed');

	const predictions = await program.account.prediction.all([
		{
			memcmp: {
				offset: 8,
				bytes: CONFIG.USER.publicKey.toBase58(),
			}
		}
	]);

	console.log(`User make ${predictions.length} prediction`);
	for (const prediction of predictions) {
		console.log(
			`Claiming ${prediction.publicKey.toBase58()}` +
			`\n\tround=${prediction.account.roundResult.toBase58()}` +
			`\n\ttime=${new Date(prediction.account.unixTimePredict.toNumber() * 1000)}` +
			`\n\tstake=${prediction.account.stakeAmount.toString(10)}` +
			`\n\tvec0=${prediction.account.predictVector0.toString(10)}` +
			`\n\tpredictPrice=${prediction.account.predictPrice.toString(10)}`
		);

		const round = await program.account.roundResult.fetch(prediction.account.roundResult, 'confirmed');

		console.log('Executing...');
		const tx = await program.methods.claimReward(stateBump).accounts({
			user: CONFIG.USER.publicKey,
			userToken: CONFIG.USER_TOKEN,
			programState: statePubkey,
			roundResult: prediction.account.roundResult,
			prediction: prediction.publicKey,
			mint: state.mint,
			pool: round.pool,
			treasury: state.treasury,
			tokenProgram: TOKEN_PROGRAM_ID,
		})
		.signers([CONFIG.USER])
		.rpc({ commitment: 'confirmed' });

		console.log('Fetching transaction logs...');
		const trans = await provider.connection.getTransaction(tx, {
			commitment: 'confirmed',
		});

		const logs = trans?.meta?.logMessages;
		if (!logs)
		{
			console.log('Trans has no log', tx, trans);
			continue;
		}

		const eventParser = new EventParser(program.programId, program.coder);
		eventParser.parseLogs(logs, (event) => {
			console.log('Event', event);
		});

		console.log(logs);
	}
})();
