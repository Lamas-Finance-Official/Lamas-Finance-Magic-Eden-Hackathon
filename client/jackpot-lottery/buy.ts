import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair } from '@solana/web3.js';
import { CONFIG, createAccountInstruction, program, provider } from './config';

const TICKET_NUM = new Array(CONFIG.LOTTERY_TICKET_MAX_NUM).fill(0).map((_, i) => i + 1);

function genTicket() {
	const out = [];
	let idx = 0;
	for (let i = 0; i < CONFIG.LOTTERY_TICKET_LEN; i++) {
		idx += Math.round((Math.random() * TICKET_NUM.length) / (CONFIG.LOTTERY_TICKET_LEN + 1)) + 1;
		out.push(TICKET_NUM[idx]);
	}

	while (out.length < 6) {
		out.push(0);
	}

	return out;
}

(async () => {
	console.log('Fetching latest round...');
	const state = await program.account.lotteryState.fetch(CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE, 'confirmed');
	console.log('Current round:', state.roundResult.toBase58());

	const tickets = new Array(3).fill(0).map((_) => genTicket());
	console.log('Buying tickets:', tickets);

	const ticketAccounts = tickets.map((_) => Keypair.generate());

	console.log('Executing...');
	const tx = await program.methods
		.buyTicket(tickets)
		.accounts({
			user: CONFIG.USER.publicKey,
			userToken: CONFIG.USER_TOKEN,
			state: CONFIG.JACKPOT_LOTTERY_PROGRAM_STATE,
			pool: CONFIG.POOL,
			roundResult: state.roundResult,
			tokenProgram: TOKEN_PROGRAM_ID,
		})
		.remainingAccounts(
			ticketAccounts.map((keypair) => ({
				pubkey: keypair.publicKey,
				isWritable: true,
				isSigner: false,
			}))
		)
		.preInstructions(
			await Promise.all(
				ticketAccounts.map((keypair) => createAccountInstruction(program.account.lotteryTicket, keypair))
			)
		)
		.signers([CONFIG.USER, ...ticketAccounts])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});
	console.log(trans.meta.logMessages);
})();
