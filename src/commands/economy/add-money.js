module.exports = {
  name: 'add-money',
  description: 'Add money.',
  group: 'economy',
  global: true,
  options: [
    {
      name: 'user',
      description: 'Specify a user.',
      type: 'USER',
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
  async run(interaction) {
    const targetMember = interaction.options.getMember('user');

    let wallet = 0,
      treasury = 0,
      total = 0;
    const amount = interaction.options.getInteger('amount');

    if (interaction.options.getString('target') === 'treasury') {
      treasury += amount;
    } else {
      wallet += amount;
    }

    total += amount;

    await util.transaction(
      interaction.guild.id,
      targetMember.user.id,
      'ADD_MONEY',
      `add-money | <@!${interaction.member.user.id}>`,
      wallet,
      treasury,
      total
    );

    interaction.reply({
      embeds: [
        util.embedify(
          'GREEN',
          targetMember.user.tag,
          targetMember.user.displayAvatarURL(),
          `Added ${await util.getCurrencySymbol(
            interaction.guild.id
          )}${amount.toLocaleString()} to <@!${
            targetMember.user.id
          }>'s \`${interaction.options.getString('target')}\``
        ),
      ],
    });
***REMOVED***
};
