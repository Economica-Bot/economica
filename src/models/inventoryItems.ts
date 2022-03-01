import * as mongoose from 'mongoose';
import { Member, Shop } from '.';

export interface InventoryItem extends mongoose.Types.Subdocument {
	shop: mongoose.PopulatedDoc<Shop>;
	amount: number;
	lastCollectedAt: Date;
}

export const InventoryItemSchema = new mongoose.Schema<InventoryItem>(
	{
		shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
		amount: { type: mongoose.Schema.Types.Number, required: true },
		lastCollectedAt: { type: mongoose.Schema.Types.Date }
	},
	{
		versionKey: false,
	}
);

InventoryItemSchema.pre('save', async function () {
	const { inventory } = (await (this.parent() as Member).populate({
		path: `inventory.shop`,
		model: 'Shop'
	}).execPopulate())

	const inventoryItem = inventory[inventory.indexOf(this)]

	if (((inventoryItem.shop) as Shop).type == 'GENERATOR') {
		if (!this.lastCollectedAt)
			this.lastCollectedAt = new Date();
	}
	else if (this.lastCollectedAt)
		delete this.lastCollectedAt;
})

export const InventoryItemModel: mongoose.Model<InventoryItem> = mongoose.model('InventoryItem', InventoryItemSchema);
