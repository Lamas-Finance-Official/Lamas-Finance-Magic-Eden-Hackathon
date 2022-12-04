import { PublicKey, SystemProgram } from '@solana/web3.js';
import { CONFIG, program, provider } from './config';

(async () => {
	console.log('Fetching latest round...');
	const state = await program.account.lotteryState.fetch(CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE, 'confirmed');
	console.log('Current round:', state.roundResult.toBase58());

	const [vrfLock, bump] = await PublicKey.findProgramAddress([Buffer.from('vrf-lock', 'utf-8'), state.roundResult.toBuffer()], program.programId);

	console.log('Executing...');
	const tx = await program.methods
		.rollLottery()
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			state: CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE,
			roundResult: state.roundResult,
			vrfLock,
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
