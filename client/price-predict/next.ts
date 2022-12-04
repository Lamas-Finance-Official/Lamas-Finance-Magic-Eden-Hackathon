import { SYSVAR_RENT_PUBKEY, Keypair, SystemProgram } from '@solana/web3.js';
import { CONFIG, getProgramStatePDA, program, provider } from './config';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

(async () => {
	const [statePubkey] = await getProgramStatePDA();
	const roundResult = Keypair.generate();
	const pool = Keypair.generate();

	console.log('Executing...');
	const tx = await program.methods
		.nextRound()
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			programState: statePubkey,
			roundResult: roundResult.publicKey,
			mint: CONFIG.MINT,
			pool: pool.publicKey,
			chainlinkFeed: CONFIG.CHAINLINK_FEED,
			chainlinkProgram: CONFIG.CHAINLINK_PROGRAM,
			tokenProgram: TOKEN_PROGRAM_ID,
			systemProgram: SystemProgram.programId,
			rent: SYSVAR_RENT_PUBKEY,
		})
		.signers([CONFIG.OWNER, roundResult, pool])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});

	console.log(trans?.meta?.logMessages);
})();
