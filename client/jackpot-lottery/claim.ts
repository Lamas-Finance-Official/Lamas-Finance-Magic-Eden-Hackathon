import type BN from 'bn.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CONFIG, getPdaAuthority, program, provider } from './config';

(async () => {
	console.log('Fetching current user tickets...');
	const tickets = await program.account.lotteryTicket.all([
		{
			memcmp: {
				offset: 8,
				bytes: CONFIG.USER.publicKey.toBase58(),
			},
		},
	]);

	console.log(`User has bought ${tickets.length} ticket(s)`);
	if (tickets.length === 0) return;

	console.log('Getting PDA Authority...');
	const pdaAuthority = await getPdaAuthority();

	const mapRoundResultPool = new Map();
	for (const ticket of tickets) {
		console.log(`> Claiming ticket ${ticket.account.lotteryNumber}:`, ticket.publicKey.toBase58());

		let roundResult = mapRoundResultPool.get(ticket.account.roundResult.toBase58());
		if (roundResult == null) {
			console.log('Fetching round result...');
			roundResult = await program.account.lotteryRoundResult.fetch(ticket.account.roundResult, 'confirmed');

			if (roundResult == null) {
				console.log('Cannot found round result', ticket.account.roundResult.toBase58());
				continue;
			}

			mapRoundResultPool.set(ticket.account.roundResult.toBase58(), roundResult);
		}

		console.log('Executing...');
		try {
			const tx = await program.methods
				.claimReward()
				.accounts({
					user: CONFIG.USER.publicKey,
					userToken: CONFIG.USER_TOKEN,
					state: CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE,
					mint: CONFIG.MINT,
					roundResult: ticket.account.roundResult,
					resultPool: roundResult.pool,
					treasury: CONFIG.TREASURY,
					pdaAuthority,
					lotteryTicket: ticket.publicKey,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.signers([CONFIG.USER])
				.rpc({ commitment: 'confirmed' });

			console.log('Fetching transaction logs...');
			const trans = await provider.connection.getTransaction(tx, {
				commitment: 'confirmed',
			});
			console.log(trans.meta.logMessages);
		} catch (err) {
			console.log(err);
		}
	}
})();
