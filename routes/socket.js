// socket.js
const db = require('../config/db');

function setupSocket(io) {  // Crear la columna destinatario_id si no existe
  db.query(`SHOW COLUMNS FROM mensajes_chat LIKE 'destinatario_id'`, (err, result) => {
    if (err) {
      console.error('Error al consultar la estructura de la tabla:', err);
      return;
    }
    
    if (result.length === 0) {
      db.query(`ALTER TABLE mensajes_chat ADD destinatario_id INT DEFAULT NULL AFTER remitente_id`, (err) => {
        if (err) {
          console.error('Error al añadir columna destinatario_id:', err);
        } else {
          console.log('Columna destinatario_id añadida correctamente');
        }
      });
    }
  });
  io.on('connection', (socket) => {
    // Cargar mensajes del chat de sala pública
    socket.on('cargar_mensajes_sala', () => {
      // Verificar que el usuario esté autenticado
      if (!socket.handshake.session || !socket.handshake.session.user) {
        return;
      }

      // Consultar los últimos 50 mensajes de la sala ordenados por fecha
      const sql = `
        SELECT cs.id, cs.mensaje, cs.fecha, u.id AS usuario_id, u.username, u.avatar
        FROM chat_sala cs
        JOIN usuarios u ON cs.remitente_id = u.id
        ORDER BY cs.fecha DESC
        LIMIT 50
      `;

      db.query(sql, (err, mensajes) => {
        if (err) {
          console.error('Error al cargar mensajes de sala:', err);
        } else {
          // Invertir para mostrar en orden cronológico (del más antiguo al más reciente)
          socket.emit('historial_sala', mensajes.reverse());
        }
      });
    });

    // Manejar nuevo mensaje en la sala pública
    socket.on('nuevo_mensaje_sala', data => {
      if (!socket.handshake.session || !socket.handshake.session.user) {
        return;
      }

      const userId = socket.handshake.session.user.id;
      const mensaje = data.mensaje;

      // Escape HTML para prevenir XSS
      const mensajeSeguro = mensaje
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Guardar el mensaje en la base de datos
      const sql = 'INSERT INTO chat_sala (remitente_id, mensaje) VALUES (?, ?)';
      db.query(sql, [userId, mensajeSeguro], (err, result) => {
        if (err) {
          console.error('Error al guardar mensaje en sala:', err);
        } else {
          // Obtener información completa del usuario
          db.query('SELECT id, username, avatar FROM usuarios WHERE id = ?', [userId], (err, users) => {
            if (err || !users.length) {
              console.error('Error al obtener datos del usuario:', err);
              return;
            }

            const user = users[0];
            // Emitir el mensaje a todos los usuarios conectados
            io.emit('mensaje_sala', {
              id: result.insertId,
              mensaje: mensajeSeguro,
              fecha: new Date(),
              usuario_id: user.id,
              username: user.username,
              avatar: user.avatar || '/images/default-avatar.png'
            });
          });
        }
      });
    });

    // Cargar mensajes para un usuario específico (chat privado)
    socket.on('cargar_mensajes', data => {
      if (!socket.handshake.session || !socket.handshake.session.user) {
        return;
      }

      const currentUser = socket.handshake.session.user;
      const userId = currentUser.id;
      const esAdmin = currentUser.rol === 'admin';
      let sql;
      let params;
      
      if (esAdmin && data.otroUsuarioId) {
        // Si es admin y solicita mensajes con un usuario específico
        sql = `
          SELECT m.*, u.username 
          FROM mensajes_chat m 
          JOIN usuarios u ON m.remitente_id = u.id 
          WHERE (m.remitente_id = ? AND m.destinatario_id = ?) 
             OR (m.remitente_id = ? AND m.destinatario_id = ?)
          ORDER BY m.fecha ASC
        `;
        params = [userId, data.otroUsuarioId, data.otroUsuarioId, userId];
      } else if (!esAdmin) {
        // Si es usuario normal, solo carga mensajes entre él y cualquier administrador
        sql = `
          SELECT m.*, u.username 
          FROM mensajes_chat m 
          JOIN usuarios u ON m.remitente_id = u.id 
          WHERE (m.remitente_id = ? AND m.tipo = 'user') 
             OR (m.destinatario_id = ? AND m.tipo = 'admin')
          ORDER BY m.fecha ASC
        `;
        params = [userId, userId];
      } else {
        // Admin sin usuario seleccionado, no enviar nada
        return;
      }
      
      db.query(sql, params, (err, mensajes) => {
        if (err) {
          console.error('Error al cargar mensajes:', err);
        } else {
          socket.emit('historial_mensajes', { mensajes });
        }
      });
    });
    
    // Obtener lista de usuarios para el admin
    socket.on('obtener_usuarios_chat', () => {
      if (!socket.handshake.session?.user || socket.handshake.session.user.rol !== 'admin') {
        return;
      }
      
      // Encontrar usuarios con los que el admin ha tenido conversaciones
      db.query(`
        SELECT DISTINCT u.id, u.username, u.avatar
        FROM usuarios u 
        JOIN mensajes_chat m ON u.id = m.remitente_id OR u.id = m.destinatario_id
        WHERE u.rol = 'user'
        ORDER BY u.username
      `, (err, usuarios) => {
        if (err) {
          console.error('Error al obtener usuarios:', err);
        } else {
          socket.emit('lista_usuarios_chat', { usuarios });
        }
      });
    });

    // Cuando un usuario envía un mensaje
    socket.on('mensaje_usuario', data => {
      if (!socket.handshake.session || !socket.handshake.session.user) {
        return;
      }

      const mensaje = data.mensaje;
      const userId = socket.handshake.session.user.id;
      const username = socket.handshake.session.user.username || 'Usuario';
      
      // Buscar un administrador para enviarle el mensaje
      db.query('SELECT id FROM usuarios WHERE rol = "admin" LIMIT 1', (err, adminResult) => {
        if (err || adminResult.length === 0) {
          console.error('Error al encontrar administrador:', err);
          return;
        }
        
        const adminId = adminResult[0].id;
        
        // Guardar mensaje con destinatario
        const sql = 'INSERT INTO mensajes_chat (remitente_id, destinatario_id, mensaje, tipo) VALUES (?, ?, ?, ?)';
        db.query(sql, [userId, adminId, mensaje, 'user'], (err, result) => {
          if (err) {
            console.error('Error al guardar mensaje de usuario:', err);
          } else {
            // Emitir el mensaje a todos los administradores
            io.emit('nuevo_mensaje', {
              id: result.insertId,
              remitente_id: userId,
              destinatario_id: adminId,
              username: username,
              mensaje,
              tipo: 'user',
              fecha: new Date()
            });
          }
        });
      });
    });

    // Cuando el admin responde desde su widget
    socket.on('mensaje_admin', data => {
      if (!socket.handshake.session?.user || socket.handshake.session.user.rol !== 'admin') {
        return;
      }
      
      const mensaje = data.mensaje;
      const userId = socket.handshake.session.user.id;
      const username = socket.handshake.session.user.username || 'Admin';
      const destinatarioId = data.destinatarioId;
      
      if (!destinatarioId) {
        console.error('Error: No se especificó destinatario para el mensaje del admin');
        return;
      }
      
      const sql = 'INSERT INTO mensajes_chat (remitente_id, destinatario_id, mensaje, tipo) VALUES (?, ?, ?, ?)';
      db.query(sql, [userId, destinatarioId, mensaje, 'admin'], (err, result) => {
        if (err) {
          console.error('Error al guardar mensaje del admin:', err);
        } else {
          const nuevoMensaje = {
            id: result.insertId,
            remitente_id: userId,
            destinatario_id: destinatarioId,
            username: username,
            mensaje,
            tipo: 'admin',
            fecha: new Date()
          };
          
          // Emitir a todos para que el destinatario reciba el mensaje si está conectado
          io.emit('nuevo_mensaje', nuevoMensaje);
        }
      });
    });
  });
}

module.exports = setupSocket;
