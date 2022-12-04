import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair } from '@solana/web3.js';
import { CONFIG, createAccountInstruction, program, provider } from './config';

(async () => {
	const state = Keypair.generate();
	console.log('======================== ATTENTION ========================');
	console.log('GameState account, please update config.ts with this key:');
	console.log(state.publicKey.toBase58());
	console.log('======================== ATTENTION ========================');

	console.log('Executing...');
	const tx = await program.methods
		.init()
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			state: state.publicKey,
			mint: CONFIG.MINT,
			pool: CONFIG.POOL,
			treasury: CONFIG.TREASURY,
			tokenProgram: TOKEN_PROGRAM_ID,
		})
		.preInstructions([await createAccountInstruction(program.account.lotteryState, state)])
		.signers([CONFIG.OWNER, state])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});
	console.log(trans.meta.logMessages);
})();
