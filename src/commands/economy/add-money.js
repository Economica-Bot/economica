module.exports = {
  name: 'add-money',
  description: 'Add money.',
  group: 'economy',
  global: true,
  options: [
    {
      name: 'user',
      description: 'Specify a user.',
      type: apiTypes.User,
      required: true,
  ***REMOVED***
    {
      name: 'amount',
      description: 'Specify the amount',
      type: 'INTEGER',
      required: true,
  ***REMOVED***
    {
      name: 'target',
      description: 'Specify where the money is added.',
      type: 'STRING',
      choices: [
        {
          name: 'wallet',
          value: 'wallet',
      ***REMOVED***
        {
          name: 'treasury',
          value: 'treasury',
      ***REMOVED***
      ],
      required: true,
  ***REMOVED***
  ],
  async run(interaction, guild, member, options) {
    const targetMember = options._hoistedOptions[0].member;

    let wallet = 0,
      treasury = 0,
      total = 0;
    const amount = options._hoistedOptions[1].value;

    if (options._hoistedOptions[2].value === 'treasury') {
      treasury += amount;
    } else {
      wallet += amount;
    }

    total += amount;

    await util.transaction(
      guild.id,
      targetMember.user.id,
      'ADD_MONEY',
      `add-money | <@!${member.user.id}>`,
      wallet,
      treasury,
      total
    );

    interaction.reply({
      embeds: [
        util.embedify(
          'GREEN',
          targetMember.user.username,
          targetMember.user.displayAvatarURL(),
          `Added by <@!${member.user.id}> to <@!${targetMember.user.id}>'s \`${options._hoistedOptions[2].value}\``
        ),
      ],
    });
***REMOVED***
};
