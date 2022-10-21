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
		<div className='mt-5 flex h-16 flex-none items-center border-b-2 border-base-300 bg-base-100 px-5'>
			<div>
				<h1 className='font-pt_sans text-xl'>
					<code>{navigation}</code>
				</h1>
			</div>
		</div>
	);
};
