module.exports = {
  name: 'reset',
  group: 'application',
  description: 'Resets slash commands.',
  global: true,
  options: [
    {
      name: 'guild',
      description: 'Reset guilds slash commands.',
      type: 1,
      options: [
        {
          name: 'scope',
          description: 'Reset scope.',
          type: 3,
          choices: [
            {
              name: 'This',
              value: 'this',
          ***REMOVED***
            {
              name: 'All',
              value: 'all',
          ***REMOVED***
          ],
          required: true,
      ***REMOVED***
      ],
  ***REMOVED***
    {
      name: 'global',
      description: 'Reset global slash commands.',
      type: 1,
  ***REMOVED***
  ],
  ownerOnly: true,
  async run(interaction, guild, member, options) {
    interaction.deferReply();
        if (options._subcommand === 'guild') {
      if (options._hoistedOptions[0].value === 'this') {
        await guild.commands.set([]);
      } else {
        client.guilds.cache.forEach(async (guild) => {
          guild.commands.set([]);
        });
      }
    } else {
      await client.application.commands.set([]);
    }

    embed = util.embedify(
      'GREEN',
      member.user.username,
      member.user.displayAvatarURL(),
      '`RESET ALL SLASH COMMANDS`'
    );

    await interaction.editReply({ embeds: [embed], ephemeral: true });
***REMOVED***
};
