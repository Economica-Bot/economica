const bet = {
	name: 'bet',
	description: 'Place a bet.',
	type: 'INTEGER',
	required: true,
};

const number_one = {
	name: 'number_one',
	description: 'Specify the first number.',
	type: 'INTEGER',
	required: true,
};

const number_two = {
	name: 'number_two',
	description: 'Specify the second number.',
	type: 'INTEGER',
	required: true,
};

const number_three = {
	name: 'number_three',
	description: 'Specify the third number.',
	type: 'INTEGER',
	required: true,
};

const number_four = {
	name: 'number_four',
	description: 'Specify the fourth number.',
	type: 'INTEGER',
	required: true,
};

const number_five = {
	name: 'number_five',
	description: 'Specify the fifth number.',
	type: 'INTEGER',
	required: true,
};

const number_six = {
	name: 'number_six',
	description: 'Specify the sixth number.',
	type: 'INTEGER',
	required: true,
};

const globalCreateOptions = {
	required: [
		{
			name: 'name',
			description:
				'The name of the item. This is also how it will be referenced for future actions.',
			type: 'STRING',
			required: true,
		},
		{
			name: 'price',
			description:
				'The cost of the item and the minimum balance needed to purchase.',
			type: 'INTEGER',
			required: true,
		},
		{
			name: 'stackable',
			description: 'Whether or not this item can stack.',
			type: 'BOOLEAN',
			required: true,
		},
	],
	optional: [
		{
			name: 'description',
			description: 'The description/info of the item.',
			type: 'STRING',
			required: false,
		},
		{
			name: 'duration',
			description: 'Time until the item is deactivated in the shop.',
			type: 'STRING',
			required: false,
		},
		{
			name: 'stock',
			description:
				'Quantity of this item that can be purchased until the item is deactivated in the shop.',
			type: 'INTEGER',
			required: false,
		},
		{
			name: 'required_role',
			description: 'Role that a user must have to purchase.',
			type: 'ROLE',
			required: false,
		},
		{
			name: 'required_items',
			description:
				'Inventory items or generators that a user must have to purchase.',
			type: 'STRING',
			required: false,
		},
		{
			name: 'required_bank',
			description:
				'The minimum bank balance that a user must have to purchase. Cannot be lower than the item price.',
			type: 'INTEGER',
			required: false,
		},
		{
			name: 'role_given',
			description: 'A list of role mentions given on item purchase.',
			type: 'ROLE',
			required: false,
		},
		{
			name: 'role_removed',
			description: 'A list of role mentions removed on item purchase.',
			type: 'ROLE',
			required: false,
		},
	],
};

module.exports = {
	commands: [
		{
			name: 'initialize',
			module: 'application',
			usage: '',
			description: 'Initialize the database.',
			settings: {
				enabled: true,
				global: false,
				owner: true,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: null,
		},
		{
			name: 'load',
			module: 'application',
			usage: '<command>',
			description: 'Load a slash command.',
			settings: {
				enabled: true,
				global: true,
				owner: true,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					type: 'STRING',
					name: 'command',
					description: 'Specify a command.',
					required: true,
				},
			],
		},
		{
			name: 'reset',
			module: 'application',
			usage: '',
			description: 'Reset slash commands.',
			settings: {
				enabled: true,
				global: true,
				owner: true,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'guild',
					description: 'Reset guild slash commands',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: true,
						owner: true,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: null,
				},
			],
		},
		{
			name: 'dice',
			module: 'casino',
			usage: '<bet> <number>',
			description: 'Roll a dice.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'bet',
					description: 'Specify a bet.',
					type: 'INTEGER',
					required: true,
				},
				{
					name: 'number',
					description: 'Choose a number.',
					type: 'INTEGER',
					required: true,
				},
			],
		},
		{
			name: 'roulette',
			module: 'casino',
			usage:
				'"inside" ("single" | "split" | "street" | "corner" | "double_street" | "trio" | "first_four") [settings] <bet> or "outside" ("half" | "color" | "even_or_odd" | "dozen" | "column" | "snake") [settings] <bet>',
			description:
				'Play roulette.\nInside bets -> (1-36), outside bets -> (0-36).',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'inside',
					description: 'Inside Bets',
					type: 'SUB_COMMAND_GROUP',
					settings: {
						enabled: true,
						global: true,
						owner: true,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'single',
							description: 'Bet on a single number.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [number_one, bet],
						},
						{
							name: 'split',
							description:
								'Bet on two distinct vertically/horizontally adjacent numbers.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [number_one, number_two, bet],
						},
						{
							name: 'street',
							description:
								'Bet on three distinct consecutive numbers in a horizontal line.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [number_one, number_two, number_three, bet],
						},
						{
							name: 'corner',
							description: 'Bet on four numbers that meet at one corner.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [number_one, number_two, number_three, number_four, bet],
						},
						{
							name: 'double_street',
							description:
								'Bet on six consecutive numbers that form two horizontal lines.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								number_one,
								number_two,
								number_three,
								number_four,
								number_five,
								number_six,
								bet,
							],
						},
						{
							name: 'trio',
							description:
								'A three-number bet that involves at least one zero.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'choice',
									description: 'Choose triangle.',
									type: 'STRING',
									required: true,
									choices: [
										{
											name: '0-1-2',
											value: '0-1-2',
										},
										{
											name: '0-2-3',
											value: '0-2-3',
										},
									],
								},
								bet,
							],
						},
						{
							name: 'first_four',
							description: 'Bet on 0-1-2-3.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [bet],
						},
					],
				},
				{
					name: 'outside',
					description: 'Outside Bets',
					type: 'SUB_COMMAND_GROUP',
					settings: {
						enabled: true,
						global: true,
						owner: true,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'half',
							description: 'A bet that the number will be in the chosen range.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'choice',
									description: 'Choose High or Low',
									type: 'STRING',
									required: true,

									choices: [
										{
											name: 'low',
											value: 'low',
										},
										{
											name: 'high',
											value: 'high',
										},
									],
								},
								bet,
							],
						},
						{
							name: 'color',
							description: 'A bet that the number will be the chosen color.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'choice',
									description: 'Choose Red or Black',
									type: 'STRING',
									required: true,
									choices: [
										{
											name: 'red',
											value: 'red',
										},
										{
											name: 'black',
											value: 'black',
										},
									],
								},
								bet,
							],
						},
						{
							name: 'even_or_odd',
							description: 'A bet that the number will be of the chosen type.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'choice',
									description: 'Choose Even or Odd',
									type: 'STRING',
									required: true,
									choices: [
										{
											name: 'Even',
											value: 'even',
										},
										{
											name: 'Odd',
											value: 'odd',
										},
									],
								},
								bet,
							],
						},
						{
							name: 'dozen',
							description: 'A bet that the number will be in the chosen dozen.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'choice',
									description: 'Choose a dozen',
									type: 'STRING',
									required: true,
									choices: [
										{
											name: 'First Dozen',
											value: 'first',
										},
										{
											name: 'Second Dozen',
											value: 'second',
										},
										{
											name: 'Third Dozen',
											value: 'third',
										},
									],
								},
								bet,
							],
						},
						{
							name: 'column',
							description:
								'A bet that the number will be in the chosen vertical column.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'choice',
									description: 'Choose a column',
									type: 'STRING',
									required: true,
									choices: [
										{
											name: 'First Column',
											value: 'first',
										},
										{
											name: 'Second Column',
											value: 'second',
										},
										{
											name: 'Third Column',
											value: 'third',
										},
									],
								},
								bet,
							],
						},
						{
							name: 'snake',
							description:
								'A special bet that covers the numbers 1, 5, 9, 12, 14, 16, 19, 23, 27, 30, 32, and 34.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [bet],
						},
					],
				},
			],
		},
		{
			command: 'command',
			module: 'config',
			usage:
				'"permission" [settings] <command> args... or "config" [settings] <command> args...)',
			description: 'Manage commands.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: ['ADMINISTRATOR'],
				},
			},
			options: [
				{
					name: 'permission',
					description: 'Manage command permissions.',
					type: 'SUB_COMMAND_GROUP',
					settings: {
						enabled: true,
						global: true,
						owner: true,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'view',
							description: "View a command's permissions.",
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'command',
									description: 'Specify a command.',
									type: 'STRING',
									required: true,
								},
							],
						},
						{
							name: 'enable',
							description: 'Enable a command.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'command',
									description: 'Specify a command.',
									type: 'STRING',
									required: true,
								},
								{
									name: 'channel',
									description: 'Specify a channel.',
									type: 'CHANNEL',
									required: false,
								},
								{
									name: 'role',
									description: 'Specify a role.',
									type: 'ROLE',
									required: false,
								},
								{
									name: 'cooldown',
									description: 'Specify a cooldown.',
									type: 'STRING',
									required: false,
								},
							],
						},
						{
							name: 'disable',
							description: 'Disable a command.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'command',
									description: 'Specify a command.',
									type: 'STRING',
									required: true,
								},
								{
									name: 'channel',
									description: 'Specify a channel.',
									type: 'CHANNEL',
									required: false,
								},
								{
									name: 'role',
									description: 'Specify a role.',
									type: 'ROLE',
									required: false,
								},
								{
									name: 'cooldown',
									description: 'Specify a cooldown.',
									type: 'STRING',
									required: false,
								},
							],
						},
						{
							name: 'reset',
							description: 'Reset a command.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'command',
									description: 'Specify a command.',
									type: 'STRING',
									required: true,
								},
							],
						},
					],
				},
				{
					name: 'config',
					description: 'Configure a command.',
					type: 'SUB_COMMAND_GROUP',
					settings: {
						enabled: true,
						global: true,
						owner: true,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						//module
						{
							name: 'income_command',
							description: 'Configure an income command.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: true,
								owner: true,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'command',
									description: 'Specify an income command.',
									type: 'STRING',
									required: true,
								},
								{
									name: 'reset',
									description: 'Reset this income command.',
									type: 'BOOLEAN',
									required: false,
								},
								{
									name: 'min',
									description: 'Specify the minimum income for this command.',
									type: 'INTEGER',
								},
								{
									name: 'max',
									description: 'Specify the maximum income for this command.',
									type: 'INTEGER',
								},
								{
									name: 'chance',
									description: 'Specify the chance for this command.',
									type: 'STRING',
								},
								{
									name: 'minfine',
									description: 'Specify the minimum fine for this command.',
									type: 'INTEGER',
								},
								{
									name: 'maxfine',
									description: 'Specify the maximum fine for this command.',
									type: 'INTEGER',
								},
							],
						},
					],
				},
			],
		},
		{
			name: 'module',
			module: 'config',
			usage: '"enable" <module> or "disable" <module>)',
			description: 'Manage modules.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: ['ADMINISTRATOR'],
				},
			},
			options: [
				{
					name: 'enable',
					description: 'Enable a module.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: true,
						owner: true,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'module',
							description: 'Specify a module.',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'disable',
					description: 'Disable a module.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: true,
						owner: true,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'module',
							description: 'Specify a module.',
							type: 'STRING',
							required: true,
						},
					],
				},
			],
		},
		{
			name: 'add_money',
			module: 'economy',
			usage: '<user> <amount> <wallet | string>',
			description: "Add or subtract funds from a user's balances.",
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [{ role: 'ECONOMY MANAGER', required: true }],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Specify a user.',
					type: 'USER',
					required: true,
				},
				{
					name: 'amount',
					description: 'Specify the amount',
					type: 'INTEGER',
					required: true,
				},
				{
					name: 'target',
					description: 'Specify where the money is added.',
					type: 'STRING',
					choices: [
						{
							name: 'wallet',
							value: 'wallet',
						},
						{
							name: 'treasury',
							value: 'treasury',
						},
					],
					required: true,
				},
			],
		},
		{
			name: 'balance',
			module: 'economy',
			usage: '[user]',
			description: 'View a balance.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Name a user you wish to see the balance of.',
					type: 'USER',
				},
			],
		},
		{
			name: 'collect',
			module: 'economy',
			usage: '',
			description: 'Collect generator funds.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: null,
		},
		{
			name: 'currency',
			module: 'economy',
			usage: '"set" <symbol> or "reset"',
			description: 'View and update the currency symbol.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [{ role: 'ECONOMY MANAGER', required: true }],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'set',
					description: 'Set the currency symbol.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [{ role: 'ECONOMY MANAGER', required: true }],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'symbol',
							description: 'Specify a symbol.',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'reset',
					description: 'Reset the currency symbol.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [{ role: 'ECONOMY MANAGER', required: true }],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: null,
				},
			],
		},
		{
			name: 'deposit',
			module: 'economy',
			usage: '<amount | "all">',
			description: 'Deposit funds from your wallet to the treasury.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'amount',
					description: 'Specify the amount you wish to deposit.',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'inventory',
			module: 'economy',
			usage: '[user] [page]',
			description: 'View an inventory.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Name a user you wish to see the inventory of.',
					type: 'USER',
				},
				{
					name: 'page',
					description: 'Specify the page.',
					type: 'INTEGER',
				},
			],
		},
		{
			name: 'leaderboard',
			module: 'economy',
			usage: '["Wallet" | "Treasury" | "Total"] [page]',
			description: 'View top users in the economy',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'type',
					description: 'Specify the value to order by.',
					type: 'STRING',
					choices: [
						{
							name: 'Wallet',
							value: 'wallet',
						},
						{
							name: 'Treasury',
							value: 'treasury',
						},
						{
							name: 'Total',
							value: 'total',
						},
					],
					required: false,
				},
				{
					name: 'page',
					description: 'Specify the page.',
					type: 'INTEGER',
				},
			],
		},
		{
			name: 'loan',
			module: 'economy',
			usage:
				'"propose" [settings] or "cancel" <loan_id> or "accept" <loan_id> or "decline" <loan_id> or "view" <loan_id> | <user>',
			description: 'Loan funds to other users.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'propose',
					description: 'Add a loan to the registry',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'user',
							description: 'Specify a user.',
							type: 'USER',
							required: true,
						},
						{
							name: 'principal',
							description: 'Specify the principal.',
							type: 'INTEGER',
							required: true,
						},
						{
							name: 'repayment',
							description: 'Specify the repayment.',
							type: 'INTEGER',
							required: true,
						},
						{
							name: 'length',
							description: 'Specify the life of the loan.',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'cancel',
					description: 'Cancel a pending loan in the registry.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'loan_id',
							description: 'Specify a loan.',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'accept',
					description: 'Accept a pending loan in the registry.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'loan_id',
							description: 'Specify a loan.',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'decline',
					description: 'Decline a pending loan in the registry.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'loan_id',
							description: 'Specify a loan.',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'view',
					description: 'View the loan registry.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'loan_id',
							description: 'Specify a loan.',
							type: 'STRING',
						},
						{
							name: 'user',
							description: 'Specify a loan participator.',
							type: 'USER',
						},
					],
				},
			],
		},
		{
			name: 'pay',
			module: 'economy',
			usage: '<user> <amount | "all">',
			description: 'Pay funds to another user.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Specify a user.',
					type: 'USER',
					required: true,
				},
				{
					name: 'amount',
					description: 'Specify an amount to pay.',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'purge',
			module: 'economy',
			usage:
				'"inventory" <"all" | user> or "market" <"all" | user> or "shop" <"all" | item> or "balance" <"all" | user> or "transaction" <"all" | user>',
			description: 'Delete economy-related content.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [{ role: 'ECONOMY MANAGER', required: true }],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'inventory',
					description: 'Delete inventory data.',
					type: 'SUB_COMMAND_GROUP',
					options: [
						{
							name: 'all',
							description: 'All inventories.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: ['ADMINISTRATOR'],
								},
							},
							options: null,
						},
						{
							name: 'user',
							description: 'Specify a user.',
							type: 'SUB_COMMAND',
							options: [
								{
									name: 'user',
									description: 'Specify a user.',
									type: 'USER',
									required: true,
								},
							],
						},
					],
				},
				{
					name: 'market',
					description: 'Delete market data.',
					type: 'SUB_COMMAND_GROUP',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: ['ADMINISTRATOR'],
						},
					},
					options: [
						{
							name: 'all',
							description: 'All listings.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: ['ADMINISTRATOR'],
								},
							},
							options: null,
						},
						{
							name: 'user',
							description: 'Specify a user.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: ['ADMINISTRATOR'],
								},
							},
							options: [
								{
									name: 'user',
									description: 'Specify a user.',
									type: 'USER',
									required: true,
								},
							],
						},
					],
				},
				{
					name: 'shop',
					description: 'Delete shop data.',
					type: 'SUB_COMMAND_GROUP',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: ['ADMINISTRATOR'],
						},
					},
					options: [
						{
							name: 'all',
							description: 'All listings.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: ['ADMINISTRATOR'],
								},
							},
							options: null,
						},
						{
							name: 'item',
							description: 'Specify an item.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: ['ADMINISTRATOR'],
								},
							},
							options: [
								{
									name: 'item',
									description: 'Specify an item.',
									type: 'STRING',
									required: true,
								},
							],
						},
					],
				},
				{
					name: 'balance',
					description: 'Delete balance data.',
					type: 'SUB_COMMAND_GROUP',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: ['ADMINISTRATOR'],
						},
					},
					options: [
						{
							name: 'all',
							description: 'All balances.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: ['ADMINISTRATOR'],
								},
							},
							options: null,
						},
						{
							name: 'user',
							description: 'Specify a user.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: ['ADMINISTRATOR'],
								},
							},
							options: [
								{
									name: 'user',
									description: 'Specify a user.',
									type: 'USER',
									required: true,
								},
							],
						},
					],
				},
				{
					name: 'transaction',
					description: 'Delete transaction data.',
					type: 'SUB_COMMAND_GROUP',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: ['ADMINISTRATOR'],
						},
					},
					options: [
						{
							name: 'all',
							description: 'All transactions.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: ['ADMINISTRATOR'],
								},
							},
							options: null,
						},
						{
							name: 'user',
							description: 'Specify a user.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: ['ADMINISTRATOR'],
								},
							},
							options: [
								{
									name: 'user',
									description: 'Specify a user.',
									type: 'USER',
									required: true,
								},
							],
						},
					],
				},
			],
		},
		{
			name: 'transaction_log',
			module: 'economy',
			usage: '"set" <channel> or "remove"',
			description: 'Manage the transaction logging channel.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [{ role: 'ECONOMY MANAGER', required: true }],
				permissions: {
					clientPermissions: [],
					userPermissions: ['ADMINISTRATOR'],
				},
			},
			options: [
				{
					name: 'set',
					description: 'Set the transaction log.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [{ role: 'ECONOMY MANAGER', required: true }],
						permissions: {
							clientPermissions: [],
							userPermissions: ['ADMINISTRATOR'],
						},
					},
					options: [
						{
							name: 'channel',
							description: 'Specify a channel.',
							type: 'CHANNEL',
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove the transaction log.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [{ role: 'ECONOMY MANAGER', required: true }],
						permissions: {
							clientPermissions: [],
							userPermissions: ['ADMINISTRATOR'],
						},
					},
					options: null,
				},
			],
		},
		{
			name: 'withdraw',
			module: 'economy',
			usage: '<amount | "all">',
			description: 'Withdraw funds from the treasury to your wallet.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'amount',
					description: 'Specify the amount you wish to withdraw.',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'beg',
			module: 'income',
			usage: '',
			description: 'Get some quick funds.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: null,
		},
		{
			name: 'coinflip',
			module: 'income',
			usage: '<amount | "all">',
			description: 'Double the funds in your wallet by flipping a coin.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'amount',
					description: 'Specify the amount you wish to withdraw.',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'crime',
			module: 'income',
			usage: '',
			description: 'Commit a crime with a risk of fine.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: null,
		},
		{
			name: 'income',
			module: 'income',
			usage: '',
			description: 'View all income commands and their settings.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: null,
		},
		{
			name: 'rob',
			module: 'income',
			usage: '<user>',
			description: 'Rob users and steal up to their entire wallet.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Name a user you wish to see the balance of.',
					type: 'USER',
					required: true,
				},
			],
		},
		{
			name: 'work',
			module: 'income',
			usage: '',
			description: 'Earn funds.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: null,
		},
		{
			name: 'ban',
			module: 'moderation',
			usage: '<user> [reason]',
			description: 'Ban a user.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: ['BAN_MEMBERS'],
					userPermissions: ['BAN_MEMBERS'],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Specify a user.',
					type: 'USER',
					required: true,
				},
				{
					name: 'reason',
					description: 'Provide a reason.',
					type: 'STRING',
				},
			],
		},
		{
			name: 'infraction_log',
			module: 'moderation',
			usage: '"set" <channel> or "remove"',
			description: 'Manage the infraction logging channel.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: ['ADMINISTRATOR'],
				},
			},
			options: [
				{
					name: 'set',
					description: 'Set the infraction log.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: ['ADMINISTRATOR'],
						},
					},
					options: [
						{
							name: 'channel',
							description: 'Specify a channel.',
							type: 'CHANNEL',
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove the infraction log.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: ['ADMINISTRATOR'],
						},
					},
					options: null,
				},
			],
		},
		{
			name: 'infractions',
			module: 'moderation',
			usage: '<user>',
			description: "Display information about a user's infractions.",
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'view',
					description: 'View infractions.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'user',
							description: 'Specify a user.',
							type: 'USER',
							required: true,
						},
						{
							name: 'infraction_id',
							description: 'Specify an infraction.',
							type: 'STRING',
						},
					],
				},
				{
					name: 'delete',
					description: 'Delete infractions.',
					type: 'SUB_COMMAND',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'user',
							description: 'Specify a user.',
							type: 'USER',
							required: true,
						},
						{
							name: 'infraction_id',
							description: 'Specify an infraction.',
							type: 'STRING',
						},
					],
				},
			],
		},
		{
			name: 'kick',
			module: 'moderation',
			usage: '<user> [reason]',
			description: 'Kick a user.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: ['KICK_MEMBERS'],
					userPermissions: ['KICK_MEMBERS'],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Name a user you wish to kick.',
					type: 'USER',
					required: true,
				},
				{
					name: 'reason',
					description: 'Provide a reason.',
					type: 'STRING',
				},
			],
		},
		{
			name: 'mute',
			module: 'moderation',
			usage: '<user> [duration] [reason]',
			description: 'Mute a user.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [{ role: 'MUTED', required: false }],
				permissions: {
					clientPermissions: ['MANAGE_ROLES'],
					userPermissions: ['MUTE_MEMBERS'],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Name a user you wish to warn.',
					type: 'USER',
					required: true,
				},
				{
					name: 'duration',
					description: 'Specify a duration.',
					type: 'STRING',
				},
				{
					name: 'reason',
					description: 'Provide a reason.',
					type: 'STRING',
				},
			],
		},
		{
			name: 'unban',
			module: 'moderation',
			usage: '<userID>',
			description: 'Unban a user.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: ['BAN_MEMBERS'],
					userPermissions: ['BAN_MEMBERS'],
				},
			},
			options: [
				{
					name: 'user_id',
					description: 'Specify the ID of a user to unban.',
					type: 'STRING',
					required: true,
				},
			],
		},
		{
			name: 'unmute',
			module: 'moderation',
			usage: '<user>',
			description: 'Unmute a user.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: ['MUTED'],
				permissions: {
					clientPermissions: ['MANAGE_ROLES'],
					userPermissions: ['MUTE_MEMBERS'],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Specify a user to unmute.',
					type: 'USER',
					required: true,
				},
			],
		},
		{
			name: 'warn',
			module: 'moderation',
			usage: '<user> [reason]',
			description: 'Warn a user.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: ['MUTE_MEMBERS'],
				},
			},
			options: [
				{
					name: 'user',
					description: 'Name a user you wish to warn.',
					type: 'USER',
					required: true,
				},
				{
					name: 'reason',
					description: 'Provide a reason.',
					type: 'STRING',
				},
			],
		},
		{
			name: 'item',
			module: 'shop',
			usage:
				'"deactivate" <name> or "reactivate" <name> or "view" <name> or "create" <"generator" | "basic"> [settings]',
			description: 'Manage shop items.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'buy',
					description: 'Buy an item from the shop.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'name',
							description: 'The name of the item to be purchased.',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'deactivate',
					description: 'Deactivate an item from the shop.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'name',
							description: 'The name of the item to be reactivated.',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'reactivate',
					description: 'Reactivate an item from the shop.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'name',
							description: 'The name of the item to be removed.',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'view',
					description: 'View an item in more detail.',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'name',
							description: 'The name of the item to view',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'create',
					description: 'Create a new shop item.',
					type: 'SUB_COMMAND_GROUP',
					options: [
						{
							name: 'generator',
							description:
								'Create a new shop item that automatically generates money periodically.',
							type: 'SUB_COMMAND',
							options: [
								...globalCreateOptions.required,
								{
									name: 'generator_period',
									description: 'The period of time between money generating',
									type: 'STRING',
									required: true,
								},
								{
									name: 'generator_amount',
									description:
										'The amount of money generated after each period.',
									type: 'INTEGER',
									required: true,
								},
								...globalCreateOptions.optional,
							],
						},
						{
							name: 'basic',
							description: 'Create a basic shop item without a template.',
							type: 'SUB_COMMAND',
							options: [
								...globalCreateOptions.required,
								...globalCreateOptions.optional,
							],
						},
					],
				},
			],
		},
		{
			name: 'shop',
			module: 'shop',
			usage: '[page]',
			description: 'View shop items.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'page',
					description: 'Specify the page.',
					type: 'INTEGER',
					required: false,
				},
			],
		},
		{
			name: 'statistics',
			module: 'statistics',
			usage: '"user" <user | "total">',
			description: 'View economy statistics.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'balance',
					description: 'The statistics for user balance.',
					type: 'SUB_COMMAND_GROUP',
					settings: {
						enabled: true,
						global: false,
						owner: false,
						roles: [],
						permissions: {
							clientPermissions: [],
							userPermissions: [],
						},
					},
					options: [
						{
							name: 'user',
							description: 'Specify a user.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: [
								{
									name: 'user',
									description: 'Specify a user.',
									type: 'USER',
									required: true,
								},
							],
						},
						{
							name: 'total',
							description: 'View total balance trend.',
							type: 'SUB_COMMAND',
							settings: {
								enabled: true,
								global: false,
								owner: false,
								roles: [],
								permissions: {
									clientPermissions: [],
									userPermissions: [],
								},
							},
							options: null,
						},
					],
				},
			],
		},
		{
			name: 'clear',
			module: 'utility',
			usage: '[channel] [msgcount]',
			description: 'Delete a number of messages in a channel.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: ['MANAGE_MESSAGES'],
					userPermissions: ['MANAGE_MESSAGES'],
				},
			},
			options: [
				{
					name: 'channel',
					description: 'Select a channel.',
					type: 'CHANNEL',
					required: false,
				},
				{
					name: 'msgcount',
					description: 'The count of messages to delete, between 0 and 100.',
					type: 'NUMBER',
					required: false,
				},
			],
		},
		{
			name: 'help',
			module: 'utility',
			usage: '[command]',
			description:
				'List available commands, or detailed information about a specified command.',
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: [
				{
					name: 'command',
					description: 'Specify a command.',
					type: 'STRING',
				},
			],
		},
		{
			name: 'info',
			module: 'utility',
			usage: '<module> [channel]',
			description: "Send an embed about Economica's commands.",
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: ['ADMINISTRATOR'],
				},
			},
			options: [
				{
					name: 'group',
					description: 'Specify a command group.',
					type: 'STRING',
					required: true,
					choices: [
						{
							name: 'Configuration',
							value: 'config',
						},
						{
							name: 'Economy',
							value: 'economy',
						},
						{
							name: 'Income',
							value: 'income',
						},
						{
							name: 'Moderation',
							value: 'moderation',
						},
						{
							name: 'Shop',
							value: 'shop',
						},
						{
							name: 'Statistics',
							value: 'statistics',
						},
						{
							name: 'Utility',
							value: 'utility',
						},
					],
				},
				{
					name: 'channel',
					description: 'Specify a channel.',
					type: 'CHANNEL',
				},
			],
		},
		{
			name: 'invite',
			module: 'utility',
			usage: '',
			description: 'Get the invite link for Economica.',
			settings: {
				enabled: false,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: null,
		},
		{
			name: 'ping',
			module: 'utility',
			usage: '',
			description: "Get Economica's latency",
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
		},
		{
			name: 'servers',
			module: 'utility',
			usage: '',
			description: "Get Economica's server and member information.",
			settings: {
				enabled: true,
				global: false,
				owner: false,
				roles: [],
				permissions: {
					clientPermissions: [],
					userPermissions: [],
				},
			},
			options: null,
		},
	],
};
