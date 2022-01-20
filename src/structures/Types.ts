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
	Work = 'WORK',
}

export enum InfractionTypes {
	Ban = 'moderation:BAN',
	Kick = 'moderation:KICK',
	Timeout = 'moderation:TIMEOUT',
	Unban = 'moderation:UNBAN',
	Untimeout = 'moderation:UNTIMEOUT',
}

export type BalanceTypes = 'wallet' | 'treasury' | 'total';
