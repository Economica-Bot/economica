import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ReactElement } from 'react';
import {
	FaChartBar,
	FaCog,
	FaCoins,
	FaDice,
	FaDiscord,
	FaHandHoldingUsd,
	FaServer,
	FaShieldAlt,
	FaShoppingCart,
	FaTools
} from 'react-icons/fa';
import MainLayout from '../components/layouts/MainLayout';
import { DeveloperCard } from '../components/misc/DeveloperCard';
import { InquiryAccordion } from '../components/misc/InquiryAccordion';
import { ModuleCard } from '../components/misc/ModuleCard';
import { NextPageWithLayout } from './_app';

const DiscordHero = dynamic(
	() => import('../components/messages/DiscordHero'),
	{ ssr: false }
);
const SimulatedEconomy = dynamic(
	() => import('../components/messages/SimulatedEconomy'),
	{ ssr: false }
);
const StatisticsDashboard = dynamic(
	() => import('../components/messages/StatisticsDashboard'),
	{ ssr: false }
);

const Home: NextPageWithLayout = () => (
	<>
		<section className="flex min-h-[80vh] items-center justify-center p-8">
			<div>
				<h1 className="text-underline inline-block text-6xl">ECONOMICA</h1>
				<h2 className="my-5 text-xl font-thin">
					The best new discord economy bot
				</h2>
				<div className="flex gap-5">
					<Link href="/api/invite" className="btn btn-primary">
						Invite
						<FaDiscord className="ml-2" size={30} />
					</Link>
					<Link href="/api/support" className="btn btn-secondary">
						Server
					</Link>
				</div>
			</div>
			<div className="mx-20 hidden lg:block">
				<DiscordHero />
			</div>
		</section>

		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 100"
			height="100"
			width="100%"
			preserveAspectRatio="none"
			className="fill-base-300"
		>
			<path d="M0 100 C 20 0 50 0 100 100 Z"></path>
		</svg>

		<section
			id="features"
			className="flex w-full flex-col items-center bg-base-300 py-32 px-5"
		>
			<h1 className="text-underline text-4xl font-bold">Features</h1>
			<div className="my-10 flex flex-col gap-10 lg:flex-row">
				<div className="max-w-md">
					<h1 className="text-3xl">Simulated Economy</h1>
					<p className="mt-2">
						Earn, exchange, and spend money in a variety of ways, including
						employment, global- and server-wide shop, payments, loans, and
						income commands.
					</p>
				</div>
				<SimulatedEconomy />
			</div>
			<div className="my-10 flex flex-col-reverse gap-10 lg:flex-row">
				<StatisticsDashboard />
				<div className="max-w-md">
					<h1 className="text-3xl">Detailed Oversight</h1>
					<p className="mt-2">
						View and manipulate a variety of server settings and view trends
						over time to make careful decisions with fine-tuned control.
					</p>
				</div>
			</div>
		</section>

		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 100"
			height="100"
			width="100%"
			preserveAspectRatio="none"
			className="fill-base-300"
		>
			<path d="M0 0 C 50 100 80 100 100 0 Z"></path>
		</svg>

		<section className="flex flex-col items-center">
			<h2 className="text-underline my-10 text-4xl">Modules</h2>
			<div className="grid gap-x-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<ModuleCard
					icon={<FaDice size={30} />}
					title="Casino"
					description="This is the Casino Module."
				/>
				<ModuleCard
					icon={<FaHandHoldingUsd size={30} />}
					title="Income"
					description="This is the Income Module."
				/>
				<ModuleCard
					icon={<FaChartBar size={30} />}
					title="Statistics"
					description="This is the Statistics Module."
				/>
				<ModuleCard
					icon={<FaCog size={30} />}
					title="Config"
					description="This is the Config Module."
				/>
				<ModuleCard
					icon={<FaCoins size={30} />}
					title="Economy"
					description="This is the Economy Module."
				/>
				<ModuleCard
					icon={<FaShieldAlt size={30} />}
					title="Moderation"
					description="This is the Economy Module."
				/>
				<ModuleCard
					icon={<FaTools size={30} />}
					title="Utility"
					description="This is the Utility Module."
				/>
				<ModuleCard
					icon={<FaShoppingCart size={30} />}
					title="Shop"
					description="This is the Shop Module."
				/>
				<ModuleCard
					icon={<FaServer size={30} />}
					title="Application"
					description="This is the Application Module."
				/>
			</div>
		</section>

		<section className="flex w-full flex-col items-center justify-center py-[200px] px-[50px]">
			<div className=" flex w-full max-w-screen-2xl flex-col items-center rounded-3xl bg-base-300 py-24 px-5 text-center shadow-drop drop-shadow-2xl">
				<h1 className="text-underline text-3xl">Coming Soon!</h1>
				<h3 className="my-3 text-2xl font-thin">
					Economica is currently in{' '}
					<strong className="text-underline">Open Beta</strong>
				</h3>
				<Link href="/api/invite" className="btn btn-primary">
					Invite
					<FaDiscord className="ml-2" size={30} />
				</Link>
			</div>
		</section>

		<section className="flex flex-col items-center justify-center py-[100px] px-[20px]">
			<InquiryAccordion
				question="Why Economica?"
				answer="With Economica, our goal is to create the most customizable economy
						bot with the capability of producing complex server economies while
						also retaining an easy-to-use, easy-to-play interface."
			/>

			<InquiryAccordion
				question="How is Economica different?"
				answer="We at Economica were inspired by—and huge fans of—UnbelievaBoat and
						Dank Memer. Our original goal was to create a bot that had the best
						aspects of both of them: the customizability of UBB and the detail
						in Dank Memer. Our ambition is to create a bot that surpasses both."
			/>
		</section>

		<section
			id="developers"
			className="flex flex-col items-center py-[250px] px-[50px]"
		>
			<h1 className="text-underline my-10 text-4xl">Developers</h1>
			<div className="grid w-full max-w-screen-2xl lg:grid-cols-3">
				<DeveloperCard
					src="/adrastopoulos.png"
					name="Adrastopoulos#0001"
					link="https://github.com/Adrastopoulos"
				/>
				<DeveloperCard
					src="/QiNG-agar.png"
					name="QiNG-agar#0540"
					link="https://github.com/QiNG-agar"
				/>
				<DeveloperCard
					src="/valencia picture.png"
					name="valencia#9343"
					link="https://www.diegovalencia.me/"
				/>
			</div>
		</section>
	</>
);

Home.getLayout = function getLayout(page: ReactElement) {
	return <MainLayout>{page}</MainLayout>;
};

export default Home;
