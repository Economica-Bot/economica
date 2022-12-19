import { RouteBases } from 'discord-api-types/v10';
import Image from 'next/image';
import { FC } from 'react';
import { parseEmoji } from '../../lib';

export const Emoji: FC<{ text: string }> = ({ text }) => {
	const parsed = parseEmoji(text);
	if (parsed) {
		return (
			<Image
				src={`${RouteBases.cdn}/emojis/${parsed.id ?? parsed.name}.png?size=32`}
				alt={parsed.name ?? ''}
				className="mask-square"
				width={32}
				height={32}
			/>
		);
	} else return <>{text}</>;
};
