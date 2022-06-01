const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const router = require('./router');
const routerVerify = require('./routerVerify');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/assets', express.static('assets'));
app.set('view engine', 'ejs');

app.use('/issue', router);
app.use('/verify', routerVerify);

router.get('/', async function (req, res) {
  await res.render('index');
});

app.listen(port, function () {
  console.log('Server is running on PORT', port);
});