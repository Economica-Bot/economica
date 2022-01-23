export enum TransactionTypes {
	Deposit = 'DEPOSIT',
	Withdraw = 'WITHDRAW',
	Pay = 'PAY',
	Purchase = 'PURCHASE',
	Sell = 'SELL',
	Generator = 'GENERATOR',
	Income = 'INCOME',
	Add_Money = 'ADD_MONEY',
	Set_Money = 'SET_MONEY',
	Loan = 'LOAN',
}

export enum InfractionTypes {
	Ban = 'moderation:BAN',
	Kick = 'moderation:KICK',
	Timeout = 'moderation:TIMEOUT',
	Unban = 'moderation:UNBAN',
	Untimeout = 'moderation:UNTIMEOUT',
}

export interface GuildAuthData {
	mod: string[];
	manager: string[];
	admin: string[];
}
