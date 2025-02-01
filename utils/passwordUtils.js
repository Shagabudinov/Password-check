// Функция оценки силы пароля
export function evaluatePassword(password) {
  let score = 0;
  const length = password.length;
  score += Math.min(50, length * 5);
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;
  return Math.min(100, score);
}

// Функция расчёта времени взлома
export function calculateCrackTime(password, gpu, algo) {
  if (password.length === 0) return 0;

  // Определяем размер пула символов
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
  if (pool === 0) return 0;

  const logCombinations = password.length * Math.log10(pool);
  const logAvgAttempts = logCombinations + Math.log10(0.5);

  const gpuRates = {
    4090: {
      md5: 20e9, // 20 миллиардов хэшей в секунду для MD5
      sha1: 2e9, // 2 млрд для SHA-1
      sha256: 0.2e9, // 200 млн для SHA-256
      bcrypt: 2e6, // 2 млн для Bcrypt
    },
    4060: {
      md5: 10e9,
      sha1: 1e9,
      sha256: 0.1e9,
      bcrypt: 1e6,
    },
    3060: {
      md5: 7e9,
      sha1: 0.7e9,
      sha256: 0.07e9,
      bcrypt: 700e3,
    },
    2060: {
      md5: 3e9,
      sha1: 300e6,
      sha256: 30e6,
      bcrypt: 300e3,
    },
    1050: {
      md5: 1e9,
      sha1: 100e6,
      sha256: 10e6,
      bcrypt: 100e3,
    },
  };

  const selectedRates = gpuRates[gpu];
  const rate = selectedRates ? selectedRates[algo.toLowerCase()] : undefined;
  const hashRate = rate || 1e9;

  const logHashRate = Math.log10(hashRate);
  const logTime = logAvgAttempts - logHashRate;

  if (logTime > 20) return Infinity;

  return Math.pow(10, logTime);
}


// Функция форматирования времени
export function formatTime(seconds) {
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

// Функция склонения единиц измерения времени
export function pluralize(word, count) {
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

// Вычисление SHA-1 с использованием Web Crypto API
export async function sha1(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

// Проверка пароля через Pwned Passwords API
export async function checkPasswordPwned(password) {
  const sha1Hash = await sha1(password);
  const prefix = sha1Hash.substring(0, 5);
  const suffix = sha1Hash.substring(5);
  const url = `https://api.pwnedpasswords.com/range/${prefix}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка обращения к API: статус ${response.status}`);
  }
  const text = await response.text();
  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    const [hashSuffix, count] = line.split(':');
    if (hashSuffix === suffix) return parseInt(count, 10);
  }
  return 0;
}
