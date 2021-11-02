const inventorySchema = require("@schemas/inventory-sch");

module.exports = {
  disabled: true,
  name: "market sell",
  group: "market",
  description: "Sell an item for wallet cash.",
  format: "<item>",
  global: true,
  options: [
    {
      name: "item",
      description: "Specify the item you wish to sell.",
      type: 3,
      required: true,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    let color = "BLURPLE",
      title = author.user.tag,
      icon_url = author.user.displayAvatarURL(),
      description;
    const currencySymbol = await util.getCurrencySymbol(guild.id),
      item = options._hoistedOptions[0].value;
    const inventory = await inventorySchema.findOne({
      userID: author.id,
      guildID: guild.id,
    });

    const owned = inventory?.inventory.find((i) => {
      return i.item === item;
    });

    if (!owned) {
      color = "RED";
      description = `You do not have a(n) \`${item}\`.`;
    } else {
      const price = owned.price;
      (color = "GREEN"),
        (description = `Successfully sold \`${item}\` for ${currencySymbol}${price.toLocaleString()}`);
      await util.transaction(
        guild.id,
        author.id,
        this.name,
        `Sold \`${item}\``,
        price,
        0,
        price
      );
      await inventorySchema.findOneAndUpdate(
        {
          userID: author.id,
          guildID: guild.id,
      ***REMOVED***
        {
          $pull: {
            inventory: {
              item,
          ***REMOVED***
        ***REMOVED***
        }
      );
    }

    const embed = util.embedify(color, title, icon_url, description);

    await interaction.reply({ embeds: [embed] });
***REMOVED***
};
