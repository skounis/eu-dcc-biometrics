// Credits
// https://gist.github.com/ajinabraham/746d3bceb26b8aff9be4d871da61fb9f
//
// how to execute: node sign.js <path file> <path private key>
// output: signature of file
var crypto = require('crypto');
var fs = require('fs');

var args = process.argv.slice(2);
var fileName = args[0];
var keyPath = args[1];

//openssl genrsa -out key.pem 1024
var privatePem = fs.readFileSync(keyPath);
var key = privatePem.toString();

var sign = crypto.createSign('RSA-SHA256');

var buffer = fs.readFileSync(fileName);

sign.update(buffer);

var sig = sign.sign(key, 'hex');

console.log(sig);