// Importing Required Modules
const crypto = require('crypto');
const fs = require('fs');
const yargs = require("yargs");
const path = require('path');
const logger = require('./app/lib/logger');

const eudcc = require('./app/lib/dcc');

const options = yargs
 .usage("Usage: -f <file> -k <pem>")
 .option("f", { alias: "certificate", describe: "Path to the certificate file you need to verify", type: "string", demandOption: true })
 .option("k", { alias: "key", describe: "Path to the public key (key.pub)", type: "string", demandOption: true })
 .option("s", { alias: "signature", describe: "Path to the signature file (hex)", type: "string", demandOption: true })
 .argv;

const certificatePath = options.certificate;
const publicKeyPath = options.key;
const signaturePath = options.signature;

// Unpack the certificate
const hex = fs.readFileSync(certificatePath,'utf8')
logger.info(hex);
const cert = eudcc.decode(hex)
logger.info(JSON.stringify(cert, null, 2));

// Verify the image
const basepath = './assets/sample/harla-branno/';
const publicKey = fs.readFileSync(publicKeyPath);
const imageName = cert.dcc.image;
const imagePath = path.join(__dirname, basepath + imageName);
const image = fs.readFileSync(imagePath);

const imageSignature = cert.dcc.imageSignature;
const signature = Buffer.from(imageSignature, "hex")
const algorithm = "RSA-SHA256";
const isVerified = crypto.verify(algorithm, image, publicKey, signature);

logger.info("Authentic image: " + !!isVerified)

// Verify the Certificate
const certPEM = fs.readFileSync('./trust/dcc/dsc-worker.pem'); // Document Signing Certificate (DSC)

try {
  const res = eudcc.verify(hex, certPEM);
  logger.info("Valid certificate: " + !!res)
} catch (error) {
  logger.info("Valid certificate: " + false)
  logger.error(error)
}



