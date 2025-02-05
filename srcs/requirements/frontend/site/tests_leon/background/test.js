const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Couches d'étoiles pour le parallax
const layers = [
  { numStars: 20 * (canvas.width / 1440), speed: 0.3, maxRadius: 1 },  
  { numStars: 40 * (canvas.width / 1440), speed: 0.2, maxRadius: 2 },  
  { numStars: 50 * (canvas.width / 1440), speed: 0.1, maxRadius: 3 }  
];

let stars = [];
let shootingStars = [];
let planet = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: 10, angle: 0 };

// Générer les étoiles
layers.forEach(layer => {
  for (let i = 0; i < layer.numStars; i++) {
    stars.push({
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
		radius: Math.random() * layer.maxRadius + 0.5,
		speed: layer.speed,
		opacity: Math.random(),
		flickerSpeed: 0.1 * (Math.random() > 0.9 ? 1 : 0)
    });
  }
});

// Fonction pour ajouter une étoile filante
function createShootingStar() {
	const star = {
	  x: Math.random() * canvas.width,
	  y: Math.random() * (canvas.height / 2),
	  length: Math.random() * 100 + 50,
	  speedX: Math.random() * 4 + 6,
	  opacity: 1
	};
	star.speedY = star.speedX / 2;
	shootingStars.push(star);
  
	setTimeout(() => {
	  shootingStars.shift();
	}, 2000);
}

// Fonction pour dessiner la planète en mouvement
function drawPlanet() {
  ctx.fillStyle = "rgb(252, 31, 186)"
  ctx.beginPath();
  ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
  ctx.fill();

  // Mise à jour de la position en courbes
  planet.angle += 0.02; // Modifier cette valeur pour des mouvements plus amples ou plus serrés
  planet.x += Math.cos(planet.angle) * 2;  // Déplacement horizontal sinusoïdal
  planet.y += Math.sin(planet.angle * 2) * 1.5; // Déplacement vertical

  // Faire reboucler la planète si elle sort de l'écran
  if (planet.x > canvas.width + planet.radius) planet.x = -planet.radius;
  if (planet.y > canvas.height + planet.radius) planet.y = -planet.radius;
}

// Animation des étoiles et de la planète
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner les étoiles fixes
  stars.forEach(star => {
    star.opacity += star.flickerSpeed * (Math.random() > 0.5 ? 1 : -1);
    star.opacity = Math.max(0.3, Math.min(1, star.opacity));

    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();

    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });

  // Dessiner les étoiles filantes
  shootingStars.forEach(star => {
    ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(star.x - star.length, star.y - star.length / 2);
    ctx.stroke();

    star.x += star.speedX;
    star.y += star.speedY;
    star.opacity -= 0.01;
  });

  // Dessiner la petite planète animée
  drawPlanet();

  requestAnimationFrame(drawScene);
}

// Générer une étoile filante de manière aléatoire
setInterval(() => {
	if (Math.random() > 0.7) createShootingStar();
}, 2000);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

drawScene();
