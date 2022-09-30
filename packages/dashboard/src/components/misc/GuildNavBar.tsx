import { APIUser, RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC } from 'react';

import { getIcon } from '../../lib/helpers';

type Props = {
	user: APIUser;
	guilds?: RESTGetAPICurrentUserGuildsResult;
};

const GuildNavBarIcon: FC<GuildIconProps> = ({ src }) => (
	<Image
		src={src}
		className="mt-3 flex-none w-12 cursor-pointer rounded-3xl hover:rounded-xl transition-all"
		alt={src}
		draggable={false}
		width={64}
		height={64}
	/>
);

export const GuildNavBar: FC<Props> = ({ user, guilds }) => {
	const router = useRouter();
	return (
		<div className="flex-none bg-discord-900 flex flex-col items-center overflow-scroll no-scrollbar px-3 py-5">
			<div onClick={() => router.push('/dashboard')}>
				<GuildNavBarIcon
					src={`http://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
				/>
			</div>
			{guilds?.map((guild) => (
				<div
					key={guild.id}
					onClick={() => router.push(`/dashboard/${guild.id}`)}
				>
					<GuildNavBarIcon src={getIcon(guild)} />
				</div>
			))}
		</div>
	);
};

type GuildIconProps = {
	src: string;
};
