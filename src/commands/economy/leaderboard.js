const econonomySchema = require('@schemas/economy-sch');
const util = require('../../util/util');

module.exports = {
  name: 'leaderboard',
  group: 'economy',
  description: 'View top users in the economy.',
  global: true,
  format: '[wallet | treasury | total]',
  options: [
    {
      name: 'type',
      description: 'Specify the value to order by.',
      type: 'STRING',
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
          name: 'Total',
          value: 'total',
      ***REMOVED***
      ],
      required: false,
  ***REMOVED***
    {
      name: 'page',
      description: 'Specify the page.',
      type: 'INTEGER',
  ***REMOVED***
  ],
  async run(interaction) {
    await interaction.deferReply();

    const currencySymbol = await util.getCurrencySymbol(interaction.guild.id),
      type = interaction.options.getString('type') ?? 'total';
    const profiles = await econonomySchema
      .find({ guildID: interaction.guild.id })
      .sort({ [type]: -1 });
    const embeds = [];
    const page = interaction.options.getInteger('page') ?? 1;
    let entries = 10;
    let rank = 1;

    const pageCount = Math.ceil(profiles.length / entries);
    const leaderboardEntries = [];
    profiles.map((profile) => {
      const userID = profile.userID;
      const balance = profile[type];
      leaderboardEntries.push(
        rank++ == 1? `<:RichestPlayer:906756586553372693> • <@${userID}> | ${currencySymbol}${util.num(balance).toLocaleString()}\n\n` : `\`${(rank - 1).toString().padStart(2, '0')}\` • <@${userID}> | ${currencySymbol}${util.num(balance).toLocaleString()}\n`
      );
    });

    let k = 0;
    for (let i = 0; i < pageCount; i++) {
      description = '';
      for (let j = 0; j < entries; j++) {
        if (leaderboardEntries[k]) {
          description += leaderboardEntries[k++];
        }
      }
      embeds.push(
        new Discord.MessageEmbed()
          .setAuthor(`${interaction.guild}'s ${type} Leaderboard`, interaction.guild.iconURL())
          .setColor('BLUE')
          .setDescription(description)
          .setFooter(`Page ${i + 1} of ${pageCount}`)
      );
    }

    await util.paginate(interaction, embeds, page - 1);
***REMOVED***
};
