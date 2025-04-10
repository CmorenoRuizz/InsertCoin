var express = require('express');
var router = express.Router();
const db = require('../config/db');

// router.get('/', (req, res) => {
//   db.query('SELECT * FROM usuarios', (err, resultados) => {
//     if (err) throw err;
//     console.log(resultados);
//     res.render('index', { title: 'Inicio' });
//   });
// });

// router.get('/login-simulado', (req, res) => {
//   const usuario = {
//     id: 1,
//     username: 'Carlos',
//     avatar: '/images/default-avatar.png',
//     rol: 'admin'
//   };
//   req.session.user = usuario;
//   res.redirect('/');
// });

// Vista del login
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

// Procesar el login NOTA LAS CONTRASEÑAS ESTAN EN TEXTO PLANO, LUEGO HAY QUE HASHEARLAS
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE username = ? LIMIT 1';
  db.query(sql, [username], (err, results) => {
    if (err) throw err;

    if (results.length === 0 || results[0].password !== password) {
      return res.render('login', {
        title: 'Login',
        error: 'Usuario o contraseña incorrectos.'
      });
    }

    const usuario = {
      id: results[0].id,
      username: results[0].username,
      avatar: results[0].avatar,
      rol: results[0].rol
    };

    req.session.user = usuario;
    res.redirect('/');
  });
});


router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



module.exports = router;