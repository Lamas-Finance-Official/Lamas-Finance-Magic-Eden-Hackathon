import BN from 'bn.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CONFIG, getProgramState, getRoundResult, program, provider, STAGE } from './config';

(async () => {
	console.log('Fetching ProgramState...');
	const programState = await getProgramState();
	const state = await program.account.programState.fetch(programState);
	const numRound = state.roundCounter.toNumber();

	console.log('Searching for WaitStartRound round...');
	let roundIdx = -1;
	let roundPubkey;
	let roundResult;
	for (roundIdx = numRound - 5; roundIdx <= numRound; roundIdx++) {
		if (roundIdx < 0)
		 	continue;

		try {
			roundPubkey = await getRoundResult(roundIdx);
			roundResult = await program.account.roundResult.fetch(roundPubkey);
			if (roundResult.stage === STAGE.WAIT_START_ROUND) {
				break;
			}
		} catch (ex) {
			// Most likely account not found, ignore
		}
	}

	console.log('Starting round', roundIdx, roundPubkey.toBase58());

	console.log('Executing...');
	const tx = await program.methods
		.startRound(new BN(20 * LAMPORTS_PER_SOL))
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			programState,
			round: roundPubkey,
			pool: roundResult.pool,
			treasury: CONFIG.TREASURY,
			tokenProgram: TOKEN_PROGRAM_ID,
		})
		.signers([CONFIG.OWNER])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});
	console.log(trans.meta.logMessages);
})();
