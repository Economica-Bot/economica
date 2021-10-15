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
  async run(interaction, guild, member, options) {
    await interaction.deferReply({
      ephemeral: true,
    });

    const currencySymbol = await util.getCurrencySymbol(guild.id),
      type = options._hoistedOptions[0].value;
    const balances = await econonomySchema
      .find({ guildID: guild.id })
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
            `${guild}'s ${
              type[0].toUpperCase() + type.substring(1)
            } Leaderboard`,
            `${guild.iconURL()}`
          )
          .setColor(111111)
          .setFooter(`Page ${embeds.length + 1} / ${pageCount}`)
      );

      // Fill the length of each page.
      for (let i = 0; i < entries; i++) {
        try {
          const member = await guild.members.fetch(balances[balCounter].userID);
          embeds[embeds.length - 1].addField(
            `#${rank++} ${member.user.tag}`,
            `${currencySymbol}${balances[balCounter++][type].toLocaleString()}`
          );
        } catch (err) {
          balCounter++;
          embeds[0].setDescription(`\`0\` users on leaderboard.`);
        }

        // If all balances have been inserted, break out of nested loops.
        if (balCounter >= balances.length) break loop1;
      }
    }

    await util.paginate(interaction, embeds);
***REMOVED***
};
