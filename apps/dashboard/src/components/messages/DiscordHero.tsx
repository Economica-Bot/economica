'use client';

import {
	DiscordCommand,
	DiscordEmbed,
	DiscordEmbedDescription,
	DiscordMention,
	DiscordMessage,
	DiscordMessages
} from '@skyra/discord-components-react';
import React from 'react';

import { useTheme } from 'next-themes';

const DiscordHero: React.FC = () => {
	const { resolvedTheme } = useTheme();
	return (
		<DiscordMessages
			className="rounded-lg"
			lightTheme={resolvedTheme === 'light'}
		>
			<DiscordMessage author="Economica" avatar="/economica.png" bot verified>
				<DiscordCommand
					slot="reply"
					author="Adrastopoulos"
					avatar="/adrastopoulos.png"
					command="pay"
				/>
				<DiscordEmbed
					slot="embeds"
					authorImage="/adrastopoulos.png"
					authorName="Adrastopoulos"
					color="#06af17"
				>
					<DiscordEmbedDescription slot="description">
						Paid <DiscordMention> Kamaji </DiscordMention> 💵115
					</DiscordEmbedDescription>
				</DiscordEmbed>
			</DiscordMessage>
		</DiscordMessages>
	);
};

export default DiscordHero;
