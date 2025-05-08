gsap.registerPlugin(TextPlugin);

// Logo
gsap.from("#logo-animado", {
  duration: 1,
  scale: 0,
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

// Texto rotativo
const frases = [
  "Tú pones las reglas",
  "Tú marcas el límite",
  "Logra ser el número uno",
];

const mensaje = document.getElementById("mensaje-animado");
const tl = gsap.timeline({ repeat: -1 });

frases.forEach((frase, i) => {
  tl.to(mensaje, {
    duration: 2,
    text: frase,
    ease: "none",
    delay: i === 0 ? 1 : 1.5
  });
});

tl.to(mensaje, {
  duration: 1,
  text: "",
  ease: "none",
  delay: 1
});
