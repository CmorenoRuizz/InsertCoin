const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Vista protegida del ranking
router.get('/ranking', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('ranking', { title: 'Ranking' });
});

// API para rankings por juego
router.get('/ranking/:juego', (req, res) => {
  const juego = req.params.juego;

  const sql = `
    SELECT u.username, MAX(p.puntuacion) AS puntuacion
    FROM puntuaciones p
    JOIN usuarios u ON p.user_id = u.id
    WHERE p.juego = ?
    GROUP BY u.id
    ORDER BY puntuacion DESC
    LIMIT 10
  `;

  db.query(sql, [juego], (err, resultados) => {
    if (err) return res.status(500).json([]);
    res.json(resultados);
  });
});

module.exports = router;
