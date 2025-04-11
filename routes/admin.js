const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware para verificar rol admin
function soloAdmin(req, res, next) {
  if (!req.session.user || req.session.user.rol !== 'admin') {
    return res.status(403).send('Acceso denegado');
  }
  next();
}

// Vista del panel admin
router.get('/admin', soloAdmin, (req, res) => {
  db.query('SELECT * FROM mensajes ORDER BY fecha DESC', (err, mensajes) => {
    if (err) throw err;
    res.render('admin', { title: 'Panel Admin', mensajes });
  });
});

// Eliminar mensaje
router.post('/admin/mensaje/:id/eliminar', soloAdmin, (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM mensajes WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.redirect('/admin');
  });
});

router.post('/admin/mensaje/:id/responder', soloAdmin, (req, res) => {
  const id = req.params.id;
  const respuesta = req.body.respuesta;

  const sql = 'UPDATE mensajes SET respuesta = ? WHERE id = ?';
  db.query(sql, [respuesta, id], (err) => {
    if (err) throw err;
    res.redirect('/admin');
  });
});


module.exports = router;
