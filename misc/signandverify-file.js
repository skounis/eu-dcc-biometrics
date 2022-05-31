// Credit
// https://www.geeksforgeeks.org/node-js-crypto-verify-function/
// 
// Importing Required Modules
const crypto = require('crypto');
var fs = require('fs');
 
var fileName = 'profile.jpg';
var privateKey = fs.readFileSync('trust/key.pem');
var publicKey = fs.readFileSync('trust/key.pub');

// Using Hashing Algorithm
const algorithm = "RSA-SHA256";
 
// Converting string to buffer
const data = fs.readFileSync(fileName);
 
// Sign the data and returned signature in buffer
const signature = crypto.sign(algorithm, data , privateKey);
const hex = signature.toString('hex');
console.log(hex);
const signature2 = Buffer.from(hex, "hex")

// Verifying signature using crypto.verify() function
const isVerified = crypto.verify(algorithm, data, publicKey, signature2);
 
// Printing the result
console.log(`Is signature verified: ${isVerified}`);