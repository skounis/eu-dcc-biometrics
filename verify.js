// Importing Required Modules
const crypto = require('crypto');
var fs = require('fs');
const yargs = require("yargs");
 
const options = yargs
 .usage("Usage: -f <file> -k <pem>")
 .option("f", { alias: "file", describe: "Path to the file you need to sign", type: "string", demandOption: true })
 .option("k", { alias: "key", describe: "Path to the public key (key.pub)", type: "string", demandOption: true })
 .option("s", { alias: "signature", describe: "Path to the signature file (hex)", type: "string", demandOption: true })
 .argv;

const fileName = options.file;
const publicKeyPath = options.key;
const signaturePath = options.signature;

const publicKey = fs.readFileSync(publicKeyPath);

// Using Hashing Algorithm
const algorithm = "RSA-SHA256";
 
// Load file in buffer
const data = fs.readFileSync(fileName);

const hex = fs.readFileSync(signaturePath,'utf8');
const signature = Buffer.from(hex, "hex")

// Verifying signature using crypto.verify() function
const isVerified = crypto.verify(algorithm, data, publicKey, signature);
 
// Printing the result
console.log(`Is signature verified: ${isVerified}`);