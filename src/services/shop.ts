import { ShopModel } from "../models/shops";

export const name = 'shop';

export async function execute() {
	setInterval(async () => {
		const now = new Date();
		const conditional = {
			active: true,
			duration: {
				$ne: null as number,
			},
		};

		const results = await ShopModel.find(conditional);

		if (results?.length) {
			for (const result of results) {
				const { duration, createdAt } = result;
				if (createdAt.getTime() + duration < now.getTime()) {
					await ShopModel.findOneAndUpdate(
						{
							name: result.name,
						},
						{
							active: false,
						}
					);
				}
			}
		}
	}, 1000 * 5);
}
