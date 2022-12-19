export function parseNumber(number: number, decimals = 2) {
	let temp = number;
	let digits = 1;
	while (Math.abs(temp) >= 10) {
		temp /= 10;
		digits++;
	}

	switch (true) {
		default:
			return String(number);
		case digits < 4:
			return number.toFixed();
		case digits < 7:
			return (number / Math.pow(10, 3)).toFixed(decimals) + 'k';
		case digits < 10:
			return (number / Math.pow(10, 6)).toFixed(decimals) + 'm';
		case digits < 13:
			return (number / Math.pow(10, 9)).toFixed(decimals) + 'g';
		case digits < 16:
			return (number / Math.pow(10, 12)).toFixed(decimals) + 't';
		case digits < 19:
			return (number / Math.pow(10, 15)).toFixed(decimals) + 'p';
		case digits < 22:
			return (number / Math.pow(10, 18)).toFixed(decimals) + 'e';
		case digits < 25:
			return (number / Math.pow(10, 21)).toFixed(decimals) + 'z';
		case digits < 28:
			return (number / Math.pow(10, 24)).toFixed(decimals) + 'y';
	}
}

export function parseString(s: string) {
	const sign = s.charAt(0) === '-' ? '-' : '';
	const abbreviation = s.charAt(s.length - 1).toLowerCase();
	const res = sign + s.replace(/[^0-9.]/g, '');
	switch (abbreviation) {
		default:
			return Number(res);
		case 'k':
			return Number(res) * Math.pow(10, 3);
		case 'm':
			return Number(res) * Math.pow(10, 7);
		case 'g':
			return Number(res) * Math.pow(10, 10);
		case 't':
			return Number(res) * Math.pow(10, 13);
		case 'p':
			return Number(res) * Math.pow(10, 16);
		case 'e':
			return Number(res) * Math.pow(10, 19);
		case 'z':
			return Number(res) * Math.pow(10, 22);
		case 'y':
			return Number(res) * Math.pow(10, 25);
	}
}

export function parseInteger(s: string) {
	const val = String(parseString(s));
	return parseInt(val);
}

export function validateAmount(
	balance: number,
	amount: string,
	target: 'wallet' | 'treasury'
) {
	const result = amount === 'all' ? balance : parseString(amount);
	if (!result && result !== 0) throw new Error('Please enter a valid input.');
	if (result < 1) throw new Error('Input less than 1.');
	if (result > balance) throw new Error(`Input exceeds current ${target}.`);
	return result;
}
