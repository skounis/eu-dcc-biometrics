// Importing Required Modules
const crypto = require('crypto');
const fs = require('fs');
const yargs = require("yargs");
const path = require('path');

const eudcc = require('./app/lib/dcc');
const logger = require('./app/lib/logger');
const mock = require('./app/lib/mock');

const options = yargs
  .usage("Usage: -f <file> -k <pem> -p <payload>")
  .option("f", { alias: "file", describe: "Path to the image you need to sign", type: "string", demandOption: true })
  .option("k", { alias: "key", describe: "Path to the private key (key.pem)", type: "string", demandOption: true })
  .option("p", { alias: "payload", describe: "Path to the payload (payload.json) to attach and sign", type: "string", demandOption: true })
  .argv;

const fileName = options.file;
const privateKeyPath = options.key;
const payloadPath = options.payload;

// Load key from file.
const privateKey = fs.readFileSync(privateKeyPath);

// Using Hashing Algorithm
const algorithm = "RSA-SHA256";

// Converting string to buffer
const image = fs.readFileSync(fileName);

// Sign the image and returned signature in buffer
const signature = crypto.sign(algorithm, image, privateKey);
const hex = signature.toString('hex');

// Load payload from file
const raw = fs.readFileSync(payloadPath);
const payload = JSON.parse(raw);

payload.image = path.basename(fileName);
payload.imageSignature = hex;

logger.info('=== Residence Permit ===');
logger.info('Payload: ');
logger.info(JSON.stringify(payload, null, 2));

// Create Residence Permit Certificate
// Attach payload and sign
const certPEM = fs.readFileSync('./trust/dcc/dsc-worker.pem'); // Document Signing Certificate (DSC)
const pkPEM = fs.readFileSync('./trust/dcc/dsc-worker.p8');    // Private key

logger.info('Verifiable Certificate: ');

const certPayload = new Map();
certPayload.set(eudcc.CLAIM_ISS, mock.country);         // Neverland certificate
certPayload.set(eudcc.CLAIM_EXP, mock.sEpoch4Years); // Expiration date
certPayload.set(eudcc.CLAIM_IAT, mock.sEpochNow);    // Issuing date
certPayload.set(eudcc.CLAIM_DCC, new Map().set(1, payload));

eudcc.encode(certPayload, certPEM, pkPEM).then(function (value) {
  logger.info(value);
  process.stdout.write(value);
})
