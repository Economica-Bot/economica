import { Authority } from '.';

export interface CommandData {
	command: string;
	timestamp: number;
}

export interface InventoryItem {
	name: string;
	amount: number;
	lastGenerateAt: number | null;
	collected: boolean | null;
}

export const ReqString = {
	type: String,
	required: true,
};

export const NonReqString = {
	type: String,
	required: false,
};

export const ReqNum = {
	type: Number,
	required: true,
};

export const NonReqNum = {
	type: Number,
	required: false,
};

export const ReqBoolean = {
	type: Boolean,
	required: true,
};

export const NonReqBoolean = {
	type: Boolean,
	required: false,
};

export const ReqDate = {
	type: Date,
	required: true,
};

export const NonReqDate = {
	type: Date,
	required: false,
};

export const ReqCommandDataArr = {
	type: Array<CommandData>(),
	required: true,
};

export const ReqInventoryItemArr = {
	type: Array<InventoryItem>(),
	required: true,
};

export const ReqStringArr = {
	type: Array<string>(),
	required: true,
};

export interface EconomyInfo {
	wallet: number;
	treasury: number;
	total: number;
	rank: number;
}

export interface IncomeCommandProperties {
	command: string;
	min: number;
	max: number;
	chance: number;
	minFine: number;
	maxFine: number;
}

export interface RoleAuthority {
	roleId: string;
	authority: Authority;
}

export const ReqRoleAuthorityArr = {
	type: Array<RoleAuthority>(),
	required: true,
}
