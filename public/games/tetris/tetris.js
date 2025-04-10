let score = 0;
const scoreText = document.getElementById('score');

const config = {
  type: Phaser.AUTO,
  width: 240,
  height: 400,
  backgroundColor: '#222',
  parent: document.body,
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {}

function create() {
  // Cubo que cae (simulación simple para demo)
  this.block = this.add.rectangle(120, 0, 40, 40, 0xffffff);
  this.speed = 100;
  this.lastTime = 0;

  this.input.keyboard.on('keydown-SPACE', () => {
    score += 100;
    scoreText.textContent = `Puntuación: ${score}`;
  });

  // Temporizador de 10 segundos
    this.time.delayedCall(10000, () => {
    this.scene.pause(); // Pausa el juego
    guardarPuntuacion(score); // Llama al guardado
    alert(`Fin de la partida\nPuntuación final: ${score}`);
  });
  
}

function update(time) {
  if (time - this.lastTime > this.speed) {
    this.block.y += 10;
    this.lastTime = time;
    if (this.block.y >= 380) {
      this.block.y = 0;
      score += 10;
      scoreText.textContent = `Puntuación: ${score}`;
    }
  }
}

function guardarPuntuacion(score) {
    fetch('/guardar-puntuacion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        juego: 'tetris',
        puntuacion: score
      })
    }).then(res => {
      if (res.ok) {
        console.log('Puntuación guardada con éxito');
      } else {
        console.error('Error al guardar puntuación');
      }
    });
  }