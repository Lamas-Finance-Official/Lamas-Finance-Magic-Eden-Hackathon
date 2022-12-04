import BN from 'bn.js';
import { CONFIG, getProgramStatePDA, program, provider } from './config';

(async () => {
	const [statePubkey] = await getProgramStatePDA();
	const state = await program.account.programState.fetch(statePubkey, 'confirmed');
	const round = await program.account.roundResult.fetch(state.roundResult, 'confirmed');

	const predictions = await program.account.prediction.all([
		{
			memcmp: {
				offset: 8 + 32,
				bytes: state.roundResult.toBase58(),
			}
		}
	]);

	console.log(`Found ${predictions.length} prediction`);

	const sumStake = new BN(0);
	const sumStakeXScore = new BN(0);
	for (const prediction of predictions) {
		let score = computeScore(prediction.account.predictVector0, round.resultVec0);

		const timeBeforeFinalized = round.unixTimeEndRound.sub(prediction.account.unixTimePredict).toNumber();
		for (const [time, bonusPoint] of (state.bonusPoints as Array<[number, number]>)) {
			if (timeBeforeFinalized >= time) {
				score += bonusPoint;
				break;
			}
		}

		console.log(`Prediction: ${prediction.publicKey.toBase58()}, score=${score}`);

		sumStake.iadd(prediction.account.stakeAmount);
		sumStakeXScore.iadd(prediction.account.stakeAmount.muln(score));
	}

	console.log(`Sum stake = ${sumStake.toString(10)}\nSum stake X score = ${sumStakeXScore.toString(10)}`);

	console.log('Executing...');
	const tx = await program.methods
		.computeRoundResultEnd(
			sumStake,
			sumStakeXScore
		)
		.accounts({
			owner: CONFIG.OWNER.publicKey,
			programState: statePubkey,
			roundResult: state.roundResult,
		})
		.signers([CONFIG.OWNER])
		.rpc({ commitment: 'confirmed' });

	console.log('Fetching transaction logs...');
	const trans = await provider.connection.getTransaction(tx, {
		commitment: 'confirmed',
	});

	console.log(trans?.meta?.logMessages);
})();

function computeVec0(priceStart: BN, priceEnd: BN): number {
	return priceEnd.muln(1_000_000).div(priceEnd.add(priceStart)).toNumber() / 10_000;
}

function computeScore(predictVec0: number, actualVec0: number): number {
	const predict = { x: predictVec0, y: 100 - predictVec0 };
	const actual = { x: actualVec0, y: 100 - actualVec0 };

	const dotProduct = predict.x * actual.x + predict.y * actual.y;
	const vecLength = Math.sqrt(predict.x * predict.x + predict.y * predict.y) * Math.sqrt(actual.x * actual.x + actual.y * actual.y);
	const angle = Math.acos(dotProduct / vecLength);

	return angle <= Math.PI / 1000 ? 1000 : Math.round(Math.PI / angle);
}

function test() {
	const priceStart = new BN('2800654321');
	const actualVec0 = computeVec0(priceStart, new BN('2900123456'));

	for (let i = 2990; i <= 3000; i++) {
		const v = i + '54' + i;
		const vec0 = computeVec0(priceStart, new BN(v));
		console.log(`${v} => ${vec0.toFixed(4)} => ${computeScore(vec0, actualVec0)}`);
	}
}
