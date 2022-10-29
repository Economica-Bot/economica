'use client';

import {
	DiscordBold,
	DiscordCommand,
	DiscordEmbed,
	DiscordEmbedDescription,
	DiscordEmbedField,
	DiscordEmbedFields,
	DiscordEmbedFooter,
	DiscordInlineCode,
	DiscordItalic,
	DiscordMention,
	DiscordMessage,
	DiscordMessages,
	DiscordTime
} from '@skyra/discord-components-react';
import { useTheme } from 'next-themes';
import React from 'react';

const StatisticsDashboard: React.FC = () => {
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
					command="/statistics"
				/>
				<DiscordEmbed
					slot="embeds"
					authorImage="https://cdn.discordapp.com/emojis/974924868711751721"
					authorName="Statistics Dashboard"
					color="#5865F2"
				>
					<DiscordEmbedDescription slot="description">
						<DiscordBold>
							Welcome to <DiscordMention>Economica</DiscordMention>&apos;s
							Statistics Dashboard!
						</DiscordBold>
					</DiscordEmbedDescription>
					<DiscordEmbedFields slot="fields">
						<DiscordEmbedField
							fieldTitle="🤖 Bot Statistics"
							inline
							inlineIndex={1}
						>
							<ul className="text-left">
								<li>
									<DiscordItalic>Websocket Ping</DiscordItalic>:{' '}
									<DiscordInlineCode>109ms</DiscordInlineCode>
								</li>
								<li>
									<DiscordItalic>Bot Uptime</DiscordItalic>:{' '}
									<DiscordInlineCode>9h</DiscordInlineCode>
								</li>
								<li>
									<DiscordItalic>Commands Ran</DiscordItalic>:{' '}
									<DiscordInlineCode>356</DiscordInlineCode>
								</li>
							</ul>
						</DiscordEmbedField>
						<DiscordEmbedField
							fieldTitle="👨 Member Statistics"
							inline
							inlineIndex={2}
						>
							<ul className="text-left">
								<li>
									<DiscordItalic>Roles</DiscordItalic>:{' '}
									<DiscordInlineCode>6</DiscordInlineCode>
								</li>
								<li>
									<DiscordItalic>Commands Used</DiscordItalic>:{' '}
									<DiscordInlineCode>41</DiscordInlineCode>
								</li>
								<li>
									<DiscordItalic>Joined Server</DiscordItalic>:{' '}
									<DiscordTime>1 year ago</DiscordTime>
								</li>
							</ul>
						</DiscordEmbedField>
						<DiscordEmbedField
							fieldTitle="📠 Server Statistics"
							inline
							inlineIndex={3}
						>
							<ul className="text-left">
								<li>
									<DiscordItalic>Roles</DiscordItalic>:{' '}
									<DiscordInlineCode>28</DiscordInlineCode>
								</li>
								<li>
									<DiscordItalic>Members</DiscordItalic>:{' '}
									<DiscordInlineCode>29</DiscordInlineCode>
								</li>
								<li>
									<DiscordItalic>Channels</DiscordItalic>:{' '}
									<DiscordInlineCode>14</DiscordInlineCode>
								</li>
							</ul>
						</DiscordEmbedField>
					</DiscordEmbedFields>
					<DiscordEmbedFooter
						slot="footer"
						footerImage="/adrastopoulos.png"
						timestamp="03/20/2022"
					>
						Adrastopoulos
					</DiscordEmbedFooter>
				</DiscordEmbed>
			</DiscordMessage>
		</DiscordMessages>
	);
};

export default StatisticsDashboard;
