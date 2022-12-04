import { BN } from 'bn.js';
import { Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CONFIG, getProgramStatePDA, program, provider, DECIMAL } from './config';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { EventParser } from '@project-serum/anchor';

(async () => {
	const [statePubkey] = await getProgramStatePDA();
	const state = await program.account.programState.fetch(statePubkey, 'confirmed');
	const round = await program.account.roundResult.fetch(state.roundResult, 'confirmed');

	const prediction = Keypair.generate();
	const price = Math.round(Math.random() * 10) + 40;
	console.log('Prediction: ', prediction.publicKey.toBase58(), 'price', price);

	console.log('Executing...');
	const tx = await program.methods
		.predict(
			new BN(5 * LAMPORTS_PER_SOL),
			new BN(price).mul(DECIMAL)
		)
		.accounts({
			user: CONFIG.USER.publicKey,
			userToken: CONFIG.USER_TOKEN,
			programState: statePubkey,
			roundResult: state.roundResult,
			prediction: prediction.publicKey,
			pool: round.pool,
			tokenProgram: TOKEN_PROGRAM_ID,
			systemProgram: SystemProgram.programId,
		})
		.signers([CONFIG.USER, prediction])
		.rpc({ commitment: 'confirmed' });

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

	const eventParser = new EventParser(program.programId, program.coder);
	eventParser.parseLogs(logs, (event) => {
		console.log('Event', event);
	});

	console.log(logs);
})();
