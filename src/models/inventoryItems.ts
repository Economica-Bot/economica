import mongoose from 'mongoose';
import { Listing } from './index.js';

export interface InventoryItem extends mongoose.Types.Subdocument {
	listing: mongoose.PopulatedDoc<Listing>;
	amount: number;
	createdAt: Date;
}

export const InventoryItemSchema = new mongoose.Schema<InventoryItem>(
	{
		listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
		amount: { type: mongoose.Schema.Types.Number, required: true },
	},
	{ versionKey: false },
);

export const InventoryItemModel: mongoose.Model<InventoryItem> = mongoose.model('InventoryItem', InventoryItemSchema);
