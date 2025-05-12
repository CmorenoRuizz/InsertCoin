gsap.registerPlugin(TextPlugin, Observer);

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

// Sistema de navegación por scroll
document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos
  const scrollArrowUp = document.getElementById('scroll-arrow-up');
  const scrollArrowDown = document.getElementById('scroll-arrow-down');
  
  // Función para establecer alturas correctas
  function ajustarAlturas() {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const main = document.querySelector('.scrollable-container');
    
    if (!header || !footer || !main) return;
    
    const headerHeight = header.offsetHeight;
    const footerHeight = footer.offsetHeight;
    const windowHeight = window.innerHeight;
    const mainHeight = windowHeight - headerHeight - footerHeight;
    
    // Establecer variables CSS para usar en los cálculos
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    
    // Asegurar que el contenedor principal y las secciones tengan la altura correcta
    main.style.height = `${mainHeight}px`;
  }
  
  // Ajustar alturas al cargar y al redimensionar
  ajustarAlturas();
  window.addEventListener('resize', ajustarAlturas);
  
  // Configurar la animación de las flechas
  gsap.to(scrollArrowDown, {
    y: 8,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    duration: 1
  });
  
  gsap.to(scrollArrowUp, {
    y: -8,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    duration: 1
  });
  
  // Event listeners para el clic en las flechas
  scrollArrowDown.addEventListener('click', () => {
    if (!isAnimating && currentSection < sections.length - 1) {
      showSection(currentSection + 1);
    }
  });
  
  scrollArrowUp.addEventListener('click', () => {
    if (!isAnimating && currentSection > 0) {
      showSection(currentSection - 1);
    }
  });
  
  // Seleccionar todas las secciones
  const sections = document.querySelectorAll('.scroll-section');

  // Asegurar que al cargar la página, la sección 1 sea "active"
  sections.forEach((section, index) => {
    if (index === 0) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  let currentSection = 0;
  let isAnimating = false;
  
  // Función para mostrar sección
  function showSection(index) {
    if (isAnimating || index < 0 || index >= sections.length) return;
    isAnimating = true;
    
    // Actualizar el estado de las flechas de scroll (visible/ocultas)
    toggleScrollArrows(index);
    
    // Ocultar sección actual
    gsap.to(sections[currentSection], {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        sections[currentSection].classList.remove('active');
        
        // Mostrar nueva sección
        currentSection = index;
        sections[currentSection].classList.add('active');
        gsap.to(sections[currentSection], {
          opacity: 1,
          duration: 0.5,
          onComplete: () => {
            isAnimating = false;
          }
        });
      }
    });
  }
  
  // Función para mostrar u ocultar las flechas según la sección actual
  function toggleScrollArrows(sectionIndex) {
    if (sectionIndex <= 0) {
      // Primera sección: solo flecha hacia abajo
      scrollArrowUp.classList.add('hidden');
      scrollArrowDown.classList.remove('hidden');
    } else if (sectionIndex >= sections.length - 1) {
      // Última sección: solo flecha hacia arriba
      scrollArrowUp.classList.remove('hidden');
      scrollArrowDown.classList.add('hidden');
    } else {
      // Secciones intermedias: ambas flechas
      scrollArrowUp.classList.remove('hidden');
      scrollArrowDown.classList.remove('hidden');
    }
  }
    // Inicializar estado de las flechas
  toggleScrollArrows(currentSection);
  
  // Configurar el Observer para la detección de scroll
  Observer.create({
    type: "wheel,touch,scroll,pointer",
    wheelSpeed: 1,
    onDown: () => {
      if (!isAnimating && currentSection < sections.length - 1) {
        showSection(currentSection + 1);
      }
    },
    onUp: () => {
      if (!isAnimating && currentSection > 0) {
        showSection(currentSection - 1);
      }
    },
    tolerance: 10,
    preventDefault: true
  });
  
  // Teclas de navegación (opcional)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
      showSection(currentSection + 1);
    } else if (e.key === 'ArrowUp' && currentSection > 0) {
      showSection(currentSection - 1);
    }
  });
});

