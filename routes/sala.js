const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware para proteger la ruta - solo usuarios logeados
function soloUsuarios(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Vista principal del chat de sala
router.get('/sala', soloUsuarios, (req, res) => {
  res.render('sala', { 
    title: 'Chat de Sala',
    user: req.session.user
  });
});

module.exports = router;
