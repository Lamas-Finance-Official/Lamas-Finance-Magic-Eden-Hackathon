import BN from 'bn.js';
import { Program, AnchorProvider, setProvider } from '@project-serum/anchor';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { Keypair, PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { UpOrDown } from '../up_or_down';

const idl = require('../up_or_down.json');

//////// CONFIGURATION ////////

const AUTHORITY_SEED = 'lamas_finance';
const PROGRAM_STATE_PDA_SEED = 'state';
const ROUND_PDA_SEED = 'round';

const PROGRAM_ID = 'BbCEshx6obrBjzWPXBRxq99GcFVPB8ioe48pUYr711zy';

export const STAGE = {
	WAIT_START_ROUND: 0,
	PREDICTION: 1,
	LIVE: 2,
	ENDED: 3,
	CANCELED: 4,
};

// Update manually base on config.json
export const CONFIG = {
	URL: 'https://api.devnet.solana.com',
	OWNER: Keypair.fromSecretKey(
		new Uint8Array([
			111, 118, 107, 173, 240, 168, 69, 73, 10, 9, 142, 105, 124, 62, 45, 115, 251, 251, 178, 118, 181, 234, 217,
			39, 216, 132, 91, 232, 83, 32, 181, 192, 99, 160, 13, 45, 231, 79, 179, 214, 183, 114, 85, 42, 30, 241, 135,
			24, 20, 224, 106, 75, 227, 156, 241, 10, 60, 211, 131, 200, 123, 9, 190, 37,
		])
	),
	MIN_BET_AMOUNT: 5 * LAMPORTS_PER_SOL,
	TAX_PERCENTAGE: 2,
	BURN_PERCENTAGE: 50,
	// User
	USER: Keypair.fromSecretKey(
		new Uint8Array([
			110, 128, 57, 164, 181, 133, 232, 44, 46, 235, 125, 109, 243, 64, 183, 72, 149, 34, 172, 38, 117, 157, 28,
			204, 68, 174, 52, 224, 169, 60, 128, 144, 61, 106, 10, 143, 74, 13, 105, 232, 66, 196, 2, 178, 232, 158,
			184, 66, 83, 195, 27, 17, 182, 180, 255, 136, 217, 112, 95, 160, 181, 201, 115, 198,
		])
	),
	USER_TOKEN: 'FFVcqDZ9AQHwabV9ope7Jq3EaoPcZXJgsJLJWUUNTrk6',
	// Keys
	CHAINLINK_FEED: 'HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6',
	CHAINLINK_PROGRAM: 'HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny',
	// Token
	MINT: '9a7TwLHkA2AaJd9E7qsdhaTPhQL5wQ9VXYo7J2pXHixV',
	TREASURY: '3gBfaqxVBh5ZYKv3RE544JZMq3yTogR1jZsRyYguWHMQ',
};

//////////////////////////////

const opts = AnchorProvider.defaultOptions();
export const provider = new AnchorProvider(
	new Connection(CONFIG.URL, opts.preflightCommitment),
	new NodeWallet(CONFIG.OWNER),
	opts
);

setProvider(provider);

export const program = new Program(idl, PROGRAM_ID) as Program<UpOrDown>;

export const getPdaAuthority = () =>
	PublicKey.findProgramAddress([Buffer.from(AUTHORITY_SEED, 'utf-8')], program.programId).then((r) => r[0]);

export const getProgramState = () =>
	PublicKey.findProgramAddress([Buffer.from(PROGRAM_STATE_PDA_SEED, 'utf-8')], program.programId).then((r) => r[0]);

export const getRoundResult = (round: number | BN) =>
	PublicKey.findProgramAddress(
		[Buffer.from(ROUND_PDA_SEED, 'utf-8'), new BN(round).toBuffer('be', 8)],
		program.programId
	).then((r) => r[0]);
