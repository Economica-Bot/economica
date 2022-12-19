import { APIEmoji } from 'discord-api-types/v10';

/**
 * Parses emoji info out of a string. The string must be one of:
 * * A UTF-8 emoji (no id)
 * * A URL-encoded UTF-8 emoji (no id)
 * * A Discord custom emoji (`<:name:id>` or `<a:name:id>`)
 * @link https://github.com/discordjs/discord.js/blob/d6873b7159352479475b3a0daa215bddbdd3a79b/packages/discord.js/src/util/Util.js
 */
export function parseEmoji(text: string) {
	if (text.includes('%')) text = decodeURIComponent(text);
	if (!text.includes(':'))
		return { animated: false, name: text, id: undefined };
	const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
	return match && { animated: Boolean(match[1]), name: match[2], id: match[3] };
}

export function resolveIdentifier(res: APIEmoji) {
	const emoji = `<${res.animated ? 'a:' : ':'}${res.name}${
		res.id ? `:${res.id}` : ''
	}>`;
	return emoji;
}
