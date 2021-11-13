/**
 * Options:
 * 	global -> Whether the command can be used in DMs
 * 	enabled -> Whether the command can be used
 * 	permission -> Permission level
 *
 * Permissions:
 * 	0 -> User
 * 	1 -> Moderator
 * 	2 -> Administrator
 *  3 -> Guild Manager
 *  4 -> Bot Owner
 */

const commands = {
	application: {
		initialize: {
			usage: '',
			description: 'Initialize the database.',
			options: {
				enabled: true,
				global: true,
				permission: 4,
			},
		},
		load: {
			usage: '<command>',
			description: 'Load a slash command.',
			options: {
				enabled: true,
				global: true,
				permission: 4,
			},
		},
		reset: {
			usage: '',
			description: 'Reset slash commands.',
			options: {
				enabled: true,
				global: true,
				permission: 4,
			},
		},
	},
	casino: {
		dice: {
			usage: '<bet> <number>',
			description: 'Roll a dice.',
			options: {
				enabled: true,
				global: false,
				permission: 0,
			},
		},
		roulette: {
			usage:
				'"inside" ("single" | "split" | "street" | "corner" | "double_street" | "trio" | "first_four") [options] <bet> or "outside" ("half" | "color" | "even_or_odd" | "dozen" | "column" | "snake") [options] <bet>',
			description:
				'Play roulette.\nInside bets -> (1-36), outside bets -> (0-36).',
			options: {
				enabled: true,
				global: false,
				permission: 0,
			},
		},
	},
	config: {
		command: {
			usage:
				'"permission" [options] <command> args... or "config" [options] <command> args...)',
			description: 'Manage commands.',
			options: {
				enabled: true,
				global: false,
				permission: 2,
			},
		},
		module: {
			usage: '"enable" <module> or "disable" <module>)',
			description: 'Manage modules.',
			options: {
				enabled: true,
				global: false,
				permission: 2,
			},
		},
	},
	economy: {
		add_money: {
			usage: '<user> <amount> <wallet | string>',
			description: "Add or subtract funds from a user's balances.",
			options: {
				enabled: true,
				global: false,
				permission: 1,
			},
		},
		balance: {
			usage: '[user]',
			description: 'View a balance.',
			options: {
				enabled: true,
				global: false,
				permission: 0,
			},
		},
		collect: {
			usage: '',
			description: 'Collect generator funds.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		currency: {
			usage: '"set" <symbol> or "reset"',
			description: 'View and update the currency symbol.',
			options: {
				enabled: true,
				global: false,

				permission: 2,
			},
		},
		deposit: {
			usage: '<amount | "all">',
			description: 'Deposit funds from your wallet to the treasury.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		inventory: {
			usage: '[user] [page]',
			description: 'View an inventory.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		leaderboard: {
			usage: '["Wallet" | "Treasury" | "Total"] [page]',
			description: 'View top users in the economy',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		loan: {
			usage:
				'"propose" [options] or "cancel" <loan_id> or "accept" <loan_id> or "decline" <loan_id> or "view" <loan_id> | <user>',
			description: 'Loan funds to other users.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		pay: {
			usage: '<user> <amount | "all">',
			description: 'Pay funds to another user.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		purge: {
			usage:
				'"inventory" <"all" | user> or "market" <"all" | user> or "shop" <"all" | item> or "balance" <"all" | user> or "transaction" <"all" | user>',
			description: 'Delete economy-related content.',
			options: {
				enabled: true,
				global: false,

				permission: 2,
			},
		},
		transaction_log: {
			usage: '"set" <channel> or "remove"',
			description: 'Manage the transaction logging channel.',
			options: {
				enabled: true,
				global: false,

				permission: 2,
			},
		},
		withdraw: {
			usage: '<amount | "all">',
			description: 'Withdraw funds from the treasury to your wallet.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
	},
	income: {
		beg: {
			usage: '',
			description: 'Get some quick funds.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		coinflip: {
			usage: '<amount | "all">',
			description: 'Double the funds in your wallet by flipping a coin.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		crime: {
			usage: '',
			description: 'Commit a crime with a risk of fine.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		income: {
			usage: '',
			description: 'View all income commands and their settings.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		rob: {
			usage: '<user>',
			description: 'Rob users and steal up to their entire wallet.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		work: {
			usage: '',
			description: 'Earn funds.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
	},
	moderation: {
		ban: {
			usage: '<user> [reason]',
			description: 'Ban a user.',
			options: {
				enabled: true,
				global: false,

				permission: 1,
			},
		},
		infraction_log: {
			usage: '"set" <channel> or "remove"',
			description: 'Manage the infraction logging channel.',
			options: {
				enabled: true,
				global: false,

				permission: 2,
			},
		},
		infractions: {
			usage: '<user>',
			description: "Display information about a user's infractions.",
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		kick: {
			usage: '<user> [reason]',
			description: 'Kick a user.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		mute: {
			usage: '<user> [duration] [reason]',
			description: 'Mute a user.',
			options: {
				enabled: true,
				global: false,

				permission: 1,
			},
		},
		unban: {
			usage: '<userID>',
			description: 'Unban a user.',
			options: {
				enabled: true,
				global: false,

				permission: 1,
			},
		},
		unmute: {
			usage: '<user>',
			description: 'Unmute a user.',
			options: {
				enabled: true,
				global: false,

				permission: 1,
			},
		},
		warn: {
			usage: '<user> [reason]',
			description: 'Warn a user.',
			options: {
				enabled: true,
				global: false,

				permission: 1,
			},
		},
	},
	shop: {
		item: {
			usage:
				'"deactivate" <name> or "reactivate" <name> or "view" <name> or "create" <"generator" | "basic"> [options]',
			description: 'Manage shop items.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
		shop: {
			usage: '[page]',
			description: 'View shop items.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
	},
	statistics: {
		statistics: {
			usage: '"user" <user | "total">',
			description: 'View economy statistics.',
			options: {
				enabled: true,
				global: false,

				permission: 0,
			},
		},
	},
	utility: {
		clear: {
			usage: '[channel] [msgcount]',
			description:
				'Delete a number of messages in a channel. If not specified, delete all messages less than 2 weeks old.',
			options: {
				enabled: true,
				global: false,

				permission: 1,
			},
		},
		help: {
			usage: '[command]',
			description:
				'List available commands, or detailed information about a specified command.',
			options: {
				global: true,
				enabled: true,

				permission: 0,
			},
		},
		info: {
			usage: '<group> [channel]',
			description: "Send an embed about Economica's commands.",
			options: {
				enabled: true,
				global: false,

				permission: 2,
			},
		},
		invite: {
			usage: '',
			description: 'Get the invite link for Economica.',
			options: {
				global: true,
				enabled: false,

				permission: 0,
			},
		},
		ping: {
			usage: '',
			description: "Get Economica's latency",
			options: {
				global: true,
				enabled: true,

				permission: 0,
			},
		},
		servers: {
			usage: '',
			description: "Get Economica's server and member information.",
			options: {
				global: true,
				enabled: true,

				permission: 0,
			},
		},
	},
};
