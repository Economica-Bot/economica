import crypto from 'node:crypto';

import { request as req } from 'express';

const KEYS = {
	ZERO: 48,
	A: 65,
	a: 97
};

function hexCharToBinary(char: string) {
	const code = char.charCodeAt(0);
	if (code >= KEYS.a) return code - KEYS.a + 10;
	if (code >= KEYS.A) return code - KEYS.A + 10;
	return code - KEYS.ZERO;
}

function hexStringToBinary(key: string | null) {
	if (key == null) {
		return new Uint8Array(0).buffer;
	}

	const view = new Uint8Array(key.length / 2);

	for (let i = 0, o = 0; i < key.length; i += 2, ++o) {
		view[o] = (hexCharToBinary(key[i]) << 4) | hexCharToBinary(key[i + 1]);
	}

	return view.buffer;
}

async function getCryptoKey(publicKey: string, subtleCrypto: SubtleCrypto) {
	const key = await subtleCrypto.importKey(
		'raw',
		hexStringToBinary(publicKey),
		'Ed25519',
		true,
		['verify']
	);

	return key;
}

export async function isValidRequest(request: typeof req, publicKey: string) {
	const timestamp = request.get('X-Signature-Timestamp') || '';
	const signature = request.get('X-Signature-Ed25519') || '';
	const body = JSON.stringify(request.body);
	return verify(body, signature, timestamp, publicKey);
}

async function verify(
	rawBody: string | null | undefined,
	signature: string | null | undefined,
	timestamp: string | null | undefined,
	publicKey: string
) {
	if (timestamp == null || signature == null || rawBody == null) return false;

	const key = await getCryptoKey(publicKey, crypto.webcrypto.subtle);
	const isVerified = await crypto.webcrypto.subtle.verify(
		'Ed25519',
		key,
		hexStringToBinary(signature),
		new TextEncoder().encode(`${timestamp ?? ''}${rawBody}`)
	);

	return isVerified;
}
