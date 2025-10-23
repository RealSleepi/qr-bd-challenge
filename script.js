const hashedAnswer =
  '5891562f84bae567ec51dad9e4ce4333d4e297c2e01560c4ac2d14ac2ec1820b63b4af49426f753353fe14c8839361ea1da53cfefde133b69ac92db41a1a1bfb';

const codeInput = document.getElementById('codeInput');
const revealButton = document.getElementById('revealButton');
const feedback = document.getElementById('feedback');
const celebration = document.getElementById('celebration');
const confettiContainer = celebration.querySelector('.confetti');
const prizeElement = celebration.querySelector('.prize');

const encryptedPrize = {
  iv: 'HwHkrw2P8+8FhJQI',
  data:
    'RdwZ8BTIl5YBpetNgbdYKmTtnLFXgoaPsMSV/MSlqkxjK0Hr4OBGVLZM1c+idLryp3GC7ZtZZG793s/OHwAsmqDF8jj7neZh06i1mS9da42tKsTjIh+6YdngAFCIl7BTg0ocsRawlvM='
};
const prizeKeySeed = hashedAnswer.slice(0, 64);

const confettiPalette = [
  '#ff7a85',
  '#ffd166',
  '#9c5cf7',
  '#5c6ac4',
  '#2ec4b6',
  '#ff9f1c'
];

const hasSubtleCrypto =
  typeof window !== 'undefined' &&
  typeof window.crypto !== 'undefined' &&
  typeof window.crypto.subtle !== 'undefined';

revealButton.addEventListener('click', () => {
  verifyCode().catch(() => {
    showMessage('Something went wrong. Please try again.', true);
  });
});

codeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    revealButton.click();
  }
});

if (!hasSubtleCrypto) {
  showMessage('This browser cannot verify the code. Try a modern browser.', true);
  codeInput.disabled = true;
  revealButton.disabled = true;
}

async function verifyCode() {
  const rawInput = codeInput.value.trim();
  if (!rawInput) {
    showMessage('Enter the code from your QR clue to continue.', true);
    return;
  }

  const normalized = rawInput.toUpperCase();
  if (!hasSubtleCrypto) {
    return;
  }

  const hashed = await sha512(normalized);

  if (hashed === hashedAnswer) {
    await celebrate();
  } else {
    showMessage('That code is not quite right. Keep trying!', true);
  }
}

async function sha512(message) {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest('SHA-512', data);
  return bufferToHex(digest);
}

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function showMessage(text, isError = false) {
  feedback.textContent = text;
  feedback.style.color = isError ? '#e12d39' : '#1f2933';
}

async function celebrate() {
  document.body.classList.add('success');
  showMessage('');
  codeInput.disabled = true;
  revealButton.disabled = true;
  celebration.setAttribute('aria-hidden', 'false');
  celebration.classList.add('visible');
  await revealPrize();
  launchConfetti();
}

function launchConfetti() {
  confettiContainer.innerHTML = '';
  const totalPieces = 320;

  for (let i = 0; i < totalPieces; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.backgroundColor = confettiPalette[i % confettiPalette.length];
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${12 + Math.random() * 10}px`;

    const angle = Math.random() * Math.PI * 2;
    const distance = 18 + Math.random() * 34;

    piece.style.setProperty('--translate-x', `${Math.cos(angle) * distance}vmax`);
    piece.style.setProperty('--translate-y', `${Math.sin(angle) * distance}vmax`);
    piece.style.setProperty('--scale', `${0.8 + Math.random() * 0.7}`);
    piece.style.setProperty('--spin', `${Math.random() * 1440 - 720}deg`);
    piece.style.setProperty('--duration', `${0.45 + Math.random() * 0.4}s`);
    piece.style.animationDelay = `${Math.random() * 0.12}s`;

    confettiContainer.appendChild(piece);
  }
}

async function revealPrize() {
  if (!hasSubtleCrypto) {
    prizeElement.textContent = 'Your surprise is unlocked!';
    return;
  }

  try {
    const key = await importPrizeKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(encryptedPrize.iv) },
      key,
      base64ToBytes(encryptedPrize.data)
    );
    const message = new TextDecoder().decode(decrypted);
    prizeElement.textContent = message;
  } catch (error) {
    prizeElement.textContent = 'Your surprise is unlocked!';
  }
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importPrizeKey() {
  const keyData = hexToBytes(prizeKeySeed);
  return crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['decrypt']);
}

function hexToBytes(hex) {
  const cleaned = hex.trim();
  if (cleaned.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const array = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < array.length; i += 1) {
    array[i] = parseInt(cleaned.substr(i * 2, 2), 16);
  }
  return array;
}
