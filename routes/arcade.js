const express = require('express');
const router = express.Router();
const db = require('../config/db');
const path = require('path');

// Middleware para proteger
function soloUsuarios(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Ruta para mostrar el catálogo de juegos
router.get('/juegos', soloUsuarios, (req, res) => {
  res.render('juegos', { title: 'Juegos', user: req.session.user });
});

// Ruta para jugar al Tetris
router.get('/juegos/tetris', soloUsuarios, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/games/tetris/index.html'));
});

// Ruta para jugar al Snake
router.get('/juegos/snake', soloUsuarios, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/games/snake/index.html'));
});

// Ruta para jugar al Flappy Bird
router.get('/juegos/flappybird', soloUsuarios, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/games/flappybird/index.html'));
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


// Obtener ranking personalizado en cada juego
router.get('/ranking/posicion/:juego', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'No autorizado' });

  const juego = req.params.juego;
  const userId = req.session.user.id;

  // Obtener el ranking completo ordenado
  const sql = `
    SELECT u.username, p.user_id, MAX(p.puntuacion) AS puntuacion
    FROM puntuaciones p
    JOIN usuarios u ON u.id = p.user_id
    WHERE p.juego = ?
    GROUP BY p.user_id
    ORDER BY puntuacion DESC
  `;

  db.query(sql, [juego], (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error en la BD' });

    // Buscar posición del usuario logeado
    const posicion = resultados.findIndex(r => r.user_id === userId);

    if (posicion === -1) {
      return res.json({
        posicion: null,
        mensaje: "No tienes puntuación registrada aún en este juego"
      });
    }

    const datos = {
      posicion: posicion + 1,
      usuario: resultados[posicion].username,
      puntuacion: resultados[posicion].puntuacion,
      top1: resultados[0],
      anterior: posicion > 0 ? resultados[posicion - 1] : null
    };

    res.json(datos);
  });
});


// Para usuario
router.get('/ranking-info/:juego', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'No autorizado' });

  const userId = req.session.user.id;
  const juego = req.params.juego;

  const sql = `
    SELECT u.username, p.puntuacion, u.id AS userId
    FROM puntuaciones p
    JOIN usuarios u ON u.id = p.user_id
    WHERE p.juego = ?
    ORDER BY p.puntuacion DESC
  `;

  db.query(sql, [juego], (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error en BD' });

    const posicion = resultados.findIndex(row => row.userId === userId);
    if (posicion === -1) {
      return res.json({ posicion: null, puntuacion: null });
    }

    const yo = resultados[posicion];
    const anterior = posicion > 0 ? resultados[posicion - 1] : null;
    const primero = resultados[0];

    res.json({
      posicion: posicion + 1,
      miPuntuacion: yo.puntuacion,
      anterior: anterior ? { username: anterior.username, puntuacion: anterior.puntuacion } : null,
      primero: { username: primero.username, puntuacion: primero.puntuacion }
    });
  });
});



module.exports = router;