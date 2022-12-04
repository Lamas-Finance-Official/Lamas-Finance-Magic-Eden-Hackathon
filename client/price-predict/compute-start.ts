import { CONFIG, getProgramStatePDA, program, provider } from './config';

(async () => {
	const [statePubkey] = await getProgramStatePDA();
	const state = await program.account.programState.fetch(statePubkey, 'confirmed');

	console.log('Executing...');
	const tx = await program.methods
		.computeRoundResultStart()
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			programState: statePubkey,
			roundResult: state.roundResult,
			chainlinkFeed: state.chainlinkFeed,
			chainlinkProgram: state.chainlinkProgram,
		})
		.signers([CONFIG.OWNER])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});

	console.log(trans?.meta?.logMessages);
})();
