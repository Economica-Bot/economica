import {
	RESTAPIPartialCurrentUserGuild,
	RESTGetAPICurrentUserResult
} from 'discord-api-types/v10';
import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';

import { signOut } from 'next-auth/react';

const ChannelGroup: FC<PropsWithChildren & { text: string }> = ({
	text,
	children
}) => (
	<div className='my-2 flex flex-col'>
		<h1 className='my-1 cursor-default text-sm font-extrabold'>
			{text.toUpperCase()}
		</h1>
		{children}
	</div>
);

const Channel: FC<PropsWithChildren & { text: string; url: string }> = ({
	text,
	url,
	children
}) => (
	<Link href={url}>
		<a className='inline-flex cursor-pointer items-center justify-between rounded-md p-1 hover:bg-base-300'>
			# {text}
			{children}
		</a>
	</Link>
);

const GuildChannelNavBar: FC<{ guild: RESTAPIPartialCurrentUserGuild }> = ({
	guild
}) => (
	<div className='flex flex-col'>
		<ChannelGroup text='overview'>
			<Channel text='moderation' url={`/dashboard/${guild.id}/overview/mod`} />
			<Channel text='economy' url={`/dashboard/${guild.id}/overview/economy`} />
		</ChannelGroup>
		<ChannelGroup text='modules'>
			<Channel text='application' url={`/dashboard/${guild.id}/modules/app`} />
			<Channel text='config' url={`/dashboard/${guild.id}/modules/config`} />
			<Channel text='utility' url={`/dashboard/${guild.id}/modules/util`} />
			<Channel text='moderation' url={`/dashboard/${guild.id}/modules/mod`} />
			<Channel text='economy' url={`/dashboard/${guild.id}/modules/economy`} />
			<Channel text='income' url={`/dashboard/${guild.id}/modules/income`} />
			<Channel text='statistics' url={`/dashboard/${guild.id}/modules/stats`}>
				<span className='badge badge-warning font-bold'>beta</span>
			</Channel>
			<Channel text='casino' url={`/dashboard/${guild.id}/modules/casino`}>
				<span className='badge badge-primary font-bold'>NEW!</span>
			</Channel>
			<Channel text='business' url={`/dashboard/${guild.id}/modules/corp`}>
				<span className='badge badge-primary font-bold'>NEW!</span>
			</Channel>
		</ChannelGroup>
	</div>
);
const UserChannelNavBar: FC = () => (
	<div className='flex flex-col'>
		<Channel text='manage' url='/dashboard/manage' />
		<Channel text='global-leaderboard' url='/dashboard/lb' />
		<Channel text='shop' url='/dashboard/shop' />
	</div>
);

type Props = {
	guild?: RESTAPIPartialCurrentUserGuild;
	user: RESTGetAPICurrentUserResult;
};

export const ChannelNavBar: FC<Props> = ({ guild, user }) => (
	<div className='mt-5 flex w-64 flex-none flex-col'>
		<div className='flex h-16 flex-none items-center justify-center rounded-tl-3xl border-b-2 border-base-300 bg-base-200 px-5'>
			<h1 className='text-2xl font-bold'>
				{guild ? guild.name : user.username}
			</h1>
		</div>
		<div className='no-scrollbar flex flex-1 flex-col overflow-scroll bg-base-200'>
			<div className='flex-1 p-5 font-thin'>
				{guild ? <GuildChannelNavBar guild={guild} /> : <UserChannelNavBar />}
			</div>
			<div className='mx-auto my-5'>
				<button onClick={() => signOut({ callbackUrl: '/' })}>
					<a className='btn btn-error'>Logout</a>
				</button>
			</div>
		</div>
	</div>
);
