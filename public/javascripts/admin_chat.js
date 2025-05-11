document.addEventListener('DOMContentLoaded', function() {
  const chatBox = document.getElementById('admin-chat-box');
  const chatMensajes = document.getElementById('admin-chat-mensajes');
  const btnAbrirChat = document.getElementById('abrir-chat-admin');
  const formChat = document.getElementById('form-chat-admin');
  const inputChat = document.getElementById('input-chat-admin');
  const selectorUsuario = document.getElementById('selector-usuario-chat');
  const submitBtn = formChat?.querySelector('button[type="submit"]');
  const btnCerrarChat = document.querySelector('#admin-chat-box .chat-close-btn');
  
  // Variables para controlar el estado
  let usuariosListosCargados = false;
  let usuarioSeleccionadoId = null;
  
  // Configurar el botón de cierre para mostrar nuevamente el botón de chat
  btnCerrarChat?.addEventListener('click', () => {
    // Ocultar el panel de chat y mostrar el botón
    chatBox.style.display = 'none';
    btnAbrirChat.style.display = 'block';
  });
  
  // Establecer el estado inicial del formulario (oculto hasta que se seleccione un usuario)
  if (formChat) {
    formChat.classList.add('hidden-until-selection');
  }
    // Abrir chat y cargar lista de usuarios si no se ha cargado
  btnAbrirChat?.addEventListener('click', () => {
    if (chatBox) {
      // Mostrar el panel de chat y ocultar el botón
      chatBox.style.display = 'block';
      btnAbrirChat.style.display = 'none';
      
      // Si no hemos cargado la lista de usuarios, la solicitamos
      if (!usuariosListosCargados) {
        socket.emit('obtener_usuarios_chat');
        usuariosListosCargados = true;
      }
    }
  });// Cuando se cambia el usuario seleccionado
  selectorUsuario?.addEventListener('change', function() {
    usuarioSeleccionadoId = this.value;
    
    const formChatAdmin = document.getElementById('form-chat-admin');
    const noUserSelectedMsg = document.querySelector('.no-user-selected-message');
    
    // Mostrar u ocultar el formulario según si hay usuario seleccionado
    if (usuarioSeleccionadoId) {
      // Hay usuario seleccionado
      if (formChatAdmin) {
        formChatAdmin.classList.remove('hidden-until-selection');
      }
      if (noUserSelectedMsg) {
        noUserSelectedMsg.style.display = 'none';
      }
      
      // Activar el formulario
      if (inputChat) {
        inputChat.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
      }
      
      // Mostrar mensaje de carga
      if (chatMensajes) {
        chatMensajes.innerHTML = '<div class="chat-info-message">Cargando conversación...</div>';
      }
      
      // Solicitar mensajes para este usuario
      socket.emit('cargar_mensajes', {
        otroUsuarioId: parseInt(usuarioSeleccionadoId)
      });
    } else {
      // No hay usuario seleccionado
      if (formChatAdmin) {
        formChatAdmin.classList.add('hidden-until-selection');
      }
      if (noUserSelectedMsg) {
        noUserSelectedMsg.style.display = 'block';
      }
      
      // Desactivar el formulario
      if (inputChat) {
        inputChat.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
      }
      
      // Mostrar instrucciones
      if (chatMensajes) {
        chatMensajes.innerHTML = '<div class="chat-info-message">Selecciona un usuario para ver la conversación</div>';
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
    div.className = esAdmin ? 'mensaje-admin' : 'mensaje-usuario';
    
    const strong = document.createElement('strong');
    strong.textContent = remitente;
    
    const contenido = document.createElement('div');
    contenido.className = 'mensaje-contenido';
    contenido.textContent = mensaje;
    
    div.appendChild(strong);
    div.appendChild(contenido);
    
    // Añadimos clases para entrada y salida con animaciones definidas en CSS
    div.classList.add('mensaje-nuevo');
    
    chatMensajes.appendChild(div);
    
    // Forzamos el reflow para que la animación funcione
    void div.offsetWidth;
    
    // Quitamos la clase de animación de entrada para que se muestre
    div.classList.remove('mensaje-nuevo');
    
    // Scroll al final siempre que se añade un nuevo mensaje
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
      noMessagesDiv.className = 'chat-info-message';
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
