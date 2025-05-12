gsap.registerPlugin(TextPlugin);

// Logo
gsap.from("#logo-animado", {
  duration: 0.8,
  scale: 0,
  ease: "back.out(1.7)"
});

// Título
gsap.from("#titulo-animado", {
  duration: 1,
  y: -80,
  opacity: 0,
  ease: "bounce.out",
  delay: 0.2
});

// Subtítulo personalizado
gsap.from("#subtitulo", {
  duration: 1,
  y: 20,
  opacity: 0,
  delay: 0.8
});

// Mensaje motivacional
const frasesUsuario = [
  "Prepárate para jugar",
  "Sube en el ranking",
  "¡Conquista InsertCoin!"
];

const mensajeUser = document.getElementById("mensaje-animado");
const tlUser = gsap.timeline({ repeat: -1 });

frasesUsuario.forEach((frase, i) => {
  tlUser.to(mensajeUser, {
    duration: 2,
    text: frase,
    ease: "none",
    delay: i === 0 ? 1 : 1.5
  });
});

tlUser.to(mensajeUser, {
  duration: 1,
  text: "",
  ease: "none",
  delay: 1
});
