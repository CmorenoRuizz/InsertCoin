var express = require('express');
var router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

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


// // Procesar el login NOTA LAS CONTRASEÑAS ESTAN EN TEXTO PLANO, LUEGO HAY QUE HASHEARLAS
// router.post('/login', (req, res) => {
//   const { username, password } = req.body;

//   const sql = 'SELECT * FROM usuarios WHERE username = ? LIMIT 1';
//   db.query(sql, [username], (err, results) => {
//     if (err) throw err;

//     if (results.length === 0 || results[0].password !== password) {
//       return res.render('login', {
//         title: 'Login',
//         error: 'Usuario o contraseña incorrectos.'
//       });
//     }

//     const usuario = {
//       id: results[0].id,
//       username: results[0].username,
//       avatar: results[0].avatar,
//       rol: results[0].rol
//     };

//     req.session.user = usuario;
//     res.redirect('/');
//   });
// });


// Vista del login sin usar bcrypt
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE username = ? LIMIT 1';
  db.query(sql, [username], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.render('login', { title: 'Login', error: 'Usuario o contraseña incorrectos.' });
    }

    const user = results[0];

    const passwordCorrecta = await bcrypt.compare(password, user.password);

    if (!passwordCorrecta) {
      return res.render('login', { title: 'Login', error: 'Usuario o contraseña incorrectos.' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      rol: user.rol
    };

    res.redirect('/');
  });
});


// Vista de registro
router.get('/register', (req, res) => {
  res.render('register', { title: 'Registro', error: null });
});


// Procesar el registro
router.post('/register', async (req, res) => {
  const { username, password, confirmar_password } = req.body;

  // Validar campos
  if (!username || !password || !confirmar_password) {
    return res.render('register', { title: 'Registro', error: 'Rellena todos los campos.' });
  }

  if (password !== confirmar_password) {
    return res.render('register', { title: 'Registro', error: 'Las contraseñas no coinciden.' });
  }

  // Verificar que el usuario no exista ya
  const sqlBuscar = 'SELECT * FROM usuarios WHERE username = ? LIMIT 1';
  db.query(sqlBuscar, [username], async (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      return res.render('register', { title: 'Registro', error: 'El nombre de usuario ya existe.' });
    }

    // Hashear la contraseña y crear el nuevo usuario
    const hash = await bcrypt.hash(password, 10);

    const sqlInsertar = 'INSERT INTO usuarios (username, password) VALUES (?, ?)';
    db.query(sqlInsertar, [username, hash], (err2) => {
      if (err2) throw err2;

      // Redirigir al login tras registrarse
      res.redirect('/login');
    });
  });
});


router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Inicio' });
});



module.exports = router;