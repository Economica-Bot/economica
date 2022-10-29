import {
	APIUser,
	PermissionFlagsBits,
	RESTAPIPartialCurrentUserGuild,
	RESTGetAPICurrentUserGuildsResult,
	RouteBases
} from 'discord-api-types/v10';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

type Props = {
	user?: APIUser;
	guilds?: RESTGetAPICurrentUserGuildsResult;
};

type GuildIconProps = {
	guild: RESTAPIPartialCurrentUserGuild;
};

const GuildNavBarIcon: FC<GuildIconProps> = ({ guild }) => (
	<Link href={`/dashboard/${guild.id}`}>
		<div className="tooltip tooltip-right" data-tip={guild.name}>
			<Image
				src={
					guild.icon
						? `${RouteBases.cdn}/icons/${guild.id}/${guild.icon}`
						: 'https://cdn.discordapp.com/embed/avatars/5.png'
				}
				className="w-full rounded-3xl transition-all hover:rounded-xl"
				alt={guild.name}
				draggable={false}
				fill
			/>
		</div>
	</Link>
);

type UserIconProps = {
	user: APIUser;
};

const UserNavBarIcon: FC<UserIconProps> = ({ user }) => (
	<Link href={`/dashboard`}>
		<Image
			src={`http://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
			className="w-full rounded-[48px] transition-all ease-in hover:rounded-xl"
			alt={user.username}
			draggable={false}
			fill
		/>
	</Link>
);

export const GuildNavBar: FC<Props> = ({ user, guilds }) => (
	<div className="w-18 flex flex-none flex-col items-center gap-1 px-3 py-8">
		{user && <UserNavBarIcon user={user} />}
		<div className="divider" />
		{guilds
			?.filter(
				(guild) =>
					Number(guild.permissions) & Number(PermissionFlagsBits.Administrator)
			)
			.map((guild, index) => (
				<GuildNavBarIcon key={index} guild={guild} />
			))}
	</div>
);
