// Importing Required Modules
var Jimp = require("jimp");
var fs = require('fs')
var QrCode = require('qrcode-reader');
const yargs = require("yargs");
const path = require('path');

const options = yargs
 .usage("Usage: -f <file> -k <pem>")
 .option("f", { alias: "file", describe: "Relative path to the qr code image file to scan", type: "string", demandOption: true })
 .argv;

const fileName = options.file;

// Load Image from file.
console.log("Working in" + __dirname);
const imagePath = path.join(__dirname, fileName);
var buffer = fs.readFileSync(imagePath);

Jimp.read(buffer, function(err, image) {
    if (err) {
        console.error(err);        
    }
    let qrcode = new QrCode();
    qrcode.callback = function(err, value) {
        if (err) {
            console.error(err);
        }
        const data = value.result;
        console.log(`Payload BASE64: \n ${data}\n`);
        const buff =  Buffer.from(data, 'base64');
        const text = buff.toString('ascii');
        console.log(`Payload ASCII: \n ${text}\n\n`);
        // console.log(text);
    };
    qrcode.decode(image.bitmap);
 });