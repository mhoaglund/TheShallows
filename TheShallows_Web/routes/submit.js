var express = require('express');
var router = express.Router();

/* POST a change order */
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
