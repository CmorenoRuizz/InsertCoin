gsap.registerPlugin(TextPlugin);

document.addEventListener('DOMContentLoaded', function() {
  // Animación del logo
  gsap.from(".auth-logo img", {
    duration: 1,
    scale: 0,
    ease: "back.out(1.7)"
  });

  // Animación del formulario
  gsap.from(".auth-form-container", {
    duration: 0.8,
    opacity: 0,
    y: 30,
    delay: 0.3
  });

  // Texto rotativo para login
  const loginMensajes = [
    "¡Bienvenido a InsertCoin!",
    "Tu diversión está a un click",
    "Juega, compite, gana"
  ];

  // Texto rotativo para registro
  const registerMensajes = [
    "¡Únete a InsertCoin!",
    "Regístrate y empieza a jugar",
    "Crea tu cuenta y diviértete"
  ];

  const mensajeElement = document.getElementById("auth-mensaje-animado");
  
  // Determinar qué conjunto de mensajes usar basado en la página actual
  const mensajes = window.location.pathname.includes('register') ? registerMensajes : loginMensajes;
  
  if (mensajeElement) {
    const tl = gsap.timeline({ repeat: -1 });

    mensajes.forEach((mensaje, i) => {
      tl.to(mensajeElement, {
        duration: 2,
        text: mensaje,
        ease: "none",
        delay: i === 0 ? 1 : 1.5
      });
    });

    tl.to(mensajeElement, {
      duration: 1,
      text: "",
      ease: "none",
      delay: 1
    });
  }
});
