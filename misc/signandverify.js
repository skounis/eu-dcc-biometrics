// Credit
// https://www.geeksforgeeks.org/node-js-crypto-verify-function/
// 
// Importing Required Modules
const crypto = require('crypto');
const buffer = require('buffer');
 
// Creating a private key
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
// Using Hashing Algorithm
const algorithm = "SHA256";
 
// Converting string to buffer
const data = Buffer.from("I Love GeeksForGeeks");
 
// Sign the data and returned signature in buffer
const signature = crypto.sign(algorithm, data , privateKey);
 
// Verifying signature using crypto.verify() function
const isVerified = crypto.verify(algorithm, data, publicKey, signature);
 
// Printing the result
console.log(`Is signature verified: ${isVerified}`);