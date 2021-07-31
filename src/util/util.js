module.exports = {
    /**
     * Returns a message embed object. 
     * @param {Discord.ColorResolvable} color - Embed Color
     * @param {string} title - Embed title
     * @param {URL} icon_url - Embed picture
     * @param {string} [description] - Embed content.
     * @param {string} [footer] - Embed footer.
     * @returns {MessageEmbed} Message embed.
     */
    embedify(color = 'DEFAULT', title = false, icon_url = false, description = false, footer = false) {
        const embed = new Discord.MessageEmbed().setColor(color)
        if (icon_url) embed.setAuthor(title, icon_url)
        else if (title) embed.setTitle(title) 
        if (description) embed.setDescription(description)
        if (footer) embed.setFooter(footer)

        return embed
    }
}