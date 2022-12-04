import { BN, EventParser } from '@project-serum/anchor';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CONFIG, program, provider, getProgramState, getPdaAuthority } from './config';

(async () => {
	const statePubkey = await getProgramState();
	const pdaAuthority = await getPdaAuthority();

	const [vrfLock, bump] = await PublicKey.findProgramAddress([Buffer.from('vrf-lock', 'utf-8'), CONFIG.USER.publicKey.toBuffer()], program.programId);

	console.log('Executing...');
	const tx = await program.methods
		.spin(
			new BN(2 * LAMPORTS_PER_SOL),
		)
		.accounts({
			user: CONFIG.USER.publicKey,
			userToken: CONFIG.USER_TOKEN,
			programState: statePubkey,
			mint: CONFIG.MINT,
			pool: CONFIG.POOL,
			treasury: CONFIG.TREASURY,
			tokenProgram: TOKEN_PROGRAM_ID,
			pdaAuthority,
			vrfLock,
		})
		.signers([CONFIG.USER])
		.rpc({ commitment: 'confirmed' });


	const bnTrans = new BN(bs58.decode(tx));
	console.log('bnTrans', bnTrans);
	const cancel = program.addEventListener('SpinResult', (event) =>{
		console.log(event);
		const eventTrans = new BN(event.requestTrans);

		console.log('eventTrans', eventTrans);
		if (bnTrans.eq(eventTrans)) {
			console.log('Got result');
			program.removeEventListener(cancel);
		}
	});

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});

	const logs = trans?.meta?.logMessages;
	if (!logs)
	{
		console.log('Trans has no log', tx, trans);
		return;
	}

	console.log(logs);
})();
