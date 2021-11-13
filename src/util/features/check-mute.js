const infractionSchema = require('@schemas/infraction-sch');

module.exports = (client) => {
	const checkMutes = async () => {
		const now = new Date();
		const conditional = {
			type: 'mute',
			permanent: false,
			active: true,
			expires: {
				$lt: now,
			},
		};

		const results = await infractionSchema.find(conditional);

		//Unmute currently muted users whose mute has expired
		if (results && results.length) {
			for (const result of results) {
				const { guildID, userID } = result;
				const guild = client.guilds.cache.get(guildID);
				const member = (await guild.members.fetch()).get(userID);
				const mutedRole = guild.roles.cache.find((role) => {
					return role.name.toLowerCase() === 'muted';
				});

				const clientMember = await guild.members.cache.get(client.user.id);

				if (clientMember.roles.highest.position > mutedRole.position) {
					member.roles.remove(mutedRole);
				}
			}

			await infractionSchema.updateMany(conditional, {
				active: false,
			});
		}

		//checks for mutes every 5 seconds
		setTimeout(checkMutes, 1000 * 5);
	};

	checkMutes();

	//checks if joining member currently muted
	client.on('guildMemberAdd', async (member) => {
		const { guild, id } = member;
		const currentMute = await infractionSchema.findOne({
			guildID: guild.id,
			userID: id,
			type: 'mute',
			active: true,
		});

		if (currentMute) {
			const role = guild.roles.cache.find((role) => {
				return role.name.toLowerCase() === 'muted';
			});

			if (role) {
				member.roles.add(role);
			}
		}
	});
};
