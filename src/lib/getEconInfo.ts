import { Member, MemberModel } from '../models/index.js';
import { EconomyInfo } from '../typings/index.js';

/**
 * Gets a user's economy information.
 * @param {string} guildId - guild id.
 * @param {string} userId - User id.
 * @returns {Promise<EconomyInfo>} wallet, treasury, total, rank
 */
export async function getEconInfo(member: Member): Promise<EconomyInfo> {
	const balances: Member[] = await MemberModel.aggregate([
		{
			$project: {
				userId: 1,
				wallet: 1,
				treasury: 1,
				total: {
					$add: ['$wallet', '$treasury'],
				},
			},
		},
		{
			$sort: {
				total: -1,
			},
		},
	]);

	let rank = 1;
	let wallet = 0;
	let treasury = 0;
	let total = 0;
	for (let i = 0; i < balances.length; i++) {
		if (balances[i].userId === member.userId) {
			wallet = balances[i].wallet;
			treasury = balances[i].treasury;
			total = wallet + treasury;
			rank = i + 1;
		}
	}

	return {
		wallet,
		treasury,
		total,
		rank,
	};
}
