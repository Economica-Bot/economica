module.exports = {
  name: 'balance',
  group: 'economy',
  description: 'View a balance.',
  format: '[user]',
  global: true,
  options: [
    {
      name: 'user',
      description: 'Name a user you wish to see the balance of.',
      type: 6,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    const user = options._hoistedOptions?.[0]?.user ?? author.user;

    const cSymbol = await util.getCurrencySymbol(guild.id);
    const { wallet, treasury, total, rank } = await util.getEconInfo(
      guild.id,
      user.id
    );
    const balEmbed = util
      .embedify(
        'GOLD',
        user.username,
        user.displayAvatarURL(),
        '',
        `🏆 Rank ${rank}`
      )
      .addFields([
        {
          name: 'Wallet',
          value: `${cSymbol}${wallet.toLocaleString()}`,
          inline: true,
      ***REMOVED***
        {
          name: 'Treasury',
          value: `${cSymbol}${treasury.toLocaleString()}`,
          inline: true,
      ***REMOVED***
        {
          name: 'Total',
          value: `${cSymbol}${total.toLocaleString()}`,
          inline: true,
      ***REMOVED***
      ]);

    interaction.reply({ embeds: [balEmbed] });
***REMOVED***
};
