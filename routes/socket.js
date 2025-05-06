// socket.js
const db = require('../config/db');

function setupSocket(io) {
  io.on('connection', (socket) => {
    // Reducimos los logs en la terminal
    // console.log('🟢 Nuevo cliente conectado al chat');
    
    // Acceder a la sesión a través de socket.handshake
    // console.log('Sesión disponible:', !!socket.handshake.session);
    // console.log('Usuario en sesión:', socket.handshake.session.user ? 
    //   `ID: ${socket.handshake.session.user.id}` : 'No hay usuario');

    socket.on('mensaje_usuario', data => {
      // Verificar si hay sesión y usuario
      if (!socket.handshake.session || !socket.handshake.session.user) {
        // console.log('❌ Error: No hay sesión de usuario al enviar mensaje');
        return;
      }

      const mensaje = data.mensaje;
      const userId = socket.handshake.session.user.id;
      const username = socket.handshake.session.user.username || 'Usuario';
      
      // console.log(`💬 Recibido mensaje de usuario ${userId}: ${mensaje}`);

      const sql = 'INSERT INTO mensajes_chat (remitente_id, mensaje, tipo) VALUES (?, ?, ?)';
      db.query(sql, [userId, mensaje, 'user'], (err, result) => {
        if (err) {
          console.error('Error al guardar mensaje de usuario.');
        } else {
          // console.log('💾 Mensaje guardado en DB con ID:', result.insertId);
          
          // Emitir el mensaje a todos los clientes
          io.emit('nuevo_mensaje', {
            username: username,
            mensaje,
            tipo: 'user'
          });
        }
      });
    });

    // Cuando el admin responde desde su widget
    socket.on('mensaje_admin', data => {
      if (!socket.handshake.session || !socket.handshake.session.user || 
          socket.handshake.session.user.rol !== 'admin') {
        // console.log('❌ Error: No hay sesión de admin al enviar mensaje');
        return;
      }
      
      const mensaje = data.mensaje;
      const userId = socket.handshake.session.user.id;
      const username = socket.handshake.session.user.username || 'Admin';
      
      // console.log(`👑 Recibido mensaje de admin ${userId}: ${mensaje}`);
      
      const sql = 'INSERT INTO mensajes_chat (remitente_id, mensaje, tipo) VALUES (?, ?, ?)';
      db.query(sql, [userId, mensaje, 'admin'], (err, result) => {
        if (err) {
          console.error('Error al guardar mensaje del administrador.');
        } else {
          // console.log('💾 Respuesta del admin guardada con ID:', result.insertId);

          // Enviar mensaje a todos los usuarios conectados
          io.emit('nuevo_mensaje', {
            username: username,
            mensaje,
            tipo: 'admin'
          });
        }
      });
    });
  });
}

module.exports = setupSocket;
