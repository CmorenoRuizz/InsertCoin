document.addEventListener('DOMContentLoaded', function() {
  // Registrar plugins
  gsap.registerPlugin(Observer);
  
  // Referencias a elementos
  const scrollArrowUp = document.getElementById('scroll-arrow-up');
  const scrollArrowDown = document.getElementById('scroll-arrow-down');
  
  // Función para ajustar alturas del contenedor principal
  function ajustarAlturas() {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const main = document.querySelector('#main-juegos');
    
    if (!header || !footer || !main) return;
    
    const headerHeight = header.offsetHeight;
    const footerHeight = footer.offsetHeight;
    const windowHeight = window.innerHeight;
    const mainHeight = windowHeight - headerHeight - footerHeight;
    
    // Establecer variables CSS para usar en los cálculos
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    
    // Asegurar que el contenedor principal tenga la altura correcta
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

  // Inicializamos las variables para el scroll
  let sections = document.querySelectorAll(".juego-section"),
      images = document.querySelectorAll(".bg"),
      headings = gsap.utils.toArray(".section-heading"),
      outerWrappers = gsap.utils.toArray(".outer"),
      innerWrappers = gsap.utils.toArray(".inner"),
      splitHeadings = [],
      currentIndex = -1,
      wrap = gsap.utils.wrap(0, sections.length),
      animating;

// Inicialización de SplitText
  try {
    // Solo usar SplitText si está disponible
    if (window.SplitText || gsap.SplitText) {
      const SplitTextPlugin = window.SplitText || gsap.SplitText;
      splitHeadings = headings.map(h => new SplitTextPlugin(h, { type: "chars", linesClass: "clip-text" }));
    } else {
      console.warn("SplitText plugin not available, using fallback");
      splitHeadings = headings.map(() => ({ chars: [] }));
    }
  } catch (e) {
    console.error("Error initializing SplitText:", e);
    splitHeadings = headings.map(() => ({ chars: [] }));
  }

  // Configuración inicial
  gsap.set(sections, { autoAlpha: 0 }); // Ocultar todas las secciones inicialmente
  gsap.set(outerWrappers, { yPercent: 100 });
  gsap.set(innerWrappers, { yPercent: -100 });

function gotoSection(index, direction) {
  index = wrap(index);
  animating = true;

  let fromTop = direction === -1,
      dFactor = fromTop ? -1 : 1;

  let tl = gsap.timeline({
    defaults: { duration: 1, ease: "power2.inOut" },
    onComplete: () => {
      animating = false;
      // Actualizar el estado de las flechas
      toggleScrollArrows(index);
    }
  });

  if (currentIndex >= 0) {
    gsap.set(sections[currentIndex], { zIndex: 0 });
    tl.to(images[currentIndex], { yPercent: -15 * dFactor })
      .set(sections[currentIndex], { autoAlpha: 0 });
  }

  gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });

  tl.fromTo([outerWrappers[index], innerWrappers[index]], 
    { yPercent: i => i ? -100 * dFactor : 100 * dFactor }, 
    { yPercent: 0 }, 0)
    .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
  // Animar los caracteres solo si Split Text está disponible
    .fromTo(splitHeadings[index]?.chars || [], {
      autoAlpha: 0, yPercent: 150 * dFactor
    }, {
      autoAlpha: 1,
      yPercent: 0,
      duration: 1,
      ease: "power2.out",
      stagger: 0.015
    }, 0.2);

  currentIndex = index;
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

  // Event listeners para el clic en las flechas
  scrollArrowDown.addEventListener('click', () => {
    if (!animating && currentIndex < sections.length - 1) {
      gotoSection(currentIndex + 1, 1);
    }
  });
  
  scrollArrowUp.addEventListener('click', () => {
    if (!animating && currentIndex > 0) {
      gotoSection(currentIndex - 1, -1);
    }
  });

  Observer.create({
    type: "wheel,touch,pointer",
    wheelSpeed: -1,
    onDown: () => {
      if (!animating && currentIndex > 0) {
        gotoSection(currentIndex - 1, -1);
      }
    },
    onUp: () => {
      if (!animating && currentIndex < sections.length - 1) {
        gotoSection(currentIndex + 1, 1);
      }
    },
    tolerance: 10,
    preventDefault: true,
    target: document.querySelector('#main-juegos')
  });

  // Teclas de navegación (opcional)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && !animating && currentIndex < sections.length - 1) {
      gotoSection(currentIndex + 1, 1);
    } else if (e.key === 'ArrowUp' && !animating && currentIndex > 0) {
      gotoSection(currentIndex - 1, -1);
    }
  });

  // Iniciar con la primera sección después de un breve retraso para asegurar que todo está cargado
  setTimeout(() => {
    gotoSection(0, 1);
  }, 100);
});