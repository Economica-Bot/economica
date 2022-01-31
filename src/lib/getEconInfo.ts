import { MemberModel } from '../models';
import { EconomyInfo } from '../typings';

/**
 * Gets a user's economy information.
 * @param {string} guildId - guild id.
 * @param {string} userId - User id.
 * @returns {Promise<EconomyInfo>} wallet, treasury, total, rank
 */
export async function getEconInfo(guildId: string, userId: string): Promise<EconomyInfo> {
	let rank = 0,
		wallet = 0,
		treasury = 0,
		total = 0,
		found = false;
	const balances = await MemberModel.find({ guildId }).sort({ total: -1 });
	if (balances.length) {
		for (let rankIndex = 0; rankIndex < balances.length; rankIndex++) {
			rank = balances[rankIndex].userId === userId ? rankIndex + 1 : rank++;
		}

		if (balances[rank - 1]) {
			found = true;
			wallet = balances[rank - 1].wallet;
			treasury = balances[rank - 1].treasury;
			total = balances[rank - 1].total;
		}
	}

	if (!found) {
		await MemberModel.create({
			guildId,
			userId,
			wallet,
			treasury,
			total,
		});
	}

	return {
		wallet,
		treasury,
		total,
		rank,
	};
}
