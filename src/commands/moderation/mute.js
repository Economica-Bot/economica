const ms = require('ms');

const infractionSchema = require('@schemas/infraction-sch');

module.exports = {
  name: 'mute',
  group: 'moderation',
  description: 'Mutes a user.',
  format: '<user> [length] [reason]',
  permissions: ['MUTE_MEMBERS'],
  roles: [
    {
      name: 'MUTED',
      required: false,
  ***REMOVED***
  ],
  options: [
    {
      name: 'user',
      description: 'Name a user you wish to warn.',
      type: 6,
      required: true,
  ***REMOVED***
    {
      name: 'duration',
      description: 'Specify a duration.',
      type: apiTypes.String,
  ***REMOVED***
    {
      name: 'reason',
      description: 'Provide a reason.',
      type: 3,
  ***REMOVED***
  ],
  async run(interaction, guild, author, options) {
    let member,
      reason,
      duration,
      expires,
      ephemeral = false,
      permanent = true,
      exit = false;
    let color = 'BLURPLE',
      title = author.user.username,
      icon_url = author.user.displayAvatarURL(),
      description = '',
      footer = '';

    const mutedRole = guild.roles.cache.find((role) => {
      return role.name.toLowerCase() === 'muted';
    });

    options._hoistedOptions.forEach((option) => {
      if (option.name === 'user') {
        member = option.member;
        if (member.user.id === author.user.id) {
          embed = util.embedify(
            'RED',
            author.user.username,
            author.user.displayAvatarURL(),
            'You cannot mute yourself!'
          );

          ephemeral = true;
          exit = true;
        }
      } else if (option.name === 'reason') {
        reason = option.value;
      } else if (option.name === 'duration') {
        duration = ms(option.value);
        if (duration) {
          if (duration < 0) {
            color = 'RED';
            description += `Invalid duration: \`${option.value}\`\nDuration must be more than \`0\`.\n`;
            ephemeral = true;
            exit = true;
          } else {
            expires = new Date(new Date().getTime() + duration);
            permanent = false;
          }
        } else {
          color = 'RED';
          description += `Invalid duration: \`${option.value}\`\nExamples: \`\`\`2 hours\n1h\n1m\n20m10s\n100\`\`\`\n`;
          footer = 'Number is measured in ms';
          ephemeral = true;
          exit = true;
        }
      }
    });

    reason = reason ?? 'No reason provided';

    if (!exit) {
      //Check for active mute
      const activeMutes = await infractionSchema.find({
        guildID: guild.id,
        userID: member.user.id,
        type: this.name,
        active: true,
      });

      if (activeMutes.length) {
        color = 'RED';
        (title = member.user.tag),
          (icon_url = member.user.displayAvatarURL()),
          (description += 'This user is already `muted`!\n');
        member.user.id;
      } else {
        //Mute, record, and send message
        await member
          .send({
            embeds: [
              util.embedify(
                'RED',
                guild.name,
                guild.iconURL(),
                `You have been **muted** ${
                  duration ? `for ${ms(duration)}` : 'permanently.'
                }\nReason: \`${reason}\``
              ),
            ],
          })
          .catch((err) => {
            footer = `Could not dm ${member.user.tag}.\n\`${err}\`\n`;
          });

        member.roles.add(mutedRole);

        await new infractionSchema({
          guildID: guild.id,
          userID: member.id,
          userTag: member.user.tag,
          staffID: author.user.id,
          staffTag: author.user.tag,
          type: this.name,
          reason,
          permanent,
          active: true,
          expires,
        }).save();

        (color = 'GREEN'), (title = `Muted ${member.user.tag}`);
        icon_url = member.user.displayAvatarURL();
        (description += `**Duration**: \`${
          duration ? `${ms(duration)}` : 'permanent'
        }\`\n**Reason**: \`${reason}\``),
          footer ?? member.user.id;
      }
    }

    const embed = util.embedify(
      color,
      title,
      icon_url,
      description,
      footer ?? member.user.id
    );

    await interaction.reply({
      embeds: [embed],
      ephemeral,
    });
***REMOVED***
};
