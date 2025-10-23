const hashedAnswer =
  '5891562f84bae567ec51dad9e4ce4333d4e297c2e01560c4ac2d14ac2ec1820b63b4af49426f753353fe14c8839361ea1da53cfefde133b69ac92db41a1a1bfb';

const codeInput = document.getElementById('codeInput');
const redeemButton = document.getElementById('redeemButton');
const feedback = document.getElementById('feedback');
const celebration = document.getElementById('celebration');
const confettiContainer = celebration.querySelector('.confetti');

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

redeemButton.addEventListener('click', () => {
  verifyCode().catch(() => {
    showMessage('Something went wrong. Please try again.', true);
  });
});

codeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    redeemButton.click();
  }
});

if (!hasSubtleCrypto) {
  showMessage('This browser cannot verify the code. Try a modern browser.', true);
  codeInput.disabled = true;
  redeemButton.disabled = true;
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
    celebrate();
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

function celebrate() {
  document.body.classList.add('success');
  showMessage('');
  codeInput.disabled = true;
  redeemButton.disabled = true;
  celebration.setAttribute('aria-hidden', 'false');
  celebration.classList.add('visible');
  launchConfetti();
}

function launchConfetti() {
  confettiContainer.innerHTML = '';
  const totalPieces = 160;

  for (let i = 0; i < totalPieces; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.backgroundColor = confettiPalette[i % confettiPalette.length];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 1.5}s`;
    piece.style.animationDuration = `${4 + Math.random() * 3}s`;
    piece.style.setProperty('--x-start', `${(Math.random() * 60 - 30).toFixed(2)}vw`);
    piece.style.setProperty('--x-end', `${(Math.random() * 60 - 30).toFixed(2)}vw`);
    piece.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
    confettiContainer.appendChild(piece);
  }
}
