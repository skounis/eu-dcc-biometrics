// Importing Required Modules
const crypto = require('crypto');
const fs = require('fs');
const yargs = require("yargs");

const options = yargs
 .usage("Usage: -f <file> -k <pem>")
 .option("f", { alias: "file", describe: "Path to the file you need to sign", type: "string", demandOption: true })
 .option("k", { alias: "key", describe: "Path to the private key (key.pem)", type: "string", demandOption: true })
 .argv;

const fileName = options.file;
const privateKeyPath = options.key;

// Load key from file.
const privateKey = fs.readFileSync(privateKeyPath);

// Using Hashing Algorithm
const algorithm = "RSA-SHA256";
 
// Converting string to buffer
const data = fs.readFileSync(fileName);
 
// Sign the data and returned signature in buffer
const signature = crypto.sign(algorithm, data , privateKey);
const hex = signature.toString('hex');
console.log(hex);
