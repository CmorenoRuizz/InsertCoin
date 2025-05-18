const instrucciones = {
    tetris: `
      <h6 class="font-arcade">Tetris</h6>
      <p><strong>⬅️ ➡️ Flechas izquierda/derecha:</strong> Mover piezas</p>
      <p><strong>⬇️ Flecha abajo:</strong> Acelerar caída</p>
      <p><strong>⬆️ Flecha arriba:</strong> Girar pieza</p>
      <p><strong>Espacio:</strong> Caída instantánea</p>
    `,
    snake: `
      <h6 class="font-arcade">Snake</h6>
      <p><strong>⬅️⬆️⬇️➡️ Flechas:</strong> Mover la serpiente</p>
      <p>Come monedas, evita chocar contigo mismo y contra el muro. ¡Cada moneda te hace más largo!</p>
    `,
    flappybird: `
      <h6 class="font-arcade">Flappy Bird</h6>
      <p><strong>Clic izquierdo:</strong> Saltar</p>
      <p>Evita los obstáculos y llega lo más lejos posible. Un clic = salto.</p>
    `
  };

  document.querySelectorAll('.btn-instrucciones').forEach(boton => {
    boton.addEventListener('click', () => {
      const juego = boton.getAttribute('data-juego');
      const contenido = instrucciones[juego] || '<p>No hay instrucciones disponibles.</p>';

      document.getElementById('contenido-instrucciones').innerHTML = contenido;
      const modal = new bootstrap.Modal(document.getElementById('modalInstrucciones'));
      modal.show();
    });
  });