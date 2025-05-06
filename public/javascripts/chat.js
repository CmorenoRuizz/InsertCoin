document.addEventListener('DOMContentLoaded', function() {
  const chatBox = document.getElementById('chat-box');
  const chatMensajes = document.getElementById('chat-mensajes');
  const btnAbrirChat = document.getElementById('abrir-chat');
  const formChat = document.getElementById('form-chat');
  const inputChat = document.getElementById('input-chat');
  
  // Variables para controlar el estado
  let mensajesCargados = false;

  // Abrir chat y cargar mensajes anteriores si no se han cargado
  btnAbrirChat?.addEventListener('click', () => {
    if (chatBox) {
      chatBox.style.display = 'block';
      
      // Si no hemos cargado mensajes anteriores, los cargamos
      if (!mensajesCargados) {
        // Limpiar mensajes previos
        if (chatMensajes) chatMensajes.innerHTML = '';
        
        // Mostrar mensaje de carga
        const loadingDiv = document.createElement('div');
        loadingDiv.textContent = 'Cargando mensajes...';
        loadingDiv.className = 'text-center text-muted my-2';
        if (chatMensajes) chatMensajes.appendChild(loadingDiv);
        
        // Solicitar historial de mensajes al servidor
        socket.emit('cargar_mensajes', {});
        mensajesCargados = true;
      }
    }
  });

  // Enviar mensaje
  formChat?.addEventListener('submit', e => {
    e.preventDefault();
    if (!inputChat) return;
    
    const mensaje = inputChat.value.trim();
    if (!mensaje) return;

    // Enviar mensaje al servidor
    socket.emit('mensaje_usuario', {
      mensaje: mensaje
    });

    // Limpiar el input después de enviar
    inputChat.value = '';
  });

  // Función para mostrar un mensaje en la interfaz
  function mostrarMensaje(remitente, mensaje, esPropio) {
    if (!chatMensajes) return;
    
    const div = document.createElement('div');
    div.textContent = `${remitente}: ${mensaje}`;
    
    if (esPropio) {
      div.className = 'text-end text-primary mb-1';
    } else {
      div.className = 'text-start text-danger mb-1';
    }
    
    chatMensajes.appendChild(div);
    chatMensajes.scrollTop = chatMensajes.scrollHeight;
  }

  // Recibir historial de mensajes
  socket.on('historial_mensajes', data => {
    if (!chatMensajes) return;
    
    // Limpiar mensajes y mensaje de carga
    chatMensajes.innerHTML = '';
    
    if (data.mensajes.length === 0) {
      const noMessagesDiv = document.createElement('div');
      noMessagesDiv.textContent = 'No hay mensajes anteriores';
      noMessagesDiv.className = 'text-center text-muted my-3';
      chatMensajes.appendChild(noMessagesDiv);
      return;
    }
    
    // Mostrar cada mensaje del historial
    data.mensajes.forEach(msg => {
      const esPropio = msg.tipo === 'user';
      const remitente = esPropio ? 'Tú' : 'Admin';
      mostrarMensaje(remitente, msg.mensaje, esPropio);
    });
  });

  // Recibir mensajes nuevos
  socket.on('nuevo_mensaje', data => {
    // Solo mostramos mensajes relevantes para este usuario 
    // (del admin dirigidos a nosotros o nuestros propios mensajes)
    const usuarioActual = document.body.getAttribute('data-user-id');
    
    if (data.tipo === 'admin' && data.destinatario_id == usuarioActual) {
      mostrarMensaje('Admin', data.mensaje, false);
    } else if (data.tipo === 'user' && data.remitente_id == usuarioActual) {
      mostrarMensaje('Tú', data.mensaje, true);
    }
  });
});
