import { EventParser } from '@project-serum/anchor';
import { program } from './config';

(async () => {
	const logs = [
		'Program 5QS6q9spW5X4c6tnzwydoTEBfdskcEKi4ZRbjN3U9HDU invoke [1]',
		'Program log: Instruction: Spin',
		'Program log: Transfering stake to pool',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
		'Program log: Instruction: Transfer',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 3052 of 181018 compute units',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
		'Program data: u8/SGUIPrZw9agqPSg1p6ELEArLonrhCU8MbEba0/4jZcF+gtclzxgCUNXcAAAAAQEIPAAAAAABAQg8AAAAAAA==',
		'Program log: Transfering token to user',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
		'Program log: Instruction: Transfer',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 3052 of 159958 compute units',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
		'Program log: Transfering tax to treasury',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
		'Program log: Instruction: Transfer',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 3132 of 153986 compute units',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
		'Program log: Burning part of the tax',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
		'Program log: Instruction: Burn',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 3054 of 147936 compute units',
		'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
		'Program 5QS6q9spW5X4c6tnzwydoTEBfdskcEKi4ZRbjN3U9HDU consumed 58063 of 200000 compute units',
		'Program 5QS6q9spW5X4c6tnzwydoTEBfdskcEKi4ZRbjN3U9HDU success'
	  ];

	const eventParser = new EventParser(program.programId, program.coder);
	eventParser.parseLogs(logs, (event) => {
		const data = event.data as any;
		console.log('Event', {
			user: data.user.toBase58(),
			betAmount: data.betAmount.toNumber(),
			multiplier: data.multiplier.toNumber(),
			decimal: data.decimal.toNumber(),
		});
	});
})();
