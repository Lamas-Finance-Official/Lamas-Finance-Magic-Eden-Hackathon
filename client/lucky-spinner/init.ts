import BN from 'bn.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CONFIG, getProgramState, program, provider, DECIMAL } from './config';

(async () => {
	const statePubkey = await getProgramState();

	console.log('Executing...');
	const tx = await program.methods
		.init(
			new BN(CONFIG.TAX_PERCENTAGE),
			new BN(CONFIG.BURN_PERCENTAGE),
			new BN(CONFIG.MIN_BET_AMOUNT),
			[
				[new BN(15), new BN(35 * DECIMAL)],
				[new BN(40), new BN(20 * DECIMAL)],
				[new BN(100), new BN(7 * DECIMAL)],
				[new BN(220), new BN(5 * DECIMAL)],
				[new BN(440), new BN(3 * DECIMAL)],
				[new BN(600), new BN(2 * DECIMAL)],
				[new BN(2485), new BN(1 * DECIMAL)],
				[new BN(3000), new BN(0.5 * DECIMAL)],
				[new BN(3000), new BN(0 * DECIMAL)],
			]
		)
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			programState: statePubkey,
			mint: CONFIG.MINT,
			pool: CONFIG.POOL,
			treasury: CONFIG.TREASURY,
			tokenProgram: TOKEN_PROGRAM_ID,
		})
		.signers([CONFIG.OWNER])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});

	console.log(trans?.meta?.logMessages);
})();
