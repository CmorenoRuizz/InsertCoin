gsap.registerPlugin(TextPlugin);

// Logo
gsap.from("#logo-animado", {
  duration: 1,
  scale: 0,
  rotation: 180,
  ease: "back.out(1.7)"
});

// Título
gsap.from("#titulo-animado", {
  duration: 1.2,
  y: -100,
  opacity: 0,
  ease: "bounce.out",
  delay: 0.3
});

// Subtítulo
gsap.from("#subtitulo", {
  duration: 1,
  y: 30,
  opacity: 0,
  delay: 1
});

// Texto rotativo (ahora bien grande y fluido)
const frasesUsuario = [
  "¡Prepárate para jugar!",
  "¡Sube en el ranking!",
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
