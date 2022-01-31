/**
 * cuts a string if longer than n and appends '...' to the end.
 * @param {string} str - the string to cut
 * @param {number} n - the size which a string must exceed to be cut
 * @param {boolean} rev - whether the string should be cut in reverse (trim the front excess off)
 * @returns {string} `str.substr(0, rev? -n : n)`
 */
export function cut(str: string, n = 50, rev = false) {
	return str.length <= n ? str.substring(0, rev ? -n : n) : `${str.substring(0, rev ? -n : n)}...`;
}
