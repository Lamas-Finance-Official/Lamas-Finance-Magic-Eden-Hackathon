import { CONFIG, getProgramState, getRoundResult, program, provider, STAGE } from './config';

(async () => {
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
			if (roundResult.stage === STAGE.LIVE) {
				break;
			}
		} catch (ex) {
			// Most likely account not found, ignore
		}
	}


	console.log('Ending live state of round', roundIdx, roundPubkey.toBase58());

	console.log('Executing...');
	const tx = await program.methods
		.finalizeLiveStage()
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			programState,
			round: roundPubkey,
			chainlinkFeed: CONFIG.CHAINLINK_FEED,
			chainlinkProgram: CONFIG.CHAINLINK_PROGRAM,
		})
		.signers([CONFIG.OWNER])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});
	console.log(trans.meta.logMessages);
})();
