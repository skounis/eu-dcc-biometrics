// verifyMiddleware.js
var fs = require('fs');
const publicKeyPath = 'trust/key.pub';
const signaturePath = 'trust/sign.txt';

// Using Hashing Algorithm
const algorithm = "RSA-SHA256";
const publicKey = fs.readFileSync(publicKeyPath);
const hex = fs.readFileSync(signaturePath,'utf8');

const verify = function (req, res, next) {
  console.log('Verifying...');
  next()
}

module.exports = verify