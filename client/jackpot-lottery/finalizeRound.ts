import { BN } from 'bn.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CONFIG, getPdaAuthority, program, provider } from './config';

function countMatching(a: number[], b: number[]): number {
	let i = 0;
	let j = 0;
	let count = 0;

	while (i < a.length && j < b.length) {
		if (a[i] == b[j]) {
			count++;
			i++;
			j++;
		} else if (a[i] > b[j]) {
			j++;
		} else {
			i++;
		}
	}

	return count;
}

(async () => {
	console.log('Fetching latest round...');
	const state = await program.account.lotteryState.fetch(CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE, 'confirmed');
	console.log('Current round:', state.roundResult.toBase58());

	console.log('Fetching round result...');
	const round = await program.account.lotteryRoundResult.fetch(state.roundResult, 'confirmed');
	console.log('Lottery result: ', round.lotteryResult);

	console.log('Fetching all ticket of current round...');
	const tickets = await program.account.lotteryTicket.all([
		{
			memcmp: {
				offset: 8 /* discriminate bytes */ + 32 /* owner pubKey */,
				bytes: state.roundResult.toBase58(),
			},
		},
	]);

	const numWinningTicket = new Array(7).fill(0);
	for (let i = 0; i < tickets.length; i++) {
		const ticket = tickets[i].account;
		const numMatch = countMatching(
			ticket.lotteryNumber.slice(0, round.lotteryLen),
			round.lotteryResult.slice(0, round.lotteryLen)
		);
		numWinningTicket[numMatch]++;
	}

	console.log('Num winning tickets', numWinningTicket);

	console.log('Getting PDA Authority...');
	const pdaAuthority = await getPdaAuthority();

	console.log('Executing...');
	const tx = await program.methods
		.finalizeRound(numWinningTicket.map((v) => new BN(v)))
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			state: CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE,
			pool: CONFIG.POOL,
			roundResult: state.roundResult,
			roundResultPool: round.pool,
			pdaAuthority,
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
