import {
	DiscordBold,
	DiscordCommand,
	DiscordEmbed,
	DiscordEmbedDescription,
	DiscordEmbedField,
	DiscordEmbedFields,
	DiscordInlineCode,
	DiscordItalic,
	DiscordMention,
	DiscordMessage,
	DiscordMessages,
	DiscordQuote
} from '@skyra/discord-components-react';
import { useTheme } from 'next-themes';
import React from 'react';

const SimulatedEconomy: React.FC = () => {
	const { resolvedTheme } = useTheme();
	return (
		<DiscordMessages
			lightTheme={resolvedTheme === 'light'}
			className="rounded-lg"
		>
			<DiscordMessage author="Economica" avatar="/economica.png" bot verified>
				<DiscordCommand
					slot="reply"
					author="Adrastopoulos"
					avatar="/adrastopoulos.png"
					command="/loan"
				/>
				<DiscordEmbed
					slot="embeds"
					authorImage="https://cdn.discordapp.com/emojis/974903653968248852.webp?size=96&quality=lossless"
					authorName="Loan 1008459777224740874"
					color="#5865F2"
				>
					<DiscordEmbedDescription slot="description">
						<DiscordQuote>
							<DiscordBold>Created At</DiscordBold>:{' '}
							<DiscordInlineCode>8/14/2022, 12:39:07 PM</DiscordInlineCode>
							<br />
							<DiscordBold>Completed At</DiscordBold>:{' '}
							<DiscordInlineCode>N/A</DiscordInlineCode>
						</DiscordQuote>
					</DiscordEmbedDescription>
					<DiscordEmbedFields slot="fields">
						<DiscordEmbedField
							fieldTitle="money_bag Lender"
							inline
							inlineIndex={1}
						>
							<DiscordMention>Adrastopoulos</DiscordMention>
						</DiscordEmbedField>
						<DiscordEmbedField
							fieldTitle="person_add Borrower"
							inline
							inlineIndex={2}
						>
							<DiscordMention>Kamaji</DiscordMention>
						</DiscordEmbedField>
						<DiscordEmbedField fieldTitle="deed Message">
							<DiscordItalic>This is a test loan my fren!</DiscordItalic>
						</DiscordEmbedField>
						<DiscordEmbedField
							fieldTitle="money Principal"
							inline
							inlineIndex={1}
						>
							<DiscordInlineCode>💵 1.00k</DiscordInlineCode>
						</DiscordEmbedField>
						<DiscordEmbedField
							fieldTitle="money Repayment"
							inline
							inlineIndex={2}
						>
							<DiscordInlineCode>💵 2.00k</DiscordInlineCode>
						</DiscordEmbedField>
						<DiscordEmbedField
							fieldTitle="time Duration"
							inline
							inlineIndex={3}
						>
							<DiscordInlineCode>1 minute</DiscordInlineCode>
						</DiscordEmbedField>
					</DiscordEmbedFields>
				</DiscordEmbed>
			</DiscordMessage>
		</DiscordMessages>
	);
};

export default SimulatedEconomy;
