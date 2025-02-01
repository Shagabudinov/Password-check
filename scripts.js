document.addEventListener('DOMContentLoaded', function () {
  /*** Функционал проверки пароля (без изменений) ***/
  const passwordInput = document.getElementById('passwordInput');
  const gpuSelect = document.getElementById('gpuSelect');
  const algoSelect = document.getElementById('algoSelect');
  const strengthFill = document.getElementById('strengthFill');
  const crackTimeEl = document.getElementById('crackTime');

  passwordInput.addEventListener('input', updateMetrics);
  gpuSelect.addEventListener('change', function () {
    gpuSelect.classList.add('animate');
    setTimeout(() => gpuSelect.classList.remove('animate'), 300);
    updateMetrics();
  });
  algoSelect.addEventListener('change', function () {
    algoSelect.classList.add('animate');
    setTimeout(() => algoSelect.classList.remove('animate'), 300);
    updateMetrics();
  });

  function updateMetrics() {
    const password = passwordInput.value;
    const gpu = gpuSelect.value;
    const algo = algoSelect.value;

    const score = evaluatePassword(password);
    strengthFill.style.width = score + '%';

    const time = calculateCrackTime(password, gpu, algo);
    const formattedTime = formatTime(time);
    crackTimeEl.textContent = 'Время взлома: ' + formattedTime;

    crackTimeEl.classList.add('animate');
    setTimeout(() => crackTimeEl.classList.remove('animate'), 500);
  }

  function evaluatePassword(password) {
    let score = 0;
    const length = password.length;
    score += Math.min(50, length * 5);
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;
    return Math.min(100, score);
  }

  function calculateCrackTime(password, gpu, algo) {
    if (password.length === 0) return 0;

    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(password)) pool += 32;

    if (pool === 0) return 0;

    const logCombinations = password.length * Math.log10(pool);
    const logAvgAttempts = logCombinations + Math.log10(0.5);

    let hashRate;
    if (algo.toLowerCase() === 'md5') {
      hashRate = gpu === '4060' ? 10e9 : 20e9;
    } else {
      hashRate = gpu === '4060' ? 1e9 : 2e9;
    }

    const logHashRate = Math.log10(hashRate);
    const logTime = logAvgAttempts - logHashRate;

    if (logTime > 20) return Infinity;

    const timeInSeconds = Math.pow(10, logTime);
    return timeInSeconds;
  }

  function formatTime(seconds) {
    if (seconds === 0) return 'Немедленно';
    if (seconds === Infinity) return 'Практически невозможно';
    if (seconds < 1) return 'менее секунды';

    const intervals = [
      { label: 'год', seconds: 31536000 },
      { label: 'день', seconds: 86400 },
      { label: 'час', seconds: 3600 },
      { label: 'минута', seconds: 60 },
      { label: 'секунда', seconds: 1 },
    ];

    let remaining = seconds;
    let result = '';
    let unitsCount = 0;
    for (let i = 0; i < intervals.length && unitsCount < 2; i++) {
      const interval = intervals[i];
      if (remaining >= interval.seconds) {
        const count = Math.floor(remaining / interval.seconds);
        remaining %= interval.seconds;
        result += count + ' ' + pluralize(interval.label, count) + ' ';
        unitsCount++;
      }
    }
    return result.trim();
  }

  function pluralize(word, count) {
    if (word === 'секунда') {
      if (count % 10 === 1 && count % 100 !== 11) return 'секунда';
      else if (
        [2, 3, 4].includes(count % 10) &&
        ![12, 13, 14].includes(count % 100)
      )
        return 'секунды';
      else return 'секунд';
    }
    if (word === 'минута') {
      if (count % 10 === 1 && count % 100 !== 11) return 'минута';
      else if (
        [2, 3, 4].includes(count % 10) &&
        ![12, 13, 14].includes(count % 100)
      )
        return 'минуты';
      else return 'минут';
    }
    if (word === 'час') {
      if (count % 10 === 1 && count % 100 !== 11) return 'час';
      else if (
        [2, 3, 4].includes(count % 10) &&
        ![12, 13, 14].includes(count % 100)
      )
        return 'часа';
      else return 'часов';
    }
    if (word === 'день') {
      if (count % 10 === 1 && count % 100 !== 11) return 'день';
      else if (
        [2, 3, 4].includes(count % 10) &&
        ![12, 13, 14].includes(count % 100)
      )
        return 'дня';
      else return 'дней';
    }
    if (word === 'год') {
      if (count % 10 === 1 && count % 100 !== 11) return 'год';
      else if (
        [2, 3, 4].includes(count % 10) &&
        ![12, 13, 14].includes(count % 100)
      )
        return 'года';
      else return 'лет';
    }
    return word;
  }

  /*** Новый функционал для фоновых движущихся шариков ***/
  const balls = [];
  const background = document.getElementById('background-dots');

  // Функция создания нового движущегося шарика.
  // Если координаты (x, y) не заданы – можно использовать случайную позицию.
  function createBall(x, y) {
    const ballElem = document.createElement('div');
    ballElem.className = 'moving-ball';
    const radius = 5; // Радиус 5px
    // Чтобы центр шарика совпадал с заданной точкой, смещаем координаты на радиус
    const initialX = x - radius;
    const initialY = y - radius;
    ballElem.style.left = initialX + 'px';
    ballElem.style.top = initialY + 'px';
    background.appendChild(ballElem);

    // Задаём случайное направление и небольшую скорость (от 0.5 до 1.5 px за кадр)
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

  // Создаём изначальный шарик в случайной позиции
  const numberOfBalls = 33; // количество шаров

  for (let i = 0; i < numberOfBalls; i++) {
    const randomX = Math.random() * (window.innerWidth - 10) + 5;
    const randomY = Math.random() * (window.innerHeight - 10) + 5;
    createBall(randomX, randomY);
  }


  // Функция анимации движения шариков
  function updateBalls() {
    balls.forEach((ball) => {
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Отскок от левой и правой границы
      if (ball.x <= 0) {
        ball.x = 0;
        ball.vx = -ball.vx;
      }
      if (ball.x + ball.radius * 2 >= window.innerWidth) {
        ball.x = window.innerWidth - ball.radius * 2;
        ball.vx = -ball.vx;
      }

      // Отскок от верхней и нижней границы
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
    requestAnimationFrame(updateBalls);
  }
  updateBalls();

  // При наведении курсора по фону – создаём временный hover-шарик.
  // Для уменьшения количества создаваемых элементов применяем троттлинг (не чаще одного на 100 мс).
  let lastHoverTime = 0;
  document.addEventListener('mousemove', function (e) {
    // Если курсор над формой – не создавать эффект
    if (e.target.closest('.container')) return;

    const now = Date.now();
    if (now - lastHoverTime < 100) return;
    lastHoverTime = now;

    const hoverDot = document.createElement('div');
    hoverDot.className = 'hover-dot';
    hoverDot.style.left = e.clientX + 'px';
    hoverDot.style.top = e.clientY + 'px';
    background.appendChild(hoverDot);
    // Удаляем hover-шарик по окончании анимации (~0.5 сек)
    setTimeout(() => hoverDot.remove(), 500);
  });

  // При клике (лкм) по фону (если клик не на форме) – создаём новый движущийся шарик в точке клика.
  document.addEventListener('click', function (e) {
    if (e.target.closest('.container')) return;
    createBall(e.clientX, e.clientY);
  });
});
