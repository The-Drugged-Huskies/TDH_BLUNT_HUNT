/**
 * audio.js
 * Handles procedural sound effects using Web Audio API.
 */
class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isMuted = false;

        // Resume AudioContext on first interaction
        window.addEventListener('click', () => {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }, { once: true });
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (this.isMuted || this.ctx.state === 'suspended') return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    shoot() {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    hit() {
        // Noise burst / crunch
        this.playTone(150, 'sawtooth', 0.1, 0.05); // Simple crunch
    }

    goldHit() {
        // Magical Chime: Two sine waves (harmony)
        if (this.isMuted) return;

        const now = this.ctx.currentTime;

        // Osc 1: High Pitch
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // Slide up slightly
        gain1.gain.setValueAtTime(0.1, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start();
        osc1.stop(now + 0.8);

        // Osc 2: Harmony
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1108.73, now); // C#6
        gain2.gain.setValueAtTime(0.1, now);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start();
        osc2.stop(now + 0.8);
    }

    clink() {
        // High pitched metallic ping
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    explosion() {
        // Low frequency tumble
        this.playTone(80, 'sawtooth', 0.3, 0.08);
        this.playTone(60, 'square', 0.3, 0.08);
    }
}
