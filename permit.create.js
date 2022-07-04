// Importing Required Modules
const crypto = require('crypto');
const fs = require('fs');
const yargs = require("yargs");
const path = require('path');
const winston = require('winston');

const eudcc = require('./app/lib/dcc');

// TODO: Load from the library
const CLAIM_ISS = 1;
const CLAIM_IAT = 6;
const CLAIM_EXP = 4;
const CLAIM_DCC = -260;

const options = yargs
  .usage("Usage: -f <file> -k <pem> -p <payload>")
  .option("f", { alias: "file", describe: "Path to the file you need to sign", type: "string", demandOption: true })
  .option("k", { alias: "key", describe: "Path to the private key (key.pem)", type: "string", demandOption: true })
  .option("p", { alias: "payload", describe: "Path to the payload (payload.json) to attach and sign", type: "string", demandOption: true })
  .argv;

// Setup Logger
const logConfiguration = {
  'transports': [
    new winston.transports.File({
      filename: 'logs/permit.create.log'
    })
  ],
  'format': winston.format.printf(({ level, message }) => {
    return `${level}: ${message}`;
  })
};
const logger = winston.createLogger(logConfiguration);

const fileName = options.file;
const privateKeyPath = options.key;
const payloadPath = options.payload;

// Load key from file.
const privateKey = fs.readFileSync(privateKeyPath);

// Using Hashing Algorithm
const algorithm = "RSA-SHA256";

// Converting string to buffer
const data = fs.readFileSync(fileName);

// Sign the data and returned signature in buffer
const signature = crypto.sign(algorithm, data, privateKey);
const hex = signature.toString('hex');

// Load payload from file
let raw = fs.readFileSync(payloadPath);
let payload = JSON.parse(raw);

payload.image = path.basename(fileName);
payload.imageSignature = hex;

logger.info('Residence Permit Payload ===');

// console.log('=== Residence Permit Payload ===');
// console.log('Payload: ');
// console.log(JSON.stringify(payload, null, 2));
logger.info('=== Residence Permit Payload ===');
logger.info('Payload: ');
logger.info(JSON.stringify(payload, null, 2));


// Create Residence Permit Certificate
// Attach payload and sing
const certPEM = fs.readFileSync('./trust/dcc/dsc-worker.pem');
const pkPEM = fs.readFileSync('./trust/dcc/dsc-worker.p8');

// console.log('\nVerifiable Certificate: ');
logger.info('Verifiable Certificate: ');
// Prepare the Payload
const certPayloadData = new Map();
certPayloadData.set(1, payload);

const certPayload = new Map();
certPayload.set(CLAIM_ISS, 'LU');
certPayload.set(CLAIM_EXP, 1644210000);
certPayload.set(CLAIM_IAT, 1643197539);
certPayload.set(CLAIM_DCC, certPayloadData);

eudcc.encode(certPayload, certPEM, pkPEM).then(function (value) {
  logger.info(value);
  process.stdout.write(value);
})
