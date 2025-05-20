gsap.registerPlugin(TextPlugin);

document.addEventListener('DOMContentLoaded', function() {
  gsap.from(".contact-image img", {
    duration: 1,
    scale: 0,
    ease: "back.out(1.7)"
  });

  gsap.from(".contact-form-container", {
    duration: 0.8,
    opacity: 0,
    y: 30,
    delay: 0.3
  });

  const mensajes = [
    "¿Tienes alguna duda?",
    "Estamos aquí para ayudarte.",
    "Escríbenos tu mensaje"
  ];

  const mensajeElement = document.getElementById("contacto-mensaje-animado");

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
