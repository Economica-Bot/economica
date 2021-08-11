const globalCreateOptions = {
    required: [
        {
            name: 'name', description: 'The name of the item. This is also how it will be referenced for future actions.', type: apiTypes.String, required: true
      ***REMOVED*** {
            name: 'price', description: 'The cost of the item and the minimum balance needed to purchase.', type: apiTypes.Integer, required: true
      ***REMOVED***
    ], optional: [
        {
            name: 'description', description: 'The description/info of the item.', type: apiTypes.String, required: false
      ***REMOVED*** {
            name: 'is_inventory_item', description: 'If the item is to be stored in the inventory of the buyer. True/False', type: apiTypes.Boolean, required: false
      ***REMOVED*** {
            name: 'duration', description: 'Time until the item is deactivated in the shop.', type: apiTypes.String, required: false
      ***REMOVED*** {
            name: 'stock', description: 'Quantity of this item that can be purchased until the item is deactivated in the shop.', type: apiTypes.Integer, required: false
      ***REMOVED*** {
            name: 'required_roles', description: 'Roles that a user must have to purchase.', type: apiTypes.Role, required: false
      ***REMOVED*** {
            name: 'required_items', description: 'Inventory items or generators that a user must have to purchase.', type: apiTypes.String, required: false
      ***REMOVED*** {
            name: 'required_balance', description: 'The minimum balance that a user must have to purchase. Cannot be lower than the item price.', type: apiTypes.Integer, required: false
      ***REMOVED***
    ]
}

module.exports = {
    name: 'item',
    description: 'Perform actions with the shop\'s items.',
    group: 'shop',
    global: true,
    options: [
        {
            name: 'create',
            description: 'Create a new shop item.',
            type: apiTypes.SubcommandGroup,
            options: [
                {
                    name: 'role',
                    description: 'Create a new shop item that gives and/or removes roles.',
                    type: apiTypes.Subcommand,
                    options: [
                        ...globalCreateOptions.required, {
                            name: 'role_given',
                            description: 'A list of role mentions given on item purchase.',
                            type: apiTypes.Role,
                            required: false
                      ***REMOVED*** {
                            name: 'role_removed',
                            description: 'A list of role mentions removed on item purchase.',
                            type: apiTypes.Role,
                            required: false
                      ***REMOVED*** {
                            name: 'role_expiration_time',
                            description: 'The amount of time until the given role will be removed. Never by default.',
                            type: apiTypes.String,
                            required: false
                      ***REMOVED***
                        ...globalCreateOptions.optional
                    ]
              ***REMOVED*** {
                    name: 'generator',
                    description: 'Create a new shop item that automatically generates money periodically.',
                    type: apiTypes.Subcommand,
                    options: [
                        ...globalCreateOptions.required, {
                            name: 'generator_period',
                            description: 'The period of time between money generating',
                            type: apiTypes.String,
                            required: true
                      ***REMOVED*** {
                            name: 'generator_amount',
                            description: 'The amount of money generated after each period.',
                            type: apiTypes.Integer,
                            required: true
                      ***REMOVED*** {
                            name: 'is_deposited',
                            description: 'Is the generated money auto deposited to bank? True/False',
                            type: apiTypes.Boolean,
                            required: false
                      ***REMOVED***
                        ...globalCreateOptions.optional
                    ]
              ***REMOVED*** {
                    name: 'basic',
                    description: 'Create a basic shop item without a preset.',
                    type: apiTypes.Subcommand,
                    options: [
                        ...globalCreateOptions.required,
                        ...globalCreateOptions.optional
                    ]
                }
            ]
        }
    ],
    async run(interaction, guild, author, args) {
        // restructure
        const group = args[0]
        const type = args[0].options

        let tempArgs = {}
        for (arg in args[0].otpions[0].options) {
            tempArgs[`${arg.name}`] = arg.value
        }

        args = tempArgs

        console.log('group: ' + group, 'type: ' + type, 'args: ' + args)

        await interaction.reply({ embeds: [embed] })
    }
}