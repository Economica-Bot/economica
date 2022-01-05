export const hyperlinks = {
	help: '[Help Me Understand](https://discord.gg/57rQ7aHTpX)',
	bug: '[Report An Issue](https://discord.gg/qEXKFth3vY)',
	suggest: '[Suggest An Improvement](https://discord.gg/Rez4Etbf9X)',
	insertAll: () => `${hyperlinks.help}\n${hyperlinks.bug}\n${hyperlinks.suggest}`
}

export const authors = {
	success: {
		name: 'Process Executed Successfully',
		iconURL: 'https://cdn.discordapp.com/emojis/843390419261194300.webp?size=96&quality=lossless'
	},
	warning: {
		name: 'Process Executed With Issues',
		iconURL: 'https://cdn.discordapp.com/emojis/843390419270107136.webp?size=96&quality=lossless'
	},
	abort: {
		name: 'Process Aborted',
		iconURL: 'https://cdn.discordapp.com/emojis/843390419270107136.webp?size=96&quality=lossless'
	},
	error: {
		name: 'Process Error',
		iconURL: 'https://cdn.discordapp.com/emojis/843390419303661569.webp?size=96&quality=lossless'
	}
}