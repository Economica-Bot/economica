require('module-alias/register')
const ms = require('ms')

const incomeSchema = require('@schemas/income-sch')

module.exports = {
    name: 'setincome', 
    group: 'income',
    description: 'Configure an income command.',
    format: '<command> [...fields]',
    global: true, 
    options: [ 
        {
            name: 'income_command',
            description: 'Specify the desired income command.',
            type: 3, //STRING
            required: true,
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
    async run(interaction, guild, author, options) {
        let econManagerRole = guild.roles.cache.find(role => {
            return role.name.toLowerCase() === 'economy manager'
        })

        if(!econManagerRole) {
            embed = util.embedify(
                'RED',
                author.username, 
                author.displayAvatarURL(),
                'Please create an \`Economy Manager\` role!'
            )

            interaction.reply({ embeds: [ embed ]})
            return
        }

        if(!author.roles.cache.has(econManagerRole.id)) {
            embed = util.embedify(
                'RED',
                author.username, 
                author.displayAvatarURL(),
                `You must have the <@&${econManagerRole.id}> role.`
            )

            interaction.reply({ embeds: [ embed ]})
            return
        } 

        let income_command = options._hoistedOptions[0].value
        let properties = Object.entries(await util.getCommandStats(guild.id, income_command))
        let fields = []
        options._hoistedOptions.forEach(option => {
            if(option.name !== 'income_command')
            fields.push([option.name, option.value])
        })

        const cSymbol = await util.getCurrencySymbol(guild.id)
        const incomeEmbed = util.embedify(
            'GREEN',
            `Updated ${income_command}`,
            client.user.displayAvatarURL()
        )

        //Validate and transfer provided fields
        let description = ''
        properties.forEach(property => {
            const field = fields.find(field => field[0] === property[0])
            if(field) {
                if (['cooldown'].includes(field[0])) {
                    if(ms(field[1])) {
                        property[1] = ms(field[1])
                        incomeEmbed.addField(
                            `${property[0]}`,
                            `${ms(ms(property[1]))}`,
                            true
                        )
                    } else {
                        description += (`Invalid parameter: \`${field[1]}\`\n\`${field[0]}\` must be a time!\n`)
                    }
                } else if (['chance'].includes(field[0])) {
                    if(parseFloat(field[1])) {
                        property[1] = field[1] < 1 ? parseFloat(field[1]) * 100 : parseFloat(field[1])
                        incomeEmbed.addField(
                            `${property[0]}`,
                            `${property[1]}%`,
                            true
                        )
                    } else {
                        description += (`Invalid parameter: \`${field[1]}\`\n\`${field[0]}\` must be a percentage!\n`)    
                    }
                } else {
                    property[1] = +field[1]
                    incomeEmbed.addField(
                        `${property[0]}`,
                        `${cSymbol}${property[1]}`,
                        true
                    )
                }
            }
        })
        
        incomeEmbed.setDescription(description)
        
        await interaction.reply({ embeds: [ incomeEmbed ], ephemeral: true })
 
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