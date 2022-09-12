import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v10';
import { useRouter } from 'next/router';
import { FC } from 'react';

type Props = {
	guild?: RESTAPIPartialCurrentUserGuild;
};

export const DashNavBar: FC<Props> = ({ guild }) => {
	const router = useRouter();
	const navigation = `${guild?.name ?? 'Guild Name'} / ${
		router.route.split('/')[3] ?? 'Channel Group'
	} / ${router.route.split('/')[4] ?? 'Channel'}`;
	return (
		<div className="flex-none h-16 mt-5 bg-discord-700 px-5 border-b-2 border-discord-900 flex items-center">
			<div>
				<h1 className="text-xl font-pt_sans">
					<code>{navigation}</code>
				</h1>
			</div>
		</div>
	);
};
