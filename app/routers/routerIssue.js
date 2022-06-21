
const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode')

const Resize = require('../lib/Resize');
const Signer = require('../lib/Signer');
const upload = require('../uploadMiddleware');

const app = express();
const router = express.Router();

const CLAIM_ISS = 1;
const CLAIM_IAT = 6;
const CLAIM_EXP = 4;
const CLAIM_DCC = -260;

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
  const dcccert = await ehnSign(payload)
  console.log(dcccert);
  const qr = JSON.stringify(payload, null, 2)
  console.log(qr)
    QRCode.toDataURL(dcccert, { errorCorrectionLevel: 'H', width: 760 }, function (err, url) {
    return res.render('issue-step-3', { qr: url, data: qr, cert: dcccert });
  })
});


/**
 * 
 * @param {JSON} value 
 */
const ehnSign = async function (value) {
  const cose = require('cose-js')
  const fs = require('fs')
  const rawHash = require("sha256-uint8array").createHash;
  const { PEM, ASN1, Class, Tag } = require('@fidm/asn1')
  const { Certificate, PrivateKey } = require('@fidm/x509')
  const zlib = require('pako');
  var cbor = require('cbor');
  const base45 = require('base45-js');

  const cert = Certificate.fromPEM(fs.readFileSync('./dsc-worker.pem'))
  var bytes = new Uint8Array(cert.raw);

  const fingerprint = rawHash().update(cert.raw).digest();
  const keyID = fingerprint.slice(0, 8)

  const pk = PrivateKey.fromPEM(fs.readFileSync('./dsc-worker.p8'))

  // Highly ES256 specific - extract the 'D' for signing.
  //
  const keyD = Buffer.from(pk.keyRaw.slice(7, 7 + 32))

  const buffer = Buffer.alloc(4_096);
  data = new Map();
  data.set(1, value);

  payload = new Map();
  payload.set(CLAIM_ISS, 'LU');
  payload.set(CLAIM_EXP, 1644210000);
  payload.set(CLAIM_IAT, 1643197539);
  payload.set(CLAIM_DCC, data);

  const plaintext = cbor.encode(payload)
  const headers = {
    'p': { 'alg': 'ES256', 'kid': keyID },
    'u': {}
  };

  const signer = {
    'key': {
      'd': keyD
    }
  };

  let buf = await cose.sign.create(
    headers,
    plaintext,
    signer);
  buf = zlib.deflate(buf)
  buf = 'HC1:' + base45.encode(buf)
  const dcc = Buffer.from(buf).toString()
  process.stdout.write(dcc);
  return dcc;
}

module.exports = router;