document.addEventListener('DOMContentLoaded', function() {
  const chatBox = document.getElementById('admin-chat-box');
  const chatMensajes = document.getElementById('admin-chat-mensajes');
  const btnAbrirChat = document.getElementById('abrir-chat-admin');
  const formChat = document.getElementById('form-chat-admin');
  const inputChat = document.getElementById('input-chat-admin');
  const selectorUsuario = document.getElementById('selector-usuario-chat');
  const submitBtn = formChat?.querySelector('button[type="submit"]');
  
  // Variables para controlar el estado
  let usuariosListosCargados = false;
  let usuarioSeleccionadoId = null;
  
  // Abrir chat y cargar lista de usuarios si no se ha cargado
  btnAbrirChat?.addEventListener('click', () => {
    if (chatBox) {
      chatBox.style.display = 'block';
      
      // Si no hemos cargado la lista de usuarios, la solicitamos
      if (!usuariosListosCargados) {
        socket.emit('obtener_usuarios_chat');
        usuariosListosCargados = true;
      }
    }
  });
  
  // Cuando se cambia el usuario seleccionado
  selectorUsuario?.addEventListener('change', function() {
    usuarioSeleccionadoId = this.value;
    
    // Activar o desactivar el formulario según si hay usuario seleccionado
    if (inputChat) {
      inputChat.disabled = !usuarioSeleccionadoId;
      if (submitBtn) submitBtn.disabled = !usuarioSeleccionadoId;
    }
    
    if (usuarioSeleccionadoId) {
      // Mostrar mensaje de carga
      if (chatMensajes) {
        chatMensajes.innerHTML = '<div class="text-center my-2">Cargando conversación...</div>';
      }
      
      // Solicitar mensajes para este usuario
      socket.emit('cargar_mensajes', {
        otroUsuarioId: parseInt(usuarioSeleccionadoId)
      });
    } else {
      // No hay usuario seleccionado, mostrar instrucciones
      if (chatMensajes) {
        chatMensajes.innerHTML = '<div class="text-center text-muted my-3">Selecciona un usuario para ver la conversación</div>';
      }
    }
  });
  
  // Enviar mensaje como admin
  formChat?.addEventListener('submit', e => {
    e.preventDefault();
    if (!inputChat || !usuarioSeleccionadoId) return;
    
    const mensaje = inputChat.value.trim();
    if (!mensaje) return;
    
    // Enviar mensaje al servidor especificando destinatario
    socket.emit('mensaje_admin', {
      mensaje: mensaje,
      destinatarioId: parseInt(usuarioSeleccionadoId)
    });
    
    // Limpiar input después de enviar
    inputChat.value = '';
  });
  
  // Función para mostrar un mensaje en la interfaz
  function mostrarMensaje(remitente, mensaje, esAdmin) {
    if (!chatMensajes) return;
    
    const div = document.createElement('div');
    div.textContent = `${remitente}: ${mensaje}`;
    
    if (esAdmin) {
      div.className = 'text-start text-danger mb-1';
    } else {
      div.className = 'text-end text-primary mb-1';
    }
    
    chatMensajes.appendChild(div);
    chatMensajes.scrollTop = chatMensajes.scrollHeight;
  }
  
  // Recibir lista de usuarios
  socket.on('lista_usuarios_chat', data => {
    if (!selectorUsuario) return;
    
    // Mantener la primera opción (placeholder)
    const defaultOption = selectorUsuario.options[0];
    selectorUsuario.innerHTML = '';
    selectorUsuario.appendChild(defaultOption);
    
    // Agregar cada usuario al selector
    data.usuarios.forEach(usuario => {
      const option = document.createElement('option');
      option.value = usuario.id;
      option.textContent = usuario.username;
      selectorUsuario.appendChild(option);
    });
  });
  
  // Recibir historial de mensajes
  socket.on('historial_mensajes', data => {
    if (!chatMensajes) return;
    
    // Limpiar mensajes existentes
    chatMensajes.innerHTML = '';
    
    if (data.mensajes.length === 0) {
      const noMessagesDiv = document.createElement('div');
      noMessagesDiv.textContent = 'No hay mensajes anteriores con este usuario';
      noMessagesDiv.className = 'text-center text-muted my-3';
      chatMensajes.appendChild(noMessagesDiv);
      return;
    }
    
    // Mostrar cada mensaje del historial
    data.mensajes.forEach(msg => {
      const esAdmin = msg.tipo === 'admin';
      const remitente = esAdmin ? 'Tú (Admin)' : msg.username;
      mostrarMensaje(remitente, msg.mensaje, esAdmin);
    });
  });
  
  // Recibir mensajes nuevos
  socket.on('nuevo_mensaje', data => {
    // Solo mostramos mensajes relacionados con el usuario seleccionado
    if (!usuarioSeleccionadoId) return;
    
    const isRelevantMessage = 
      (data.tipo === 'user' && data.remitente_id == usuarioSeleccionadoId) ||
      (data.tipo === 'admin' && data.destinatario_id == usuarioSeleccionadoId);
    
    if (isRelevantMessage) {
      const esAdmin = data.tipo === 'admin';
      const remitente = esAdmin ? 'Tú (Admin)' : data.username;
      mostrarMensaje(remitente, data.mensaje, esAdmin);
    }
  });
});
