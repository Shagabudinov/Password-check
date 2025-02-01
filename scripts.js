import {
  evaluatePassword,
  calculateCrackTime,
  formatTime,
  checkPasswordPwned,
} from './utils/passwordUtils.js';

import { createBall, updateBalls } from './utils/ballUtils.js';

document.addEventListener('DOMContentLoaded', function () {
  /*** Элементы DOM ***/
  const passwordInput = document.getElementById('passwordInput');
  const gpuSelect = document.getElementById('gpuSelect');
  const algoSelect = document.getElementById('algoSelect');
  const strengthFill = document.getElementById('strengthFill');
  const crackTimeEl = document.getElementById('crackTime');
  const pwnedStatus = document.getElementById('pwnedStatus');
  const background = document.getElementById('background-dots');

  // Переменная для троттлинга проверки утечек
  let pwnedTimeout;

  /*** Обработчики событий для формы ***/
  passwordInput.addEventListener('input', updateMetrics);
  gpuSelect.addEventListener('change', () => {
    gpuSelect.classList.add('animate');
    setTimeout(() => gpuSelect.classList.remove('animate'), 300);
    updateMetrics();
  });
  algoSelect.addEventListener('change', () => {
    algoSelect.classList.add('animate');
    setTimeout(() => algoSelect.classList.remove('animate'), 300);
    updateMetrics();
  });

  // Функция обновления метрик пароля
  async function updateMetrics() {
    const password = passwordInput.value;
    const gpu = gpuSelect.value;
    const algo = algoSelect.value;

    // Обновляем индикатор силы и время взлома
    const score = evaluatePassword(password);
    strengthFill.style.width = score + '%';

    const time = calculateCrackTime(password, gpu, algo);
    const formattedTime = formatTime(time);
    console.log(formattedTime);
    crackTimeEl.textContent = 'Время взлома: ' + formattedTime;

    crackTimeEl.classList.add('animate');
    setTimeout(() => crackTimeEl.classList.remove('animate'), 500);

    // Дебаунс для проверки утечек
    clearTimeout(pwnedTimeout);
    if (!password) {
      pwnedStatus.textContent = 'Проверка утечек: ...';
      pwnedStatus.style.color = '#0ff';
      return;
    }
    pwnedTimeout = setTimeout(async () => {
      try {
        const leakCount = await checkPasswordPwned(password);
        pwnedStatus.classList.add('animate');
        if (leakCount > 0) {
          pwnedStatus.textContent = `Пароль найден в утечках ${leakCount} раз(а)!`;
          pwnedStatus.style.color = 'red';
        } else {
          pwnedStatus.textContent = 'Пароль не обнаружен в известных утечках.';
          pwnedStatus.style.color = '#0ff';
        }
      } catch (error) {
        pwnedStatus.textContent = 'Ошибка проверки утечек';
        console.error('Ошибка проверки утечек:', error);
      }
    }, 500);

    setTimeout(() => pwnedStatus.classList.remove('animate'), 500);
  }

  /*** Инициализация фоновых шариков ***/
  const balls = [];
  const numberOfBalls = 33;
  for (let i = 0; i < numberOfBalls; i++) {
    const randomX = Math.random() * (window.innerWidth - 10) + 5;
    const randomY = Math.random() * (window.innerHeight - 10) + 5;
    createBall(randomX, randomY, background, balls);
  }
  updateBalls(balls, background);

  // Эффект hover-шарика при движении курсора по фону (если не над формой)
  let lastHoverTime = 0;
  document.addEventListener('mousemove', function (e) {
    if (e.target.closest('.container')) return;
    const now = Date.now();
    if (now - lastHoverTime < 100) return;
    lastHoverTime = now;
    const hoverDot = document.createElement('div');
    hoverDot.className = 'hover-dot';
    hoverDot.style.left = e.clientX + 'px';
    hoverDot.style.top = e.clientY + 'px';
    background.appendChild(hoverDot);
    setTimeout(() => hoverDot.remove(), 500);
  });

  // При клике по фону (если клик не на форме) добавляем новый шарик
  document.addEventListener('click', function (e) {
    if (e.target.closest('.container')) return;
    createBall(e.clientX, e.clientY, background, balls);
  });
});

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('fade-out');
    loader.addEventListener('transitionend', () => {
      loader.remove();
    });
  }, 1000);
});


