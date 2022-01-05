/**
 * Inserts a hyperlink into an embed description.
 * @param text - The display-name of the Hyperlink.
 * @param link - The actual hyperlink destination.
 * @returns Hyperlink string.
 */
 export function insertHL(
	text: string,
	link: string
): string {
	return `[${text}](${link})`
}