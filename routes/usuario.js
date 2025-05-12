const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware para proteger la ruta
function soloUsuarios(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Ruta principal del usuario logeado
router.get('/', soloUsuarios, (req, res) => {
  res.render('indexUser', { title: 'InsertCoin - Inicio Usuario', user: req.session.user });
});

module.exports = router;
