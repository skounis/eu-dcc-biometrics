// Importing Required Modules
const crypto = require('crypto');
const fs = require('fs');
const yargs = require("yargs");
const path = require('path');
const winston = require('winston');

const eudcc = require('./app/lib/dcc');

const options = yargs
 .usage("Usage: -f <file> -k <pem>")
 .option("f", { alias: "certificate", describe: "Path to the certificate file you need to verify", type: "string", demandOption: true })
 .option("k", { alias: "key", describe: "Path to the public key (key.pub)", type: "string", demandOption: true })
 .option("s", { alias: "signature", describe: "Path to the signature file (hex)", type: "string", demandOption: true })
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

const certificatePath = options.certificate;
const publicKeyPath = options.key;
const signaturePath = options.signature;

// Unpack the certificate
const hex = fs.readFileSync(certificatePath,'utf8')
logger.info(hex);
const cert = eudcc.decode(hex)
logger.info(JSON.stringify(cert, null, 2));

