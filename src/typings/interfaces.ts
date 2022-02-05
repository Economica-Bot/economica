import { Authority } from '.';

export interface CommandData {
	command: string;
	timestamp: number;
}

export interface InventoryItem {
	refId: string;
	amount: number;
	lastGenerateAt: number | null;
	collected: boolean | null;
}

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
