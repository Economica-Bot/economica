import { getModelForClass, prop } from '@typegoose/typegoose';
import { Listing } from './index.js';

export class InventoryItem {
	@prop({ ref: () => Listing })
	public listing: Listing;

	@prop({ required: true })
	public amount: number;
}

export const InventoryItemModel = getModelForClass(InventoryItem);
