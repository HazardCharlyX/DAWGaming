// Web Audio API Procedural Sound Generator for Page Destruction

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// Generate a burst of white noise for explosions & glass shatter
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playHitSound(damagePercent: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const intensity = Math.min(1, Math.max(0.2, damagePercent / 100));

  // 1. Low Bass Thump (Explosion punch)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = damagePercent > 60 ? 'sawtooth' : 'sine';
  osc.frequency.setValueAtTime(140 + Math.random() * 40, now);
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.35 + intensity * 0.2);

  oscGain.gain.setValueAtTime(0.5 + intensity * 0.4, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + intensity * 0.2);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4 + intensity * 0.2);

  // 2. Glass / Metal Shatter (Filtered Noise)
  try {
    const noiseDuration = 0.25 + intensity * 0.2;
    const noiseBuffer = createNoiseBuffer(ctx, noiseDuration);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000 + Math.random() * 2500, now);
    filter.Q.setValueAtTime(3 + Math.random() * 4, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45 + intensity * 0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + noiseDuration);
  } catch {
    // Ignore audio errors gracefully
  }

  // 3. Glitch zap when heavily damaged
  if (damagePercent > 35) {
    const zap = ctx.createOscillator();
    const zapGain = ctx.createGain();
    zap.type = 'square';
    zap.frequency.setValueAtTime(400 + Math.random() * 1200, now);
    zap.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    zapGain.gain.setValueAtTime(0.15 * intensity, now);
    zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    zap.connect(zapGain);
    zapGain.connect(ctx.destination);
    zap.start(now);
    zap.stop(now + 0.15);
  }
}

// Catastrophic Total Destruction Sound (End of the World)
export function playFinalDestructionSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Massive deep seismic rumble
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'triangle';
  sub.frequency.setValueAtTime(90, now);
  sub.frequency.exponentialRampToValueAtTime(15, now + 3.0);

  subGain.gain.setValueAtTime(0.8, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + 3.2);

  // Violent sustained blast
  try {
    const blastDuration = 2.5;
    const blastBuffer = createNoiseBuffer(ctx, blastDuration);
    const blastSource = ctx.createBufferSource();
    blastSource.buffer = blastBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 2.5);

    const blastGain = ctx.createGain();
    blastGain.gain.setValueAtTime(0.7, now);
    blastGain.gain.exponentialRampToValueAtTime(0.001, now + blastDuration);

    blastSource.connect(filter);
    filter.connect(blastGain);
    blastGain.connect(ctx.destination);

    blastSource.start(now);
    blastSource.stop(now + blastDuration);
  } catch {
    // Ignore
  }

  // Tinnitus / Flatline tone
  const flatline = ctx.createOscillator();
  const flatGain = ctx.createGain();
  flatline.type = 'sine';
  flatline.frequency.setValueAtTime(3200, now + 0.5);

  flatGain.gain.setValueAtTime(0.0001, now);
  flatGain.gain.setValueAtTime(0.2, now + 0.6);
  flatGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

  flatline.connect(flatGain);
  flatGain.connect(ctx.destination);
  flatline.start(now + 0.5);
  flatline.stop(now + 4.5);
}
