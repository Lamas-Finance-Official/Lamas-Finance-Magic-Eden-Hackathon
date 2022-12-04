import type BN from 'bn.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CONFIG, getPdaAuthority, getProgramState, program, provider } from './config';

(async () => {
	const programState = await getProgramState();

	console.log('Fetching current user predictions...');
	const predictions = await program.account.prediction.all([
		{
			memcmp: {
				offset: 8,
				bytes: CONFIG.USER.publicKey.toBase58(),
			},
		},
	]);

	console.log(`User has make ${predictions.length} prediction`);
	if (predictions.length === 0) return;

	console.log('Getting PDA Authority...');
	const pdaAuthority = await getPdaAuthority();

	for (const prediction of predictions) {
		console.log(
			`> Claiming prediction isUp=${prediction.account.isUp},amount=${prediction.account.amount}:`,
			prediction.publicKey.toBase58()
		);

		console.log('Fetching result of round:', prediction.account.result.toBase58());
		const roundResult = await program.account.roundResult.fetch(prediction.account.result, 'confirmed');

		console.log(
			`Price that round ${decimal(roundResult.priceEndPredictStage)} => ${decimal(roundResult.priceEndLiveStage)}`
		);

		console.log('Executing...');
		const tx = await program.methods
			.claimReward()
			.accounts({
				user: CONFIG.USER.publicKey,
				userToken: CONFIG.USER_TOKEN,
				programState,
				mint: CONFIG.MINT,
				round: prediction.account.result,
				pool: roundResult.pool,
				treasury: CONFIG.TREASURY,
				pdaAuthority,
				prediction: prediction.publicKey,
				tokenProgram: TOKEN_PROGRAM_ID,
			})
			.signers([CONFIG.USER])
			.rpc({ commitment: 'confirmed' });

		console.log('Fetching transaction logs...');
		const trans = await provider.connection.getTransaction(tx, {
			commitment: 'confirmed',
		});
		console.log(trans.meta.logMessages);
	}
})();

const decimal = ({ value, decimals }: { value: BN; decimals: number }) => {
	const v = value.toString(10);
	const pos = v.length - decimals;
	return v.substring(0, pos) + '.' + v.substring(pos);
};
