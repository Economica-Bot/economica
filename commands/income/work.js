// const { Command } = require('discord.js-commando')
// const util = require('../../features/util')

// module.exports = class WorkCommand extends Command {
//     constructor(client) {
//         super(client, {
//             name: 'work2',
//             group: 'income',
//             memberName: 'work2',
//             guildOnly: true,
//             description: 'Earn cash money.',
//             details: 'Work to increase your cash balance.',
//             format: 'work',
//             examples: [
//                 'work'
//             ],
//             argsCount: 0
//         })
//     }

//     async run(message) {
//         const payout = await util.getCommandStats(message.guild.id, 'work')
//         const currencySymbol = await util.getCurrencySymbol(message.guild.id)
//         const amount = util.intInRange(payout.min, payout.max)
//         util.changeBal(message.guild.id, message.author.id, amount)
//         message.channel.send({ embed: util.embedify(
//             'GREEN', 
//             message.author.tag,
//             message.author.displayAvatarURL(),
//             `You worked and earned ${currencySymbol}${amount}!`
//             )
//         })
//     }
// }