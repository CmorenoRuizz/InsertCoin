const bcrypt = require('bcrypt');

const contraseña = '1234'; // Aquí la contraseña en texto plano

bcrypt.hash(contraseña, 10)
  .then(hash => {
    console.log(`Contraseña original: ${contraseña}`);
    console.log(`Hash generado: ${hash}`);
  })
  .catch(err => {
    console.error('Error al hashear:', err);
  });
