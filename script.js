// Gravity Flip Nano – logique du jeu

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Dimensions du canvas
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Joueur
const player = {
  x: 60,
  width: 30,
  height: 30,
  isTop: false, // false = sol (bas), true = plafond (haut)
};

// Obstacle constants
const OBSTACLE_WIDTH = 40;
const GAP_HEIGHT = 150;

// Valeurs initiales pour la vitesse et l'intervalle d'apparition des obstacles.
const INITIAL_SPEED = 2.5;
const INITIAL_SPAWN_INTERVAL = 140;

// Variables de jeu modifiables au fil de la partie.
let speed = INITIAL_SPEED;
let spawnInterval = INITIAL_SPAWN_INTERVAL;

let obstacles = [];
let spawnTimer = 0;
// spawnInterval est défini dynamiquement ci-dessus et ajusté pendant la partie.
let score = 0;
let gameState = 'start';

// DOM éléments
const startOverlay = document.getElementById('start-overlay');
const endOverlay = document.getElementById('end-overlay');
const scoreSpan = document.getElementById('score');
const finalScoreSpan = document.getElementById('final-score');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const shareButton = document.getElementById('share-button');

// Démarrer le jeu
function startGame() {
  gameState = 'playing';
  score = 0;
  obstacles = [];
  player.isTop = false;
  spawnTimer = 0;
  // Réinitialiser la vitesse et l'intervalle d'apparition à leurs valeurs initiales
  speed = INITIAL_SPEED;
  spawnInterval = INITIAL_SPAWN_INTERVAL;
  scoreSpan.textContent = '0';
  hideOverlay(startOverlay);
  hideOverlay(endOverlay);
  requestAnimationFrame(gameLoop);
}

// Afficher un overlay
function showOverlay(el) {
  el.style.display = 'flex';
}

// Masquer un overlay
function hideOverlay(el) {
  el.style.display = 'none';
}

// Gestion du clic ou de la touche pour inverser la gravité
function flipGravity() {
  if (gameState !== 'playing') return;
  player.isTop = !player.isTop;
}

// Gérer la fin de partie
function endGame() {
  gameState = 'gameover';
  finalScoreSpan.textContent = score.toString();
  showOverlay(endOverlay);
}

// Partage du score sur Twitter
function shareScore() {
  const siteUrl = window.location.href;
  const tweet = `J'ai obtenu un score de ${score} à Gravity Flip Nano ! ⚡\nTestez vos réflexes sans téléchargement ici : ${siteUrl}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
  window.open(url, '_blank');
}

// Spawning d'un obstacle
function spawnObstacle() {
  // orientation : 0 = gap en haut (obstacle en bas), 1 = gap en bas (obstacle en haut)
  const orientation = Math.random() < 0.5 ? 0 : 1;
  obstacles.push({
    x: WIDTH + OBSTACLE_WIDTH,
    orientation: orientation,
    passed: false,
  });
}

// Mise à jour de la logique du jeu
function updateGame() {
  // Mettre à jour l'horloge et générer les obstacles
  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnObstacle();
    spawnTimer = 0;
  }

  // Mettre à jour la position des obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];
    obstacle.x -= speed;

    // Détecter le franchissement pour incrémenter le score
    if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < player.x) {
      obstacle.passed = true;
      score++;
      scoreSpan.textContent = score.toString();
      // Augmenter la difficulté à mesure que le joueur marque des points.
      // Toutes les 5 barres franchies, accélérer le déplacement et réduire l'intervalle d'apparition.
      if (score % 5 === 0) {
        // Augmenter légèrement la vitesse
        speed += 0.3;
        // Réduire l'intervalle d'apparition jusqu'à un minimum de 60 frames
        if (spawnInterval > 60) {
          spawnInterval -= 10;
        }
      }
    }

    // Supprimer les obstacles sortis de l'écran
    if (obstacle.x + OBSTACLE_WIDTH < 0) {
      obstacles.splice(i, 1);
      continue;
    }

    // Collision détection
    if (obstacle.x < player.x + player.width && obstacle.x + OBSTACLE_WIDTH > player.x) {
      if (obstacle.orientation === 0) {
        // Gap en haut (obstacle en bas)
        // Collide si joueur sur le bas
        if (!player.isTop) {
          // Collision si joueur en bas
          endGame();
          return;
        }
      } else {
        // Gap en bas (obstacle en haut)
        // Collide si joueur sur le haut
        if (player.isTop) {
          endGame();
          return;
        }
      }
    }
  }
}

// Rendu du jeu
function drawGame() {
  // Effacer le canvas
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Dessiner le joueur
  const playerY = player.isTop ? 0 : HEIGHT - player.height;
  ctx.fillStyle = '#f6b93b';
  ctx.fillRect(player.x, playerY, player.width, player.height);

  // Dessiner les obstacles
  ctx.fillStyle = '#4a69bd';
  obstacles.forEach(obstacle => {
    if (obstacle.orientation === 0) {
      // Gap en haut : dessiner obstacle en bas
      ctx.fillRect(obstacle.x, GAP_HEIGHT, OBSTACLE_WIDTH, HEIGHT - GAP_HEIGHT);
    } else {
      // Gap en bas : dessiner obstacle en haut
      ctx.fillRect(obstacle.x, 0, OBSTACLE_WIDTH, HEIGHT - GAP_HEIGHT);
    }
  });
}

// Boucle principale du jeu
function gameLoop() {
  if (gameState === 'playing') {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
  }
}

// Écouteurs d'événements
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
shareButton.addEventListener('click', shareScore);

// Inversion de la gravité sur clic/toucher ou touche espace
canvas.addEventListener('mousedown', flipGravity);
canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  flipGravity();
});
document.addEventListener('keydown', function(e) {
  if (e.code === 'Space') {
    flipGravity();
  }
});

// Afficher l'écran de démarrage au chargement
showOverlay(startOverlay);
