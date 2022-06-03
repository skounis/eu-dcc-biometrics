// Importing Required Modules
const fs = require('fs')
const Jimp = require("jimp");
const jsQR = require("jsqr");
const path = require('path');
const QrCode = require('qrcode-reader');
const yargs = require("yargs");

const options = yargs
  .usage("Usage: -f <file> -k <pem>")
  .option("f", { alias: "file", describe: "Relative path to the qr code image file to scan", type: "string", demandOption: true })
  .argv;

const fileName = options.file;

// Load Image from file into a Buffer.
console.log("Working in" + __dirname);
const imagePath = path.join(__dirname, fileName);
const buffer = fs.readFileSync(imagePath);

// Parse the the Image Buffer with Jimp.
Jimp.read(buffer, function (err, image) {
  if (err) {
    console.error(err);
  }
  console.log('\n\nScanning with QRCode reader...');
  scanWithQRCodeReader(image, function (value) {    
    const payload = decode(value);
    console.log(`Payload ASCII: \n ${payload}\n\n`);
  });

  console.log('\n\nScanning with JSQRCode reader...')
  scanWithJSQCodeReader(image, function (value) {  
    const payload = decode(value);
    console.log(`Payload ASCII: \n ${payload}\n\n`);
  })
});

/**
 * Scan a QR Code with `qrcode-reader` and return an image object 
 * @param {*} image 
 * @param {*} callback 
 */
const scanWithQRCodeReader = function (image, callback) {
  let qrcode = new QrCode();
  qrcode.callback = function (err, value) {
    if (err) {
      console.error(err);
      return;
    }
    callback(value.result);
  };
  qrcode.decode(image.bitmap);
}

/**
 * Scan a QR Code with `jsqr` and return an image object
 * @param {*} image 
 * @param {*} callback 
 */
const scanWithJSQCodeReader = function (image, callback) {
  const value = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height);
  callback(value.data)
}

/**
 * Convert Base64 encoded string to ascii if needed.
 * @param {string} value - Base64 encoded string.
 */
const decode = function (value) {
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  if (!base64regex.test(value)) return value;
  console.log(`Payload BASE64: \n ${value}\n`);
  const buff = Buffer.from(value, 'base64');
  const ascii = buff.toString('ascii');
  return ascii;
}