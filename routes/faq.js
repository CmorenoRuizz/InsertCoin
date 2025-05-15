var express = require('express');
var router = express.Router();

/* GET página de Preguntas Frecuentes (FAQ) */
router.get('/', function(req, res, next) {
  res.render('faq', { title: 'Preguntas Frecuentes' });
});

module.exports = router;
