const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const db = require('../config/db');
const fs = require('fs');


// Protege la ruta para que solo usuarios logeados accedan
function soloUsuarios(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/avatars');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, nombreUnico);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes.'));
  }
};
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter
});

// -----------------------------------
// RUTA GET (mostrar formulario)
// -----------------------------------
router.get('/config', soloUsuarios, (req, res) => {
    res.render('config', { title: 'Editar Perfil', user: req.session.user, success: null });
  });
  

// -----------------------------------
// RUTA POST (procesar cambios)
// -----------------------------------
router.post('/config', soloUsuarios, upload.single('avatar'), async (req, res) => {
    const { username, password } = req.body;
    let avatar = req.file ? '/uploads/avatars/' + req.file.filename : null;
    const userId = req.session.user.id;
  
    const actualizaciones = [];
    const valores = [];
    const cambios = []; // Para mensaje de éxito
  
    if (username && username !== req.session.user.username) {
      actualizaciones.push('username = ?');
      valores.push(username);
      cambios.push('nombre de usuario');
    }
  
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      actualizaciones.push('password = ?');
      valores.push(hashedPassword);
      cambios.push('contraseña');
    }
  
    if (avatar) {
      actualizaciones.push('avatar = ?');
      valores.push(avatar);
      cambios.push('avatar');
  
      // ELIMINAR AVATAR ANTERIOR si no es el de defecto
      if (req.session.user.avatar !== '/images/default-avatar.png') {
        const rutaVieja = path.join(__dirname, '../public', req.session.user.avatar);
        fs.unlink(rutaVieja, (err) => {
          if (err) {
            console.error('⚠️ No se pudo borrar el avatar anterior:', err.message);
          } else {
            console.log('✅ Avatar anterior eliminado correctamente');
          }
        });
      }
    }
  
    if (actualizaciones.length === 0) {
      return res.render('config', { title: 'Editar Perfil', user: req.session.user, success: 'No se realizaron cambios.' });
    }
  
    const sql = `UPDATE usuarios SET ${actualizaciones.join(', ')} WHERE id = ?`;
    valores.push(userId);
  
    db.query(sql, valores, (err) => {
      if (err) throw err;
  
      // Actualizar sesión
      if (username) req.session.user.username = username;
      if (avatar) req.session.user.avatar = avatar;
  
      const mensaje = `Cambios realizados: ${cambios.join(', ')}.`;
      res.render('config', { title: 'Editar Perfil', user: req.session.user, success: mensaje });
    });
  });
  
  

module.exports = router;
