const ms = require('ms')

const incomeSchema = require('../../util/mongo/schemas/income-sch')

module.exports = {
    name: 'setincome', 
    description: 'Configure an income command.',
    global: true, 
    options: [ 
        {
            name: 'income_command',
            description: 'Specify the desired income command.',
            type: 3, 
            choices: [ 
                {
                    name: 'Work',
                    value: 'work'
              ***REMOVED***
                {
                    name: 'Beg',
                    value: 'beg'
              ***REMOVED***
                {
                    name: 'Crime', 
                    value: 'crime'
              ***REMOVED***
                {
                    name: 'Rob',
                    value: 'rob'
              ***REMOVED***
                {
                    name: 'Coin Flip', 
                    value: 'coinflip'
              ***REMOVED***
                {
                    name: 'Craps',
                    value: 'craps'
                }
            ],
            required: true
      ***REMOVED*** 
        {
            name: 'min',
            description: 'Specify the minimum income for this command.',
            type: 4,
      ***REMOVED*** 
        {
            name: 'max',
            description: 'Specify the maximum income for this command.',
            type: 4,
      ***REMOVED*** 
        {
            name: 'cooldown',
            description: 'Specify the cooldown for this command.',
            type: 3,
      ***REMOVED***
        {
            name: 'chance',
            description: 'Specify the chance for this command.',
            type: 3,
      ***REMOVED***
        {
            name: 'minfine',
            description: 'Specify the minimum fine for this command.',
            type: 4,
      ***REMOVED***
        {
            name: 'maxfine',
            description: 'Specify the maximum fine for this command.',
            type: 4,
      ***REMOVED***
    ],
    async run(interaction, guild, author, args) {
        let econManagerRole = guild.roles.cache.find(role => {
            return role.name.toLowerCase() === 'economy manager'
        })

        if(!econManagerRole) {
            await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 4,
                data: {
                    content: 'Please create an \`Economy Manager\` role!',
              ***REMOVED***
            }})

            return
        }

        if(!author.roles.cache.has(econManagerRole.id)) {
            embed = util.embedify(
                'RED',
                author.username, 
                author.displayAvatarURL(),
                `You must have the <@&${econManagerRole.id}> role.`
            )

            await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 4,
                data: {
                    embeds: [ embed ],
              ***REMOVED***
            }})

            return
        } 

        let properties = Object.entries(await util.getCommandStats(guild.id, args[0].value))
        const cSymbol = await util.getCurrencySymbol(guild.id)
        const incomeEmbed = util.embedify(
            'GREEN',
            `Updated ${args[0].value}`,
            client.user.displayAvatarURL()
        )

        let fields = []
        args.forEach(arg => {
            if(arg.name !== 'income_command')
            fields.push([arg.name, arg.value])
        })

        //If provided fields do not match command properties
        if (fields.length !== properties.length) { 
            embed = util.embedify(
                'RED',
                author.user.username, 
                author.user.displayAvatarURL(),
                `Incorrect number of fields: \`${args.length - 1}\`
                Format: \`${this.name} ${args[0].value} [${properties.map(x => x[0]).join('] [')}]\``
            ) 
        
            await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 4,
                data: {
                    embeds: [ embed ],
              ***REMOVED***
            }})

            return 
        }

        let description = ''
        for (let i = 0; i < properties.length; i++) { 
            if(['min', 'max', 'minFine', 'maxFine'].includes(properties[i][0])) { 
                if(+fields[i][1]) {
                    fields[i][1] = +fields[i][1]
                    properties[i][1] = fields[i][1]
                    incomeEmbed.addField(
                        `${properties[i][0]}`,
                        `${cSymbol}${fields[i][1]}`,
                        true
                    )
                } 
            } else if(['cooldown'].includes(properties[i][0])) { 
                if(ms(fields[i][1])) {
                    properties[i][1] = ms(fields[i][1])
                    incomeEmbed.addField(
                        `${properties[i][0]}`,
                        `${ms(ms(fields[i][1]))}`,
                        true
                    )
                } else {
                    description += (`Invalid parameter: \`${fields[i][1]}\`\n\`${properties[i][0]}\` must be a time!`)
                    return
                }
            } else if(['chance'].includes(properties[i][0])) { 
                if(parseFloat(fields[i][1])) {
                    fields[i][1] = parseFloat(fields[i][1])
                    if(fields[i][1] < 1) {
                        fields[i][1] *= 100
                        properties[i][1] = fields[i][1]
                    } else {
                        properties[i][1] = fields[i][1] 
                    }

                    incomeEmbed.addField(
                        `${properties[i][0]}`,
                        `${fields[i][1]}%`,
                        true
                    )
                } else {
                    description += (`Invalid parameter: \`${fields[i][1]}\`\n\`${properties[i][0]}\` must be a percentage!`)
                }
            }
        }

        incomeEmbed.setDescription(description)

        await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
                embeds: [ incomeEmbed ],
          ***REMOVED***
        }})

        properties = Object.fromEntries(properties)
            await incomeSchema.findOneAndUpdate({ 
                guildID: guild.id 
          ***REMOVED*** {
                $set: {
                    [args[0].value]: properties
                }
          ***REMOVED*** {
                upsert: true,
                new: true
            }).exec()
    }
}