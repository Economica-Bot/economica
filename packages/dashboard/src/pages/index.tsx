import axios from 'axios';
import { RESTGetAPICurrentUserResult } from 'discord-api-types/v10';
import { GetServerSidePropsContext, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
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
	FaTools,
} from 'react-icons/fa';

import { DeveloperCard } from '../components/misc/DeveloperCard';
import { FeatureCard } from '../components/misc/FeatureCard';
import { Footer } from '../components/misc/Footer';
import { ModuleCard } from '../components/misc/ModuleCard';
import { NavBar } from '../components/misc/NavBar';
import { validateCookies } from '../lib/helpers';

type Props = {
	user: RESTGetAPICurrentUserResult
};

const Home: NextPage<Props> = ({ user }) => (
	<>
		<NavBar user={user} />
		<section className="h-screen flex items-center justify-center p-8">
			<div className="flex flex-col items-center justify-between text-center">
				<h1 className="text-5xl inline-block cursor-pointer text-white text-underline">
					ECONOMICA
				</h1>
				<h2 className="font-thin text-2xl my-5">
					The Best New Discord Economy Bot
				</h2>
				<div className="flex">
					<button className="bg-blurple shadow-drop mr-4 rounded-lg flex items-center py-1 px-4 drop-shadow-lg transition duration-500 hover:shadow-2xl hover:scale-110">
						<Link href='localhost:3000/api/invite'>
							<a>Invite</a>
						</Link>
						<FaDiscord className='ml-2' size={30} />
					</button>
					<button className="bg-discord-700 shadow-drop rounded-lg flex items-center py-1 px-4 drop-shadow-lg transition duration-500 hover:shadow-2xl hover:scale-110">
						<Link href="#features">
							<a>Preview</a>
						</Link>
					</button>
				</div>
			</div>
			<div className="relative h-[250px] w-[300px]  hover:scale-110 transition duration-700 hidden md:block m-10">
				<Image
					src="/Economica Mockup.png"
					alt="Economica Mockup"
					layout='fill'
					className='object-scale-down'
				/>
			</div>
		</section>

		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
			<path
				fill="#202225"
				d="M0,128L60,117.3C120,107,240,85,360,85.3C480,85,600,107,720,122.7C840,139,960,149,1080,149.3C1200,149,1320,139,1380,133.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
			></path>
		</svg>

		<section
			id="features"
			className="flex flex-col items-center text-center bg-discord-900 overflow-hidden"
		>
			<h1 className="text-underline text-4xl mt-32 mb-10">Features</h1>

			<div className="carousel">
				<div className="carousel-inn"></div>
			</div>

			<FeatureCard
				src="/stock market.png"
				header="Simulated Economy"
				description="Leverage Economic's virtual market to simulate an entire economy within your server!"
				order="fade-left"
			/>

			<FeatureCard
				src="/stock market.png"
				header="Universal Currency"
				description="Bla bla bla"
				order="fade-right"
			/>
		</section>

		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
			<path
				fill="#202225"
				fillOpacity="1"
				d="M0,128L80,128C160,128,320,128,480,154.7C640,181,800,235,960,234.7C1120,235,1280,181,1360,154.7L1440,128L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
			></path>
		</svg>

		<section className="flex flex-col items-center">
			<h2 className="text-underline text-4xl my-10">Modules</h2>
			<div
				className="grid gap-x-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
				data-aos="fade-up"
			>
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

		<section className="py-[200px] px-[50px]">
			<div className="bg-discord-900 flex flex-col items-center py-24 px-5 rounded-3xl drop-shadow-2xl text-center shadow-drop">
				<h1 className="text-underline text-3xl">Coming Soon!</h1>
				<h3 className="my-3 font-thin text-2xl">
					Economica is currently in{' '}
					<strong className="text-underline">Open Beta</strong>
				</h3>
				<button className="bg-blurple shadow-drop mr-4 rounded-lg flex items-center py-1 px-4 drop-shadow-lg transition duration-500 hover:shadow-2xl hover:scale-110">
					<Link href='localhost:3000/api/invite'>
						<a>Invite</a>
					</Link>
					<FaDiscord size={30} />
				</button>
			</div>
		</section>

		<section className="py-[100px] px-[20px] flex flex-col items-center justify-center">
			<div
				tabIndex={0}
				className="collapse collapse-arrow bg-discord-900 rounded-2xl max-w-[650px] drop-shadow-lg my-4 cursor-pointer border-[6px] border-discord-900 hover:bg-discord-700 hover:border-discord-600 shadow-drop"
			>
				<input type="checkbox" />
				<div className="collapse-title text-2xl font-medium">
					Why Economica?
				</div>
				<div className="collapse-content">
					<p className="font-thin">
						With Economica, our goal is to create the most customizable
						economy bot with the capability of producing complex server
						economies while also retaining an easy-to-use, easy-to-play
						interface.
					</p>
				</div>
			</div>

			<div
				tabIndex={0}
				className="collapse collapse-arrow bg-discord-900 rounded-2xl max-w-[650px] drop-shadow-lg my-4 cursor-pointer border-[6px] border-discord-900 hover:bg-discord-700 hover:border-discord-600 shadow-drop"
			>
				<input type="checkbox" />
				<div className="collapse-title text-2xl font-medium">
					How is Economica different?{' '}
				</div>
				<div className="collapse-content">
					<p className="font-thin">
						We at Economica were inspired by—and huge fans of—UnbelievaBoat
						and Dank Memer. Our original goal was to create a bot that had the
						best aspects of both of them: the customizability of UBB and the
						detail in Dank Memer. Our ambition is to create a bot that
						surpasses both.
					</p>
				</div>
			</div>
		</section>

		<section id="developers" className="py-[250px] px-[50px] text-center">
			<h1 className="text-underline text-4xl my-10">Developers</h1>
			<div className="grid lg:grid-cols-3">
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
		<Footer />
	</>
);

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
	const headers = validateCookies(ctx);
	if (!headers) return { props: { user: null } };
	const res = await axios
		.get<RESTGetAPICurrentUserResult>('http://localhost:3000/api/users/@me', { headers })
		.catch(() => null);
	return { props: { user: res ? res.data : null } };
};

export default Home;
