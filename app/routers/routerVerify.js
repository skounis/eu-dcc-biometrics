// router.js
const crypto = require('crypto');
const express = require('express');
const app = express();
const path = require('path');
var QrCode = require('qrcode-reader');
var Jimp = require("jimp");
var fs = require('fs');
// var ImageParser = require("image-parser");
const router = express.Router();
const upload = require('../uploadMiddleware');
const Signer = require('../lib/Signer');
const Resize = require('../lib/Resize');
const jsQR = require("jsqr");

router.get('/', async function (req, res) {
  await res.render('verify');
});


router.post('/post', upload.single('image'), async function (req, res) {
  const buffer = req.file.buffer;

  Jimp.read(buffer, function (err, image) {
    if (err) {
      console.error(err);
      return res.status(400).json({err:err});
    }
    const parsed = jsQR(image.bitmap.data, image.bitmap.width,image.bitmap.height);
    const data = parsed.data;
    console.log(`Payload BASE64: \n ${data}\n`);
    const buff = Buffer.from(data, 'base64');
    const text = buff.toString('ascii');
    console.log(`Payload ASCII: \n ${text}\n\n`);
    const payload = JSON.parse(text);
    const isVerified = verify(payload.image, payload.imageSignature);
    payload.isVerified = isVerified;
    console.log(text);
    return res.render('wallet', { payload: payload });

  });


  // Parse the QRCode with ImageParser
  // Read the QRCode with jsqr
  // var img = new ImageParser(buffer);
  // img.parse(function(err) {
  //   if (err) {
  //     console.error(err);
  //     return res.status(400).json({err:err});
  //   }
  //   const parsed = jsQR(img._imgBuffer, img.width(),img.height());
  //   const data = parsed.data;
  //   console.log(`Payload BASE64: \n ${data}\n`);
  //   const buff = Buffer.from(data, 'base64');
  //   const text = buff.toString('ascii');
  //   console.log(`Payload ASCII: \n ${text}\n\n`);
  //   const payload = JSON.parse(text);
  //   const isVerified = verify(payload.image, payload.imageSignature);
  //   payload.isVerified = isVerified;
  //   console.log(text);
  //   return res.render('wallet', { payload: payload });
  //   // return res.status(200).json(payload);
  // });

  // Parse the QRCode with Jimp 
  // Read the QRCode with qrcode-reader
  //  Note: Read fails for some of the QRCodes 
  //
  // Jimp.read(buffer, function (err, image) {
  //   if (err) {
  //     console.error(err);
  //   }
  //   let qrcode = new QrCode();
  //   qrcode.callback = function (err, value) {
  //     if (err) {
  //       console.error(err);
  //       return res.status(400).json({err:err});
  //     }
  //     const data = value.result;
  //     console.log(`Payload BASE64: \n ${data}\n`);
  //     const buff = Buffer.from(data, 'base64');
  //     const text = buff.toString('ascii');
  //     console.log(`Payload ASCII: \n ${text}\n\n`);
  //     const payload = JSON.parse(text);
  //     const isVerified = verify(payload.image, payload.imageSignature);
  //     payload.isVerified = isVerified;
  //     // console.log(text);
  //     // return res.render('id', { payload: payload, raw: JSON.stringify(payload, null, 2) });
  //     return res.status(200).json(payload);
  //   };
  //   qrcode.decode(image.bitmap);
  // });
});

const verify = function (filename, signature) {
  // Using Hashing Algorithm
  const algorithm = "RSA-SHA256";
  const publicKeyPath = path.join(__dirname, '../../trust/key.pub');
  const publicKey = fs.readFileSync(publicKeyPath);
  const imagePath = path.join(__dirname, '../../public/images/' + filename);
  const data = fs.readFileSync(imagePath);
  signature = Buffer.from(signature, 'hex');
  // Verifying signature using crypto.verify() function
  const isVerified = crypto.verify(algorithm, data, publicKey, signature);
  // Printing the result
  console.log(`Is signature verified: ${isVerified}`);
  return !!isVerified;
}

module.exports = router;