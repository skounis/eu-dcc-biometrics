# Sign and Verify a file with Node.
CLI Example for signing and verifying a binary file.

Generate keys:
```bash
npm run genkeys
```

Sign the `assets/profile.jpg`. Generate and store the signature in `trust/sign.txt`
```bash
npm run genkeys
```

Verify the `assets/profile.jpg` with the public key and the signature.
```bash
npm run genkeys
```

## Sing and Verify with OpenSSL
### Generate 4096-bit RSA private key and extract public key
```bash
openssl genrsa -out key.pem 4096
openssl rsa -in key.pem -pubout > key.pub
```

### Sign and verify
Sign and create signature:
```bash
openssl dgst -sign key.pem -keyform PEM -sha256 -out cert.sign -binary profile.jpg
```

Verify 
```bash
openssl dgst -verify key.pub -keyform PEM -sha256 -signature cert.sign -binary profile.jpg
```

### References
* [How to sign and verify with openssl](https://pagefault.blog/2019/04/22/how-to-sign-and-verify-using-openssl/)
* [Build a Command Line Application with Node.js](https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs)
* Snippets
    * https://gist.github.com/ajinabraham/746d3bceb26b8aff9be4d871da61fb9f
    * https://gist.github.com/zfael/aa8e885b64ffa92e4670c9e549b686a4
    * https://www.geeksforgeeks.org/node-js-crypto-verify-function/
    * https://www.geeksforgeeks.org/node-js-crypto-verify-function/
* [Node Express Image Upload And Resize Guide](https://appdividend.com/2022/03/03/node-express-image-upload-and-resize/)
* [Encoding and Decoding Base64 Strings in Node.js](https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/)
* [Reading QR codes using Node.js](https://www.geeksforgeeks.org/reading-qr-codes-using-node-js/)

#### Credits
Avatars from [Avatar Maker](https://avatarmaker.com/)