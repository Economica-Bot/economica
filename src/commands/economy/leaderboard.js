const econonomySchema = require('@schemas/economy-sch');

module.exports = {
  name: 'leaderboard',
  group: 'economy',
  description: 'View top users in the economy.',
  global: true,
  format: '[wallet | treasury | total]',
  options: [
    {
      name: 'type',
      description: 'Specify the leaderboard type.',
      type: 3,
      choices: [
        {
          name: 'Wallet',
          value: 'wallet',
      ***REMOVED***
        {
          name: 'Treasury',
          value: 'treasury',
      ***REMOVED***
        {
          name: 'Networth',
          value: 'networth',
      ***REMOVED***
      ],
      required: true,
  ***REMOVED***
  ],
  async run(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });

    const currencySymbol = await util.getCurrencySymbol(interaction.guild.id),
      type = interaction.options.getString('type');
    const balances = await econonomySchema
      .find({ guildID: interaction.guild.id })
      .sort({ [type]: -1 });

    //amount of entries per page
    let entries = 10,
      embeds = [],
      rank = 1,
      balCounter = 0,
      pageCount = Math.ceil(balances.length / entries);

    loop1: while (true) {
      embeds.push(
        new Discord.MessageEmbed()
          .setAuthor(
            `${interaction.guild}'s ${
              type[0].toUpperCase() + type.substring(1)
            } Leaderboard`,
            `${interaction.guild.iconURL()}`
          )
          .setColor(111111)
          .setFooter(`Page ${embeds.length + 1} / ${pageCount}`)
      );

      // Fill the length of each page.
      for (let i = 0; i < entries; i++) {
        const member = await interaction.guild.members.fetch(
          balances[balCounter].userID
        );
        embeds[embeds.length - 1].addField(
          `#${rank++} ${member.user.tag}`,
          `${currencySymbol}${balances[balCounter++][type].toLocaleString()}`
        );

        // If all balances have been inserted, break out of nested loops.
        if (balCounter >= balances.length) break loop1;
      }
    }

    await util.paginate(interaction, embeds);
***REMOVED***
};
