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
      required: true,
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
      type = interaction.options.getString('type');
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
      const balance = profile[type].toLocaleString();
      leaderboardEntries.push(
        `\`${rank++}\` - <@${userID}> | ${currencySymbol}${balance}\n`
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
          .setAuthor(`${interaction.guild}'s ${type} Leaderboard`)
          .setColor('BLUE')
          .setDescription(description)
      );
    }

    await util.paginate(interaction, embeds, page - 1);
***REMOVED***
};
