document.addEventListener('DOMContentLoaded', function() {
  // Referencias a los elementos del DOM
  const chatMensajes = document.getElementById('sala-chat-mensajes');
  const formChat = document.getElementById('form-sala-chat');
  const inputChat = document.getElementById('input-sala-chat');

  // Variables de estado
  let socketConectado = false;
  
  // Esperar a que Socket.IO esté conectado antes de configurar eventos
  if (typeof socket !== 'undefined') {
    // Comprobar si ya está conectado
    if (socket.connected) {
      socketConectado = true;
      configurarEventos();
    }
    
    // O escuchar el evento connect
    socket.on('connect', () => {
      socketConectado = true;
      configurarEventos();
    });
  }
  
  function configurarEventos() {
    // Limpiar el contenedor de mensajes
    if (chatMensajes) {
      chatMensajes.innerHTML = '';
      
      // Mostrar mensaje de bienvenida
      const mensajeBienvenida = document.createElement('div');
      mensajeBienvenida.className = 'mensaje-sistema';
      mensajeBienvenida.textContent = '¡Conectado al chat! Cargando mensajes...';
      chatMensajes.appendChild(mensajeBienvenida);
      
      // Solicitar historial de mensajes
      socket.emit('cargar_mensajes_sala');
    }
    
    // Procesar el envío de mensajes
    if (formChat) {
      formChat.addEventListener('submit', enviarMensaje);
    }
    
    // Escuchar eventos de Socket.IO
    socket.on('historial_sala', mostrarHistorial);
    socket.on('mensaje_sala', agregarMensaje);
  }
  
  function enviarMensaje(e) {
    e.preventDefault();
    if (!socketConectado || !inputChat) return;
    
    const mensaje = inputChat.value.trim();
    if (!mensaje) return;
    
    // Enviar mensaje al servidor
    socket.emit('nuevo_mensaje_sala', { mensaje });
    
    // Limpiar el input después de enviar
    inputChat.value = '';
  }
  
  function mostrarHistorial(mensajes) {
    if (!chatMensajes) return;
    
    // Limpiar mensajes existentes
    chatMensajes.innerHTML = '';
    
    if (!mensajes || mensajes.length === 0) {
      // No hay mensajes anteriores
      const noMensajes = document.createElement('div');
      noMensajes.className = 'no-mensajes';
      noMensajes.innerHTML = `
        <i class="bi bi-chat-dots"></i>
        <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
      `;
      chatMensajes.appendChild(noMensajes);
      return;
    }
    
    // Mostrar cada mensaje del historial
    mensajes.forEach(msg => agregarMensaje(msg, false));
    
    // Hacer scroll al último mensaje
    scrollAlFinal();
  }
  
  function agregarMensaje(msg, conAnimacion = true) {
    if (!chatMensajes) return;
    
    // Crear el elemento del mensaje
    const divMensaje = document.createElement('div');
    divMensaje.className = 'mensaje-sala';
    
    // Formatear la fecha
    const fecha = new Date(msg.fecha);
    const horaFormateada = fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Avatar del usuario (con fallback a imagen por defecto)
    const avatarSrc = msg.avatar || '/images/default-avatar.png';
    
    // Estructura HTML del mensaje
    divMensaje.innerHTML = `
      <img src="${avatarSrc}" alt="Avatar de ${msg.username}" class="mensaje-sala-avatar">
      <div class="mensaje-sala-contenido">
        <div class="mensaje-sala-cabecera">
          <span class="mensaje-sala-usuario">${msg.username}</span>
          <span class="mensaje-sala-hora">${horaFormateada}</span>
        </div>
        <div class="mensaje-sala-texto">${msg.mensaje}</div>
      </div>
    `;
    
    // Agregar animación de entrada si es un mensaje nuevo
    if (conAnimacion) {
      divMensaje.style.opacity = '0';
      divMensaje.style.transform = 'translateY(10px)';
      divMensaje.style.transition = 'opacity 0.3s, transform 0.3s';
    }
    
    // Añadir el mensaje al chat
    chatMensajes.appendChild(divMensaje);
    
    // Activar la animación después de añadir al DOM
    if (conAnimacion) {
      setTimeout(() => {
        divMensaje.style.opacity = '1';
        divMensaje.style.transform = 'translateY(0)';
      }, 10);
    }
    
    // Hacer scroll al final
    scrollAlFinal();
  }
  
  function scrollAlFinal() {
    if (chatMensajes) {
      chatMensajes.scrollTop = chatMensajes.scrollHeight;
    }
  }
});
