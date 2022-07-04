const b45 = require("base45")
const zlib = require("zlib")
const cbor = require("cbor")
const cose = require('cose-js')
const { Certificate } = require('@fidm/x509')
const rawHash = require("sha256-uint8array").createHash;

// TODO enumeration
const CLAIM_ISS = 1;
const CLAIM_IAT = 6;
const CLAIM_EXP = 4;
const CLAIM_DCC = -260;

// TODO enum
const HEADER_ALGORITHM = 1;
const HEADER_KID = 4;

// TODO enum
const COSE_PROTECTED_HEADER = 0;
const COSE_UNPROTECTED_HEADER = 1;
const COSE_PAYLOAD = 2;

/**
 * Decompress the certificate
 * 
 * @param {string} hcert - The string representation of the certificate as it is stored in the QR Code
 * @returns {Buffer} The COSE Signed document
 */
function inflate(hcert) {
	//
	// Get the Base45 part of the certificate
	//
	if (hcert.startsWith('HC1')) {
		hcert = hcert.substring(3)
		if (hcert.startsWith(':')) {
			hcert = hcert.substring(1)
		} else {
			console.log("Warning: unsafe HC1: header - update to v0.0.4");
		};
	} else {
		console.log("Warning: no HC1: header - update to v0.0.4");
	};
	//
	// Get the ZLib compressed bytes representation.
	//
	hcert = b45.decode(hcert);
	//
	// Get the COSE signed document representation.
	//
	// Inflate
	// Zlib magic headers:
	// 78 01 - No Compression/low
	// 78 9C - Default Compression
	// 78 DA - Best Compression 
	if (hcert[0] == 0x78) {
		hcert = zlib.inflateSync(hcert)
	}
	return hcert;
}
/**
 * Unpack the COSE document. 
 * @param {BufferLike} cose - The COSE singed document.
 * @return {Object} - The unpacked COSE document in the EU-DCC structure.
 */
function unpack(cose) {
	let dcc_cbor = cbor.decodeFirstSync(cose);

	// get data from protected header
	let cose_protected_header = dcc_cbor.value[COSE_PROTECTED_HEADER];
	let jose_protected_header = cbor.decodeFirstSync(cose_protected_header);
	let alg = jose_protected_header.get(HEADER_ALGORITHM);
	let kid = jose_protected_header.get(HEADER_KID).toString('base64');

	// get data from unprotected header if needed
	if (alg === undefined || kid === undefined) {
		// unpack unprotected header
		let cose_unprotected_header = dcc_cbor.value[COSE_UNPROTECTED_HEADER];
		let jose_unprotected_header = cbor.decodeFirstSync(cose_unprotected_header);

		// get the header metadata
		if (kid === undefined) alg = jose_unprotected_header.get(HEADER_ALGORITHM);
		if (alg === undefined) kid = jose_unprotected_header.get(HEADER_KID).toString('base64');
	}

	// unpack payload
	let cose_payload = dcc_cbor.value[COSE_PAYLOAD];
	let jose_payload = cbor.decodeFirstSync(cose_payload);

	// finally get the json and celebrate!
	let dcc_json = jose_payload.get(CLAIM_DCC).get(1);
	let iss = jose_payload.get(CLAIM_ISS);
	let iat = jose_payload.get(CLAIM_IAT);
	let exp = jose_payload.get(CLAIM_EXP);

	return {
		metadata: {
			issuer: iss,
			iat: iat,
			exp: exp,
			alg: alg,
			kid: kid
		},
		dcc: dcc_json,
		cose: buf2hex(cose.buffer)
	};

}
/**
 * Decode HCert
 * @param {string} hcert 
 * @returns 
 */
function decode(hcert) {
	// Inflate and get the COSE Document
	hcert = inflate(hcert);
	// Unpack and get the EU-DCC Document
	hcert = unpack(hcert);
	return hcert;
}

/**
 * 
 * @param {*} payload 
 * @param {*} certPEM X.509 certificate in PEM formatted buffer
 * @param {*} pkPEM an PrivateKey for X.509 certificate from PKCS#8 PEM formatted buffer or PKCS#1 RSA PEM formatted buffer
 * @returns 
 */
async function encode(payload, certPEM, pkPEM) {
	const cose = require('cose-js')
	const rawHash = require("sha256-uint8array").createHash;
	const { PEM, ASN1, Class, Tag } = require('@fidm/asn1')
	const { Certificate, PrivateKey } = require('@fidm/x509')
	const zlib = require('pako');
	var cbor = require('cbor');
	const base45 = require('base45-js');
  
	const cert = Certificate.fromPEM(certPEM)
	var bytes = new Uint8Array(cert.raw);
  
	const fingerprint = rawHash().update(cert.raw).digest();
	const keyID = fingerprint.slice(0, 8)
  
	const pk = PrivateKey.fromPEM(pkPEM)
  
	// Highly ES256 specific - extract the 'D' for signing.
	//
	const keyD = Buffer.from(pk.keyRaw.slice(7, 7 + 32))
  
	// const buffer = Buffer.alloc(4_096);
  
	const plaintext = cbor.encode(payload)
	const headers = {
	  'p': { 'alg': 'ES256', 'kid': keyID },
	  'u': {}
	};
  
	const signer = {
	  'key': {
		'd': keyD
	  }
	};
  
	let buf = await cose.sign.create(
	  headers,
	  plaintext,
	  signer);
	buf = zlib.deflate(buf)
	buf = 'HC1:' + base45.encode(buf)
	const dcc = Buffer.from(buf).toString()
	process.stdout.write(dcc);
	return dcc;
}
/**
 * Verify the cose signature of an HCert.
 * Throws an error if verification fails
 * 
 * @param {string} hcert 
 * @param {string} pem 
 * @returns {Promise<Buffer>}
 */
function verify(hcert, pem) {
	//
	// PEM - Prepare the verifier
	//
	const cert = Certificate.fromPEM(pem);
	const fingerprint = rawHash().update(cert.raw).digest();
	const keyID = fingerprint.slice(0, 8)

	// Εxtract the 'X' and 'Y' for verification
	// Highly ES256 specific
	const pk = cert.publicKey.keyRaw
	const keyB = Buffer.from(pk.slice(0, 1))
	const keyX = Buffer.from(pk.slice(1, 1 + 32))
	const keyY = Buffer.from(pk.slice(33, 33 + 32))

	const verifier = { 'key': { 'x': keyX, 'y': keyY, 'kid': keyID } };

	//
	// EU DCC Cert
	//
	// hcert = decode(hcert);
	const coseBytes = inflate(hcert);
	// Verify the cose signature.
	// throws an error if verification fails
	cose.sign.verifySync(coseBytes, verifier);
	// Unpack and get the EU-DCC Document
	hcert = unpack(coseBytes);
	return hcert;
}

function decode_qr(qr) {
	let hcert = ""; // TODO scan the QR
	return decode_hcert(hcert);
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
	return [...new Uint8Array(buffer)]
		.map(x => x.toString(16).padStart(2, '0'))
		.join('');
}

function hex2buf(hex) { // hex as string
	return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

exports.inflate = inflate;
exports.encode = encode;
exports.decode = decode;
exports.verify = verify;
exports.buf2hex = buf2hex;
exports.hex2buf = hex2buf;
// import b45 from "base45";
// import zlib from "zlib";
// import cbor from "cbor";