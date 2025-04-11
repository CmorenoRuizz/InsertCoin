const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Vista del formulario
router.get('/contacto', (req, res) => {
  res.render('contacto', { title: 'Contacto', success: null });
});

// Procesar envío del formulario
router.post('/contacto', (req, res) => {
  const { nombre, email, mensaje } = req.body;
  const userId = req.session.user ? req.session.user.id : null;


  if (!nombre || !mensaje) {
    return res.render('contacto', {
      title: 'Contacto',
      success: null
    });
  }

  const sql = 'INSERT INTO mensajes (nombre, email, mensaje, user_id) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, email || null, mensaje, userId], (err) => {
    if (err) throw err;

    res.render('contacto', {
      title: 'Contacto',
      success: 'Mensaje enviado correctamente.'
    });
  });
});


router.get('/mensajes', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const sql = 'SELECT mensaje, respuesta, fecha FROM mensajes WHERE user_id = ? ORDER BY fecha DESC';
  db.query(sql, [req.session.user.id], (err, resultados) => {
    if (err) throw err;
    res.render('mensajes', { title: 'Tus mensajes', mensajes: resultados });
  });
});


module.exports = router;
