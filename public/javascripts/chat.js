document.addEventListener('DOMContentLoaded', function() {
  // Inicialización del chat de usuario
  document.getElementById('abrir-chat')?.addEventListener('click', () => {
    document.getElementById('chat-box').style.display = 'block';
  });

  document.getElementById('form-chat')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('input-chat');
    const mensaje = input.value.trim();
    if (!mensaje) return;

    // Enviar mensaje al servidor
    socket.emit('mensaje_usuario', {
      mensaje: mensaje
    });

    // Agregar mensaje a la interfaz local inmediatamente para mejor UX
    mostrarMensajeLocal('Tú', mensaje, true);

    // Limpiar el input después de enviar
    input.value = '';
  });

  // Función para mostrar un mensaje en la interfaz local
  function mostrarMensajeLocal(remitente, mensaje, esPropio) {
    const chatContainer = document.getElementById('chat-mensajes');
    if (!chatContainer) return;
    
    const div = document.createElement('div');
    div.textContent = `${remitente}: ${mensaje}`;
    
    if (esPropio) {
      div.className = 'text-end text-primary mb-1';
    } else {
      div.className = 'text-start text-danger mb-1';
    }
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Recibir mensajes del servidor
  socket.on('nuevo_mensaje', data => {
    // Solo procesamos mensajes del admin cuando estamos en el chat de usuario
    if (data.tipo === 'admin' && document.getElementById('chat-box')) {
      mostrarMensajeLocal('Admin', data.mensaje, false);
    }
  });
});
