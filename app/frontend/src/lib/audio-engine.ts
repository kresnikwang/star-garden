import { ThemeConfig } from './themes';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;
  private isPlaying = false;
  private melodyInterval: ReturnType<typeof setInterval> | null = null;
  private noteIndex = 0;

  // Charge sound state
  private chargeOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;
  private chargeLfoOsc: OscillatorNode | null = null;
  private chargeLfoGain: GainNode | null = null;
  private chargeInterval: ReturnType<typeof setInterval> | null = null;

  // Swipe continuous sound state
  private swipeOsc: OscillatorNode | null = null;
  private swipeGain: GainNode | null = null;
  private swipeFilterNode: BiquadFilterNode | null = null;
  private swipeActive = false;

  // Pinch continuous sound state (3-note chord for musical richness)
  private pinchOscRoot: OscillatorNode | null = null;
  private pinchOscThird: OscillatorNode | null = null;
  private pinchOscFifth: OscillatorNode | null = null;
  private pinchGain: GainNode | null = null;
  private pinchFilter: BiquadFilterNode | null = null;
  private pinchActive = false;
  private pinchArpLfo: OscillatorNode | null = null;
  private pinchArpGain: GainNode | null = null;

  init(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);

    this.melodyGain = this.ctx.createGain();
    this.melodyGain.gain.value = 0;
    this.melodyGain.connect(this.masterGain);
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play note based on click count (cycles through all 14 notes)
  playNote(theme: ThemeConfig, clickCount: number): void {
    if (!this.ctx || !this.masterGain) {
      this.init();
    }
    this.resume();

    const ctx = this.ctx!;
    const scale = theme.pentatonicScale;
    const noteFreq = scale[clickCount % scale.length];

    // Create oscillator for the click note
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = noteFreq;

    // Add slight detune for warmth
    osc.detune.value = Math.random() * 10 - 5;

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain!);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);

    // Add harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = noteFreq * 2;
    gain2.gain.setValueAtTime(0.1, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.5);
  }

  // Play note based on Y position (maps screen height to 14 notes)
  playNoteByPosition(theme: ThemeConfig, y: number, screenHeight: number): void {
    if (!this.ctx || !this.masterGain) {
      this.init();
    }
    this.resume();

    const ctx = this.ctx!;
    const scale = theme.pentatonicScale;
    // Map Y position: top = high notes, bottom = low notes
    const normalizedY = Math.max(0, Math.min(1, y / screenHeight));
    const noteIndex = Math.floor((1 - normalizedY) * (scale.length - 1));
    const noteFreq = scale[Math.max(0, Math.min(scale.length - 1, noteIndex))];

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = noteFreq;
    osc.detune.value = Math.random() * 8 - 4;

    gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain!);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);

    // Soft overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = noteFreq * 1.5; // Fifth harmonic for richness
    gain2.gain.setValueAtTime(0.06, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.4);
  }

  // Start continuous charge sound (rising pitch drone)
  startChargeSound(theme: ThemeConfig): void {
    if (!this.ctx || !this.masterGain) {
      this.init();
    }
    this.resume();
    this.stopChargeSound(); // Clear any existing

    const ctx = this.ctx!;
    const baseFreq = theme.pentatonicScale[0] * 0.5; // Low base frequency

    // Main charge oscillator - starts low, will rise
    this.chargeOsc = ctx.createOscillator();
    this.chargeGain = ctx.createGain();
    this.chargeOsc.type = 'sine';
    this.chargeOsc.frequency.value = baseFreq;
    this.chargeGain.gain.setValueAtTime(0, ctx.currentTime);
    this.chargeGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.3);
    this.chargeOsc.connect(this.chargeGain);
    this.chargeGain.connect(this.masterGain!);
    this.chargeOsc.start(ctx.currentTime);

    // LFO for pulsing/tremolo effect
    this.chargeLfoOsc = ctx.createOscillator();
    this.chargeLfoGain = ctx.createGain();
    this.chargeLfoOsc.type = 'sine';
    this.chargeLfoOsc.frequency.value = 3; // Pulse rate
    this.chargeLfoGain.gain.value = 0.05;
    this.chargeLfoOsc.connect(this.chargeLfoGain);
    this.chargeLfoGain.connect(this.chargeGain.gain);
    this.chargeLfoOsc.start(ctx.currentTime);

    // Gradually increase pitch and pulse rate over time
    let elapsed = 0;
    this.chargeInterval = setInterval(() => {
      elapsed += 100;
      const progress = Math.min(elapsed / 3000, 1); // 3 seconds to full charge
      if (this.chargeOsc && this.ctx) {
        // Rising pitch
        const freq = baseFreq * (1 + progress * 2);
        this.chargeOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        // Faster pulsing as charge builds
        if (this.chargeLfoOsc) {
          this.chargeLfoOsc.frequency.setValueAtTime(3 + progress * 8, this.ctx.currentTime);
        }
        // Slightly louder
        if (this.chargeGain) {
          this.chargeGain.gain.setValueAtTime(0.15 + progress * 0.1, this.ctx.currentTime);
        }
      }
    }, 100);
  }

  // Stop charge sound
  stopChargeSound(): void {
    if (this.chargeInterval) {
      clearInterval(this.chargeInterval);
      this.chargeInterval = null;
    }
    if (this.chargeOsc) {
      try { this.chargeOsc.stop(); } catch { /* already stopped */ }
      this.chargeOsc = null;
    }
    if (this.chargeLfoOsc) {
      try { this.chargeLfoOsc.stop(); } catch { /* already stopped */ }
      this.chargeLfoOsc = null;
    }
    this.chargeGain = null;
    this.chargeLfoGain = null;
  }

  // Start continuous swipe sound (ethereal gliding tone that follows finger movement)
  startSwipeSound(theme: ThemeConfig, y: number, screenHeight: number): void {
    if (!this.ctx || !this.masterGain) {
      this.init();
    }
    this.resume();

    const ctx = this.ctx!;
    const scale = theme.pentatonicScale;
    const normalizedY = Math.max(0, Math.min(1, y / screenHeight));
    const noteIndex = Math.floor((1 - normalizedY) * (scale.length - 1));
    const noteFreq = scale[Math.max(0, Math.min(scale.length - 1, noteIndex))];

    if (this.swipeActive && this.swipeOsc) {
      // Update frequency smoothly if already playing
      this.swipeOsc.frequency.linearRampToValueAtTime(noteFreq, ctx.currentTime + 0.05);
      if (this.swipeFilterNode) {
        this.swipeFilterNode.frequency.linearRampToValueAtTime(noteFreq * 3, ctx.currentTime + 0.05);
      }
      return;
    }

    // Create new swipe sound
    this.swipeOsc = ctx.createOscillator();
    this.swipeGain = ctx.createGain();
    this.swipeFilterNode = ctx.createBiquadFilter();

    this.swipeOsc.type = 'sine';
    this.swipeOsc.frequency.value = noteFreq;

    // Low-pass filter for smooth, dreamy sound
    this.swipeFilterNode.type = 'lowpass';
    this.swipeFilterNode.frequency.value = noteFreq * 3;
    this.swipeFilterNode.Q.value = 2;

    // Fade in gently
    this.swipeGain.gain.setValueAtTime(0, ctx.currentTime);
    this.swipeGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);

    this.swipeOsc.connect(this.swipeFilterNode);
    this.swipeFilterNode.connect(this.swipeGain);
    this.swipeGain.connect(this.masterGain!);

    this.swipeOsc.start(ctx.currentTime);
    this.swipeActive = true;
  }

  // Update swipe sound pitch based on current position
  updateSwipeSound(y: number, screenHeight: number, theme: ThemeConfig): void {
    if (!this.swipeActive || !this.swipeOsc || !this.ctx) return;

    const scale = theme.pentatonicScale;
    const normalizedY = Math.max(0, Math.min(1, y / screenHeight));
    const noteIndex = Math.floor((1 - normalizedY) * (scale.length - 1));
    const noteFreq = scale[Math.max(0, Math.min(scale.length - 1, noteIndex))];

    this.swipeOsc.frequency.linearRampToValueAtTime(noteFreq, this.ctx.currentTime + 0.05);
    if (this.swipeFilterNode) {
      this.swipeFilterNode.frequency.linearRampToValueAtTime(noteFreq * 3, this.ctx.currentTime + 0.05);
    }
  }

  // Stop swipe sound with fade out
  stopSwipeSound(): void {
    if (!this.swipeActive || !this.swipeGain || !this.ctx) {
      this.swipeActive = false;
      return;
    }

    const ctx = this.ctx;
    this.swipeGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    const osc = this.swipeOsc;
    const gain = this.swipeGain;
    const filter = this.swipeFilterNode;

    setTimeout(() => {
      try { osc?.stop(); } catch { /* already stopped */ }
      try { gain?.disconnect(); } catch { /* ok */ }
      try { filter?.disconnect(); } catch { /* ok */ }
    }, 250);

    this.swipeOsc = null;
    this.swipeGain = null;
    this.swipeFilterNode = null;
    this.swipeActive = false;
  }

  // Start continuous pinch sound (3-note chord that shifts with scale)
  startPinchSound(theme: ThemeConfig, scale: number): void {
    if (!this.ctx || !this.masterGain) {
      this.init();
    }
    this.resume();
    this.stopPinchSound();

    const ctx = this.ctx!;
    const scaleArr = theme.pentatonicScale;

    // Pick a base note from the scale based on pinch scale
    // scale < 1 (pinch in) → lower notes; scale > 1 (pinch out) → higher notes
    const baseIndex = Math.min(
      Math.floor((scale - 0.5) * 4),
      scaleArr.length - 4
    );
    const safeIndex = Math.max(0, baseIndex);
    const rootFreq = scaleArr[safeIndex];

    // Create 3-note chord: root + third + fifth
    this.pinchOscRoot = ctx.createOscillator();
    this.pinchOscThird = ctx.createOscillator();
    this.pinchOscFifth = ctx.createOscillator();
    this.pinchGain = ctx.createGain();
    this.pinchFilter = ctx.createBiquadFilter();

    this.pinchOscRoot.type = 'sine';
    this.pinchOscThird.type = 'sine';
    this.pinchOscFifth.type = 'sine';

    this.pinchOscRoot.frequency.value = rootFreq;
    this.pinchOscThird.frequency.value = rootFreq * 1.25; // Just major third (5/4)
    this.pinchOscFifth.frequency.value = rootFreq * 1.5;  // Perfect fifth (3/2)

    // Low-pass filter for softness
    this.pinchFilter.type = 'lowpass';
    this.pinchFilter.frequency.value = rootFreq * 4;
    this.pinchFilter.Q.value = 0.5;

    // Gentle fade in
    this.pinchGain.gain.setValueAtTime(0, ctx.currentTime);
    this.pinchGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.2);

    // Connect all oscillators through filter
    this.pinchOscRoot.connect(this.pinchFilter);
    this.pinchOscThird.connect(this.pinchFilter);
    this.pinchOscFifth.connect(this.pinchFilter);
    this.pinchFilter.connect(this.pinchGain);
    this.pinchGain.connect(this.masterGain);

    this.pinchOscRoot.start(ctx.currentTime);
    this.pinchOscThird.start(ctx.currentTime);
    this.pinchOscFifth.start(ctx.currentTime);

    // Arpeggio LFO: gently modulate the chord balance for a "breathing" musical feel
    this.pinchArpLfo = ctx.createOscillator();
    this.pinchArpGain = ctx.createGain();
    this.pinchArpLfo.type = 'sine';
    this.pinchArpLfo.frequency.value = 2; // 2 Hz subtle pulse
    this.pinchArpGain.gain.value = 0.03;
    this.pinchArpLfo.connect(this.pinchArpGain);
    this.pinchArpGain.connect(this.pinchGain.gain);
    this.pinchArpLfo.start(ctx.currentTime);

    this.pinchActive = true;
  }

  // Update pinch sound: shift the whole chord up/down based on scale
  updatePinchSound(theme: ThemeConfig, scale: number): void {
    if (!this.pinchActive || !this.ctx) return;
    const scaleArr = theme.pentatonicScale;

    const baseIndex = Math.min(
      Math.floor((scale - 0.5) * 4),
      scaleArr.length - 4
    );
    const safeIndex = Math.max(0, baseIndex);
    const rootFreq = scaleArr[safeIndex];

    const rampTime = this.ctx.currentTime + 0.08;

    if (this.pinchOscRoot) {
      this.pinchOscRoot.frequency.linearRampToValueAtTime(rootFreq, rampTime);
    }
    if (this.pinchOscThird) {
      this.pinchOscThird.frequency.linearRampToValueAtTime(rootFreq * 1.25, rampTime);
    }
    if (this.pinchOscFifth) {
      this.pinchOscFifth.frequency.linearRampToValueAtTime(rootFreq * 1.5, rampTime);
    }
    if (this.pinchFilter) {
      this.pinchFilter.frequency.linearRampToValueAtTime(rootFreq * 4, rampTime);
    }
  }

  // Stop pinch sound with fade out
  stopPinchSound(): void {
    if (!this.pinchActive && !this.pinchOscRoot && !this.pinchOscThird && !this.pinchOscFifth) {
      this.pinchOscRoot = null;
      this.pinchOscThird = null;
      this.pinchOscFifth = null;
      this.pinchGain = null;
      this.pinchFilter = null;
      this.pinchArpLfo = null;
      this.pinchArpGain = null;
      this.pinchActive = false;
      return;
    }

    const ctx = this.ctx;
    if (this.pinchGain) {
      try {
        this.pinchGain.gain.linearRampToValueAtTime(0, (ctx?.currentTime || 0) + 0.2);
      } catch {}
    }

    const oscR = this.pinchOscRoot;
    const osc3 = this.pinchOscThird;
    const osc5 = this.pinchOscFifth;
    const gain = this.pinchGain;
    const filter = this.pinchFilter;
    const arp = this.pinchArpLfo;
    const arpGain = this.pinchArpGain;

    setTimeout(() => {
      try { oscR?.stop(); } catch {}
      try { osc3?.stop(); } catch {}
      try { osc5?.stop(); } catch {}
      try { arp?.stop(); } catch {}
      try { gain?.disconnect(); } catch {}
      try { filter?.disconnect(); } catch {}
      try { arpGain?.disconnect(); } catch {}
    }, 250);

    this.pinchOscRoot = null;
    this.pinchOscThird = null;
    this.pinchOscFifth = null;
    this.pinchGain = null;
    this.pinchFilter = null;
    this.pinchArpLfo = null;
    this.pinchArpGain = null;
    this.pinchActive = false;
  }

  // Play explosion sound effect on long press release
  playExplosionSound(theme: ThemeConfig): void {
    if (!this.ctx || !this.masterGain) {
      this.init();
    }
    this.resume();

    const ctx = this.ctx!;
    const baseFreq = theme.pentatonicScale[Math.floor(theme.pentatonicScale.length / 2)];

    // White noise burst for explosion
    const bufferSize = ctx.sampleRate * 0.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    noiseNode.connect(noiseGain);
    noiseGain.connect(this.masterGain!);
    noiseNode.start(ctx.currentTime);
    noiseNode.stop(ctx.currentTime + 0.5);

    // Low boom
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(baseFreq * 0.5, ctx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
    boomGain.gain.setValueAtTime(0.5, ctx.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    boom.connect(boomGain);
    boomGain.connect(this.masterGain!);
    boom.start(ctx.currentTime);
    boom.stop(ctx.currentTime + 0.4);

    // Shimmer overtones (sparkle effect)
    for (let i = 0; i < 3; i++) {
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.value = baseFreq * (2 + i);
      shimmerGain.gain.setValueAtTime(0.1, ctx.currentTime + 0.05 * i);
      shimmerGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6 + 0.1 * i);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(this.masterGain!);
      shimmer.start(ctx.currentTime + 0.05 * i);
      shimmer.stop(ctx.currentTime + 0.7 + 0.1 * i);
    }
  }

  startMelody(theme: ThemeConfig): void {
    if (this.isPlaying) return;
    if (!this.ctx || !this.melodyGain) {
      this.init();
    }
    this.resume();
    this.isPlaying = true;

    // Fade in melody
    const ctx = this.ctx!;
    this.melodyGain!.gain.setValueAtTime(0, ctx.currentTime);
    this.melodyGain!.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 3);

    this.noteIndex = 0;
    this.melodyInterval = setInterval(() => {
      this.playMelodyNote(theme);
    }, 800);
  }

  private playMelodyNote(theme: ThemeConfig): void {
    if (!this.ctx || !this.melodyGain) return;

    const ctx = this.ctx;
    const notes = theme.melodyNotes;
    const freq = notes[this.noteIndex % notes.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(this.melodyGain!);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);

    // Pad note for atmosphere
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.type = 'sine';
    pad.frequency.value = freq / 2;
    padGain.gain.setValueAtTime(0.08, ctx.currentTime);
    padGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    pad.connect(padGain);
    padGain.connect(this.melodyGain!);
    pad.start(ctx.currentTime);
    pad.stop(ctx.currentTime + 1.5);

    this.noteIndex++;
  }

  stopMelody(): void {
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
    if (this.melodyGain && this.ctx) {
      this.melodyGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
    }
    this.isPlaying = false;
  }

  destroy(): void {
    this.stopMelody();
    this.stopChargeSound();
    this.stopPinchSound();
    this.stopSwipeSound();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}