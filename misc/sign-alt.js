// Credits
// https://gist.github.com/ajinabraham/746d3bceb26b8aff9be4d871da61fb9f
//
// Create Private Key with OpenSSL
// openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -pkeyopt rsa_keygen_pubexp:3 -out privateKey.pem
// Generate Public Key to be used at the client side (Mobile)
// openssl pkey -in privateKey.pem -out publicKey.pem -pubout
const crypto = require('crypto')
const fs = require('fs')

const private_key = fs.readFileSync('trust/private.pem', 'utf-8')
//File to be signed
const package = fs.readFileSync('profile.jpg')
//Signing
const signer = crypto.createSign('sha256');
signer.update(package);
signer.end();
const signature = signer.sign(private_key)
const buff = new Buffer(signature);
const base64data = buff.toString('base64');
console.log('Digital Signature: ' + base64data);
//Equivalent to openssl dgst -sha256 -sign trust/privateKey.pem profile.jpg | base64