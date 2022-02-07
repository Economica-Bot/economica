import { EmbedAuthorData } from 'discord.js';

export type ReplyString = 'success' | 'info' | 'warn' | 'error';
export type InfractionString = 'BAN' | 'KICK' | 'TIMEOUT' | 'UNBAN' | 'UNTIMEOUT';
export type BalanceString = 'wallet' | 'treasury' | 'total';
export type Author = 'bot' | 'user' | 'guild' | EmbedAuthorData;
export type Authority = 'USER' | 'MODERATOR' | 'MANAGER' | 'ADMINISTRATOR' | 'DEVELOPER';
export type Moderation = 'ban' | 'kick' | 'timeout' | 'unban' | 'untimeout';
export type ShopItem = 'ITEM' | 'GENERATOR';
export type TitleString =
	| 'register:GUILD_NOT_FOUND'
	| 'test:TEST'
	| 'register:COMMANDS_REFRESHED'
	| 'reset:COMMANDS_RESET'
	| 'economy:INVALID_AMOUNT'
	| 'economy:UNPARSABLE_AMOUNT'
	| 'economy:INSUFFICIENT_TREASURY'
	| 'economy:INSUFFICIENT_WALLET'
	| 'add-money:FUNDS_ADDED'
	| 'balance:VIEW_BALANCE'
	| 'currency:VIEW_CURRENCY'
	| 'currency:SET_CURRENCY'
	| 'currency:RESET_CURRENCY'
	| 'deposit:BALANCE_UPDATED'
	| 'leaderboard:VIEW_LEADERBOARD'
	| 'loan:CREATE_LOAN'
	| 'loan:CANCEL_LOAN'
	| 'loan:ACCEPT_LOAN'
	| 'loan:VIEW_LOAN'
	| 'loan:DELETE_LOAN'
	| 'loan:INVALID_TARGET'
	| 'loan:INVALID_LENGTH'
	| 'loan:INVALID_ID'
	| 'loan:LOAN_NOT_FOUND'
	| 'pay:PAYMENT_TRANSFERRED'
	| 'set-money:BALANCE_UPDATED'
	| 'transaction-log:VIEW_TRANSACTION_LOG'
	| 'transaction-log:SET_TRANSACTION_LOG'
	| 'transaction-log:RESET_TRANSACTION_LOG'
	| 'transaction:TRANSACTION_NOT_FOUND'
	| 'transaction:INVALID_ID'
	| 'transaction:VIEW_TRANSACTION'
	| 'transaction:DELETE_TRANSACTION'
	| 'withdraw:BALANCE_UPDATED'
	| 'beg:FAIL'
	| 'beg:SUCCESS'
	| 'crime:FAIL'
	| 'crime:SUCCESS'
	| 'income:VIEW_INCOMES'
	| 'rob:INVALID_TARGET'
	| 'rob:FAIL'
	| 'work:SUCCESS'
	| 'ban:INVALID_TARGET'
	| 'ban:INVALID_DURATION'
	| 'ban:SUCCESS'
	| 'ban:INFO'
	| 'infraction-log:VIEW_INFRACTION_LOG'
	| 'infraction-log:SET_INFRACTION_LOG'
	| 'infraction-log:RESET_INFRACTION_LOG'
	| 'kick:INVALID_TARGET'
	| 'kick:INSUFFICIENT_PERMISSIONS'
	| 'kick:TARGET_UNKICKABLE'
	| 'kick:INFO'
	| 'kick:WARNING'
	| 'kick:SUCCESS'
	| 'timeout:INVALID_TARGET'
	| 'timeout:INSUFFICIENT_PERMISSIONS'
	| 'timeout:TARGET_UNMODERATABLE'
	| 'timeout:INFO'
	| 'timeout:WARNING'
	| 'timeout:ALREADY_IN_TIMEOUT'
	| 'timeout:INVALID_DURATION'
	| 'timeout:SUCCESS'
	| 'unban:INVALID_ID'
	| 'unban:INFO'
	| 'unban:WARNING'
	| 'unban:SUCCESS'
	| 'untimeout:INSUFFICIENT_PERMISSIONS'
	| 'untimeout:TARGET_UNMODERATABLE'
	| 'untimeout:TARGET_NOT_IN_TIMEOUT'
	| 'untimeout:INFO'
	| 'untimeout:WARNING'
	| 'untimeout:SUCCESS'
	| 'shop:VIEW'
	| 'shop:CLEAR'
	| 'statistics:VIEW_BALANCE'
	| 'authority:VIEW'
	| 'authority:SET'
	| 'authority:RESET'
	| 'authority:WARNING'
	| 'help:VIEW_ALL'
	| 'help:VIEW_GROUP'
	| 'help:VIEW_COMMAND'
	| 'help:VIEW_SUBCOMMAND_GROUP'
	| 'help:VIEW_SUBCOMMAND'
	| 'invite:VIEW_INVITE_LINK'
	| 'permissions:COMMAND_NOT_FOUND'
	| 'permissions:VIEW_COMMAND_PERMISSION_HIERARCHY'
	| 'ping:VIEW_PING'
	| 'purge:MESSAGES_DELETED';
export type TransactionString =
	| 'DEPOSIT'
	| 'WITHDRAW'
	| 'GIVE_PAYMENT'
	| 'RECEIVE_PAYMENT'
	| 'BUY'
	| 'SELL'
	| 'GENERATOR'
	| 'INCOME'
	| 'ADD_MONEY'
	| 'SET_MONEY'
	| 'LOAN_PROPOSE'
	| 'LOAN_CANCEL'
	| 'LOAN_ACCEPT'
	| 'LOAN_DECLINE'
	| 'LOAN_DELETE'
	| 'LOAN_GIVE_REPAYMENT'
	| 'LOAN_RECEIVE_REPAYMENT'
	| 'WORK'
	| 'BEG'
	| 'CRIME_SUCCESS'
	| 'CRIME_FINE'
	| 'ROB_SUCCESS'
	| 'ROB_VICTIM'
	| 'ROB_FINE';

export {
	CommandData,
	InventoryItem,
	EconomyInfo,
	IncomeCommandProperties,
	RoleAuthority,
	Command,
	ModuleOwnership,
} from './interfaces';
