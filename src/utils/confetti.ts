import confetti from 'canvas-confetti';

/**
 * Fires romantic pink & gold confetti burst
 */
export function fireCelebrationConfetti() {
  try {
    const count = 180;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    // Soft blush pinks and rose
    fire(0.25, {
      spread: 30,
      startVelocity: 50,
      colors: ['#F8C8DC', '#FDE8F1', '#E889AD', '#FFFFFF']
    });
    // Gold and champagne sparkles
    fire(0.2, {
      spread: 60,
      colors: ['#D9A441', '#F7A8C4', '#FFFFFF', '#FFF0F5']
    });
    // Soft fluttering shapes
    fire(0.35, {
      spread: 90,
      decay: 0.91,
      scalar: 0.85,
      colors: ['#F8C8DC', '#E889AD', '#FFFFFF']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.1,
      colors: ['#D9A441', '#F7A8C4']
    });
    fire(0.1, {
      spread: 110,
      startVelocity: 40,
      colors: ['#FFFFFF', '#F8C8DC']
    });
  } catch {
    // fallback gracefully
  }
}

/**
 * Soft pink & golden glitter burst for gift opening
 */
export function fireGoldenSparkle() {
  try {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#F8C8DC', '#E889AD', '#D9A441', '#FFFFFF', '#FDE8F1'],
      shapes: ['star', 'circle'],
      scalar: 1.15,
      zIndex: 9999
    });
  } catch {
    // fallback
  }
}

/**
 * Elegant pink fireworks continuous sequence
 */
export function fireFireworksSequence(durationMs: number = 3000) {
  const animationEnd = Date.now() + durationMs;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: ReturnType<typeof setInterval> = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 45 * (timeLeft / durationMs);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.15, 0.45), y: Math.random() - 0.2 },
      colors: ['#F8C8DC', '#E889AD', '#F7A8C4', '#FFFFFF', '#D9A441']
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.55, 0.85), y: Math.random() - 0.2 },
      colors: ['#FDE8F1', '#D9A441', '#E889AD', '#FFFFFF']
    });
  }, 260);
}
