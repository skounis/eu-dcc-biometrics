
const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode')

const Resize = require('../lib/Resize');
const Signer = require('../lib/Signer');
const upload = require('../uploadMiddleware');

const app = express();
const router = express.Router();

router.get('/', async function (req, res) {
  await res.render('issue-step-1');
});

router.post('/post', upload.single('image'), async function (req, res) {
  const imagePath = path.join(__dirname, '../../public/images');
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
  return res.render('issue-step-2', { payload: payload, raw: JSON.stringify(payload, null, 2) });
});

router.post('/qr', async function (req, res) {
  const fullname = req.body.fullname;
  const image = req.body.image;
  const imageSignature = req.body.imageSignature;
  const payload = { fullname: fullname, image: image, imageSignature: imageSignature }
  const qr = JSON.stringify(payload, null, 2)
  console.log(qr)
  const b64 = Buffer(qr).toString('base64')
  QRCode.toDataURL(b64, {errorCorrectionLevel: 'H', width: 760 },function (err, url) {
    return res.render('issue-step-3', { qr: url, data: qr });
  })
});

module.exports = router;