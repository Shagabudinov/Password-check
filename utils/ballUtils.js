// Функция создания нового шарика
// background – элемент контейнера фоновых шариков,
// balls – массив, в который добавляется новый объект шарика.
export function createBall(x, y, background, balls) {
  const ballElem = document.createElement('div');
  ballElem.className = 'moving-ball';
  const radius = 5; // Радиус шарика 5px
  const initialX = x - radius;
  const initialY = y - radius;
  ballElem.style.left = initialX + 'px';
  ballElem.style.top = initialY + 'px';
  background.appendChild(ballElem);

  // Задаём случайное направление и скорость
  const speed = Math.random() * 1 + 0.5;
  const angle = Math.random() * 2 * Math.PI;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  const ball = {
    x: initialX,
    y: initialY,
    vx: vx,
    vy: vy,
    radius: radius,
    element: ballElem,
  };
  balls.push(ball);
}

// Функция анимации шариков
export function updateBalls(balls, background) {
  balls.forEach((ball) => {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Отскок от левой и правой границ
    if (ball.x <= 0) {
      ball.x = 0;
      ball.vx = -ball.vx;
    }
    if (ball.x + ball.radius * 2 >= window.innerWidth) {
      ball.x = window.innerWidth - ball.radius * 2;
      ball.vx = -ball.vx;
    }

    // Отскок от верхней и нижней границ
    if (ball.y <= 0) {
      ball.y = 0;
      ball.vy = -ball.vy;
    }
    if (ball.y + ball.radius * 2 >= window.innerHeight) {
      ball.y = window.innerHeight - ball.radius * 2;
      ball.vy = -ball.vy;
    }

    ball.element.style.left = ball.x + 'px';
    ball.element.style.top = ball.y + 'px';
  });
  requestAnimationFrame(() => updateBalls(balls, background));
}
