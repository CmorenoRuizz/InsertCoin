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

  if (!nombre || !mensaje) {
    return res.render('contacto', {
      title: 'Contacto',
      success: null
    });
  }

  const sql = 'INSERT INTO mensajes (nombre, email, mensaje) VALUES (?, ?, ?)';
  db.query(sql, [nombre, email || null, mensaje], (err) => {
    if (err) throw err;

    res.render('contacto', {
      title: 'Contacto',
      success: 'Mensaje enviado correctamente.'
    });
  });
});

module.exports = router;
