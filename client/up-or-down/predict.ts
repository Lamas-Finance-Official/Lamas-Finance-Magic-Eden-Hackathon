import { BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CONFIG, getProgramState, getRoundResult, program, provider, STAGE } from './config';

(async () => {
	const isUp = Math.round(Math.random()) % 2 == 0;

	console.log('Fetching ProgramState...');
	const programState = await getProgramState();
	const state = await program.account.programState.fetch(programState);
	const numRound = state.roundCounter.toNumber();

	console.log('Searching for playable round...');
	let roundIdx = -1;
	let roundPubkey;
	let roundResult;
	for (roundIdx = numRound - 5; roundIdx <= numRound; roundIdx++) {
		if (roundIdx < 0)
		 	continue;

		try {
			roundPubkey = await getRoundResult(roundIdx);
			roundResult = await program.account.roundResult.fetch(roundPubkey);
			if (roundResult.stage === STAGE.PREDICTION) {
				break;
			}
		} catch (ex) {
			// Most likely account not found, ignore
		}
	}

	if (roundIdx < 0) {
		console.log('No round found');
		return;
	}

	console.log(`Predicting the price will go ${isUp ? 'UP' : 'DOWN'} for round ${roundIdx}`);

	const predict = Keypair.generate();
	console.log('Storing prediction in:', predict.publicKey.toBase58());

	console.log('Executing...');
	const tx = await program.methods
		.predict(isUp, new BN(5 * LAMPORTS_PER_SOL))
		.accounts({
			user: CONFIG.USER.publicKey,
			userToken: CONFIG.USER_TOKEN,
			programState,
			round: roundPubkey,
			pool: roundResult.pool,
			prediction: predict.publicKey,
			tokenProgram: TOKEN_PROGRAM_ID,
			systemProgram: SystemProgram.programId,
		})
		.signers([CONFIG.USER, predict])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});
	console.log(trans.meta.logMessages);
})();
