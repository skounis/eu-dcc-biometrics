// Credits
// https://gist.github.com/zfael/aa8e885b64ffa92e4670c9e549b686a4
//
// how to execute: node verify.js <path file that you want to verify> <certificate path> <hash generate by sign.js>
// output: true if files are equal, false otherwise.
var crypto = require('crypto');
var fs = require('fs');

var args = process.argv.slice(2);
var fileName = args[0];
var certPath = args[1];
var sig = args[2];

//openssl req -key key.pem -new -x509 -out cert.pem
var publicPem = fs.readFileSync(certPath);
var pubKey = publicPem.toString();

var buffer = fs.readFileSync(fileName);

var verify = crypto.createVerify('RSA-SHA256');
verify.update(buffer);

var isValid = verify.verify(pubKey, sig, 'hex');
console.log(isValid);