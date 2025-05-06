document.addEventListener('DOMContentLoaded', function() {
  // Inicialización del chat de administrador
  document.getElementById('abrir-chat-admin')?.addEventListener('click', () => {
    document.getElementById('admin-chat-box').style.display = 'block';
  });

  // Enviar mensaje como admin
  document.getElementById('form-chat-admin')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('input-chat-admin');
    const mensaje = input.value.trim();
    if (!mensaje) return;

    // Enviar mensaje al servidor
    socket.emit('mensaje_admin', {
      mensaje: mensaje
    });

    // Agregar mensaje a la interfaz local inmediatamente para mejor UX
    mostrarMensajeLocal('Tú (Admin)', mensaje, true);

    // Limpiar el input
    input.value = '';
  });

  // Función para mostrar un mensaje en la interfaz local
  function mostrarMensajeLocal(remitente, mensaje, esAdmin) {
    const chatContainer = document.getElementById('admin-chat-mensajes');
    if (!chatContainer) return;
    
    const div = document.createElement('div');
    div.textContent = `${remitente}: ${mensaje}`;
    
    if (esAdmin) {
      div.className = 'text-start text-danger mb-1';
    } else {
      div.className = 'text-end text-primary mb-1';
    }
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Recibir mensajes del servidor
  socket.on('nuevo_mensaje', data => {
    // Solo procesamos mensajes de usuarios cuando estamos en el chat de admin
    if (data.tipo === 'user' && document.getElementById('admin-chat-box')) {
      mostrarMensajeLocal(data.username, data.mensaje, false);
    }
  });
});
