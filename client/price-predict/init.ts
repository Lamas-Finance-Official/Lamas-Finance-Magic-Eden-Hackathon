import BN from 'bn.js';
import { SystemProgram } from '@solana/web3.js';
import { CONFIG, getProgramStatePDA, program, provider } from './config';

(async () => {
	const [statePubkey] = await getProgramStatePDA();

	console.log('Executing...');
	const tx = await program.methods
		.init(
			CONFIG.CHAINLINK_PROGRAM,
			CONFIG.CHAINLINK_FEED,
			CONFIG.TAX_PERCENTAGE,
			CONFIG.BURN_PERCENTAGE,
			new BN(CONFIG.MIN_BET_AMOUNT),
			[
				[7 * 24 * 60 * 60, 100],
				[6 * 24 * 60 * 60, 60],
				[5 * 24 * 60 * 60, 30],
			]
		)
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			programState: statePubkey,
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

	console.log(trans?.meta?.logMessages);
})();
