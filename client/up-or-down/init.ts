import { SystemProgram } from '@solana/web3.js';
import { CONFIG, getProgramState, program, provider } from './config';

(async () => {
	const programState = await getProgramState();

	console.log('Executing...');
	const tx = await program.methods
		.init()
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			programState,
			mint: CONFIG.MINT,
			treasury: CONFIG.TREASURY,
			systemProgram: SystemProgram.programId,
		})
		.signers([CONFIG.OWNER])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});
	console.log(trans.meta.logMessages);
})();
