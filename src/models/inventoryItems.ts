import * as mongoose from 'mongoose';
import { Shop } from '.';

export interface InventoryItem extends mongoose.Types.Subdocument {
	shop: mongoose.PopulatedDoc<Shop>;
	amount: number;
	createdAt: Date;
}

export const InventoryItemSchema = new mongoose.Schema<InventoryItem>(
	{
		shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
		amount: { type: mongoose.Schema.Types.Number, required: true },
	},
	{
		versionKey: false,
	}
);

export const InventoryItemModel: mongoose.Model<InventoryItem> = mongoose.model('InventoryItem', InventoryItemSchema);
