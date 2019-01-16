var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Toronto Waste Lookup' });
});

router.post('/', function(req, res, next) {
  res.render('index', { title: 'Toronto Waste Lookup' });
});

module.exports = router;
