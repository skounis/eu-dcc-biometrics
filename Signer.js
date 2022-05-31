// Resize.js
const crypto = require('crypto');
var fs = require('fs');
const sharp = require('sharp');
const uuid = require('uuid');
const path = require('path');

const privateKeyPath = 'trust/key.pem';
const publicKeyPath = 'trust/key.pub';
const signaturePath = 'trust/sign.txt';
// Using Hashing Algorithm
const algorithm = "RSA-SHA256";
const privateKey = fs.readFileSync(privateKeyPath);
const publicKey = fs.readFileSync(publicKeyPath);
const hex = fs.readFileSync(signaturePath,'utf8');

class Signer {

  constructor() { }

  async verify(buffer) {
    const data = buffer;
    const signature = Buffer.from(hex, "hex")
    // Verifying signature using crypto.verify() function
    const isVerified = crypto.verify(algorithm, data, publicKey, signature);
    // Printing the result
    console.log(`Is signature verified: ${isVerified}`);
    return isVerified;
  }

  async sign(buffer) {
    const data = buffer;
    const signature = crypto.sign(algorithm, data , privateKey);
    const hex = signature.toString('hex');
    // Printing the result
    console.log(`The signature: ${hex}`);
    return hex;
  }

}
module.exports = Signer;