document.addEventListener('DOMContentLoaded', function() {
  const chatBox = document.getElementById('chat-box');
  const chatMensajes = document.getElementById('chat-mensajes');
  const btnAbrirChat = document.getElementById('abrir-chat');
  const formChat = document.getElementById('form-chat');
  const inputChat = document.getElementById('input-chat');
  const btnCerrarChat = document.querySelector('#chat-box .chat-close-btn');
  
  // Variables para controlar el estado
  let mensajesCargados = false;
  
  // Configurar el botón de cierre para mostrar nuevamente el botón de chat
  btnCerrarChat?.addEventListener('click', () => {
    // Ocultar el panel de chat y mostrar el botón
    chatBox.style.display = 'none';
    btnAbrirChat.style.display = 'block';
  });
  // Abrir chat y cargar mensajes anteriores si no se han cargado
  btnAbrirChat?.addEventListener('click', () => {
    if (chatBox) {
      // Mostrar el panel de chat y ocultar el botón
      chatBox.style.display = 'block';
      btnAbrirChat.style.display = 'none';
      
      // Si no hemos cargado mensajes anteriores, los cargamos
      if (!mensajesCargados) {
        // Limpiar mensajes previos
        if (chatMensajes) chatMensajes.innerHTML = '';
        
        // Mostrar mensaje de carga
        const loadingDiv = document.createElement('div');
        loadingDiv.textContent = 'Cargando mensajes...';
        loadingDiv.className = 'chat-info-message';
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

    // Si no tenemos el ID del usuario, solicitarlo antes de enviar
    if (!document.body.hasAttribute('data-user-id')) {
      socket.emit('obtener_id_usuario');
    }
    
    // Enviar mensaje al servidor
    socket.emit('mensaje_usuario', {
      mensaje: mensaje
    }, response => {
      // Si el servidor proporciona una respuesta de confirmación, podemos usarla
      if (response && response.success) {
        console.log('Mensaje enviado correctamente:', response.id);
      }
    });

    // Limpiar el input después de enviar
    inputChat.value = '';
  });
  
  // Función para mostrar un mensaje en la interfaz
  function mostrarMensaje(remitente, mensaje, esPropio) {
    if (!chatMensajes) return;
    
    const div = document.createElement('div');
    div.className = esPropio ? 'mensaje-usuario' : 'mensaje-admin';
    
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
  // Recibir historial de mensajes
  socket.on('historial_mensajes', data => {
    if (!chatMensajes) return;
    
    // Limpiar mensajes y mensaje de carga
    chatMensajes.innerHTML = '';      if (data.mensajes.length === 0) {
      const noMessagesDiv = document.createElement('div');
      noMessagesDiv.textContent = 'No hay mensajes anteriores';
      noMessagesDiv.className = 'chat-info-message';
      chatMensajes.appendChild(noMessagesDiv);
      return;
    }
    
    // Mostrar cada mensaje del historial
    data.mensajes.forEach(msg => {
      const esPropio = msg.tipo === 'user';
      const remitente = esPropio ? 'Tú' : 'Admin';
      mostrarMensaje(remitente, msg.mensaje, esPropio);
    });
  });  // Recibir mensajes nuevos
  socket.on('nuevo_mensaje', data => {
    // Solo mostramos mensajes relevantes para este usuario 
    // (del admin dirigidos a nosotros o nuestros propios mensajes)
    
    // Obtener el ID del usuario actual
    let usuarioActual;
    
    // Primer intento: obtener desde el atributo del body (compatible con versiones anteriores)
    if (document.body.hasAttribute('data-user-id')) {
      usuarioActual = document.body.getAttribute('data-user-id');
    } else {
      // Segundo intento: preguntar al servidor el ID del usuario actual
      // Ya que el socket está conectado con la sesión, esto debería funcionar
      socket.emit('obtener_id_usuario');
    }
    
    // Si tenemos usuario identificado procesamos el mensaje
    if (usuarioActual) {
      procesarMensaje(data, usuarioActual);
    }
  });
  
  // Función para procesar el mensaje una vez que tenemos el ID
  function procesarMensaje(data, usuarioActual) {
    if (data.tipo === 'admin' && data.destinatario_id == usuarioActual) {
      // Mensaje del admin para este usuario
      mostrarMensaje('Admin', data.mensaje, false);
    } else if (data.tipo === 'user' && data.remitente_id == usuarioActual) {
      // Mensaje enviado por este usuario
      mostrarMensaje('Tú', data.mensaje, true);
    }
  }
  
  // Recibir el ID del usuario desde el servidor
  socket.on('id_usuario', id => {
    if (id) {
      // Si hay mensajes pendientes de procesar, ahora podemos mostrarlos
      console.log('ID de usuario recibido:', id);
      // Añadir el id como atributo al body para futuras referencias
      document.body.setAttribute('data-user-id', id);
    }
  });
});
