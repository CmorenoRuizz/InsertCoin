const express = require('express');
const router = express.Router();
const db = require('../config/db');
const path = require('path');

router.get('/tetris', (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public/games/tetris/index.html'));
  });

// Guardar puntuación si es mejor que la anterior
router.post('/guardar-puntuacion', (req, res) => {
  if (!req.session.user) return res.status(401).send('No autorizado');

  const { juego, puntuacion } = req.body;
  const userId = req.session.user.id;

  const buscar = 'SELECT * FROM puntuaciones WHERE user_id = ? AND juego = ? LIMIT 1';
  db.query(buscar, [userId, juego], (err, result) => {
    if (err) return res.status(500).send('Error en la BD');

    if (result.length === 0) {
      // No hay puntuación previa: insertar nueva
      const insertar = 'INSERT INTO puntuaciones (user_id, juego, puntuacion) VALUES (?, ?, ?)';
      db.query(insertar, [userId, juego, puntuacion], (err2) => {
        if (err2) return res.status(500).send('Error al insertar');
        res.send('Puntuación guardada');
      });
    } else {
      // Ya hay puntuación: solo actualizar si es mejor
      const puntuacionAnterior = result[0].puntuacion;
      if (puntuacion > puntuacionAnterior) {
        const actualizar = 'UPDATE puntuaciones SET puntuacion = ?, fecha = NOW() WHERE user_id = ? AND juego = ?';
        db.query(actualizar, [puntuacion, userId, juego], (err3) => {
          if (err3) return res.status(500).send('Error al actualizar');
          res.send('Puntuación actualizada');
        });
      } else {
        res.send('No se actualiza: puntuación menor o igual');
      }
    }
  });
});

module.exports = router;
