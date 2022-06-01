// router.js

const express = require('express');
const app = express();
const path = require('path');
const QRCode = require('qrcode')
const fs = require('fs');

const router = express.Router();
const upload = require('./uploadMiddleware');
const Signer = require('./lib/Signer');
const Resize = require('./lib/Resize');

router.get('/', async function (req, res) {
  await res.render('index');
});

router.post('/post', upload.single('image'), async function (req, res) {
  const imagePath = path.join(__dirname, '/public/images');
  const fileUpload = new Resize(imagePath);
  if (!req.file) {
    res.status(401).json({ error: 'Please provide an image' });
  }
  const fullname = req.body.fullname;
  const filename = await fileUpload.save(req.file.buffer);
  const signer = new Signer();
  // Sign the submitted image.
  // const hex = await signer.sign(req.file.buffer)
  // fs.writeFileSync(`${imagePath}/demoimage.png`,req.file.buffer);
  // Load the saved image and sign it.
  path.resolve(`${imagePath}/${filename}`)
  const data = fs.readFileSync(path.resolve(`${imagePath}/${filename}`));
  const hex = await signer.sign(data)

  const payload = { fullname: fullname, image: filename, imageSignature: hex }
  // Signer.verify(req.file.buffer);
  // return res.status(200).json({ fullname: fullname, image: filename, imageSignature: hex });
  return res.render('id', { payload: payload, raw: JSON.stringify(payload, null, 2) });
});

router.post('/qr', async function (req, res) {

  const fullname = req.body.fullname;
  const image = req.body.image;
  const imageSignature = req.body.imageSignature;
  const payload = { fullname: fullname, image: image, imageSignature: imageSignature }
  const qr = JSON.stringify(payload, null, 2)
  console.log(qr)
  const b64 = Buffer(qr).toString('base64')
  // QRCode.toDataURL(b64, { errorCorrectionLevel: 'H' }, function (err, url) {
  //   return res.render('qr', { qr: url, data: qr });
  // })
  QRCode.toDataURL(b64, {errorCorrectionLevel: 'H', width: 760 },function (err, url) {
    return res.render('qr', { qr: url, data: qr });
  })
});


module.exports = router;