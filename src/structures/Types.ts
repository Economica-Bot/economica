export enum TransactionTypes {
	Deposit = 'DEPOSIT',
	Withdraw = 'WITHDRAW',
	Give_Payment = 'GIVE_PAYMENT',
	Receive_Payment = 'RECEIVE_PAYMENT',
	Purchase = 'PURCHASE',
	Sell = 'SELL',
	Generator = 'GENERATOR',
	Income = 'INCOME',
	Add_Money = 'ADD_MONEY',
	Set_Money = 'SET_MONEY',
	Loan_Propose = 'LOAN_PROPOSE',
	Loan_Cancel = 'LOAN_CANCEL',
	Loan_Accept = 'LOAN_ACCEPT',
	Loan_Decline = 'LOAN_DECLINE',
	Loan_Delete = 'LOAN_DELETE',
	Loan_Give_Repayment = 'LOAN_GIVE_REPAYMENT',
	Loan_Receive_Repayment = 'LOAN_RECEIVE_REPAYMENT',
	Work = 'WORK',
	Beg = 'BEG',
	Crime_Success = 'CRIME_SUCCESS',
	Crime_Fine = 'CRIME_FINE',
	Rob_Success = 'ROB_SUCCESS',
	Rob_Victim = 'ROB_VICTIM',
	Rob_Fine = 'ROB_FINE',
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
export type BalanceTypes = 'wallet' | 'treasury' | 'total';

export type AuthLevelTypes = 'mod' | 'manager' | 'admin' & string;