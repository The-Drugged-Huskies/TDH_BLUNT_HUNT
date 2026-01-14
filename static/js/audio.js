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

    // --- Music Sequencer ---

    initMusic() {
        this.tempo = 120;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // s
        this.nextNoteTime = 0.0;
        this.current16thNote = 0;
        this.isPlaying = false;
        this.timerID = null;

        // Loop Length: 8 Bars = 32 beats = 128 16th notes
        this.loopLength = 128;
    }

    generateComposition() {
        // --- 1. Choose Chord Progression (C Major) ---
        // I = C(523), ii = Dm(587), iii = Em(659), IV = F(698), V = G(783), vi = Am(880)
        // Root Frequencies:
        const chords = {
            'I': 523.25, 'ii': 587.33, 'iii': 659.25, 'IV': 698.46, 'V': 783.99, 'vi': 880.00
        };
        const progressions = [
            ['I', 'IV', 'V', 'IV'], // Classic I-IV-V
            ['I', 'vi', 'IV', 'V'], // 50s / Doo-wop Reggae
            ['ii', 'V', 'I', 'I'],  // ii-V-I
            ['I', 'I', 'IV', 'V']
        ];
        // Pick one
        const prog = progressions[Math.floor(Math.random() * progressions.length)];

        // Map 8 bars to the 4 chords (2 bars per chord)
        // Bar 0-1: Chord[0], Bar 2-3: Chord[1], etc.
        this.chordMap = [];
        for (let i = 0; i < 8; i++) {
            this.chordMap.push(chords[prog[i % 4]]);
        }

        // --- 2. Generate Bassline ---
        this.bassLine = new Array(this.loopLength).fill(null);

        // Pattern Types:
        // 1. One Drop: Root on Beat 3 (index 8, 24...)
        // 2. Steppers: Root on all 4 beats
        // 3. Walking: Arpeggios
        const patternType = Math.random() > 0.5 ? 'onedrop' : 'simple';

        for (let bar = 0; bar < 8; bar++) {
            const root = this.chordMap[bar] / 4; // Shift down 2 octaves for bass (C3 approx 130)
            const beatOffset = bar * 16;

            if (patternType === 'onedrop') {
                // Beat 3 (index 8) is heavy. Beat 1 is empty or light.
                this.bassLine[beatOffset + 8] = { note: root, len: 0.8 }; // Beat 3
                // Little skip note at end of bar?
                if (Math.random() > 0.5)
                    this.bassLine[beatOffset + 14] = { note: root * 1.5, len: 0.2 }; // Perfect 5th
            } else {
                // Simple roots on 1 and 3
                this.bassLine[beatOffset] = { note: root, len: 0.8 }; // Beat 1
                this.bassLine[beatOffset + 8] = { note: root, len: 0.8 }; // Beat 3

                // Variation on beat 4?
                if (Math.random() > 0.3) {
                    this.bassLine[beatOffset + 12] = { note: root * 1.25, len: 0.4 }; // Major 3rd
                }
            }
        }

        // --- 3. Generate Skank Pattern ---
        // Always on off-beats (beats 2 and 4 -> 16th indices 4, 12)
        this.skankPattern = new Array(this.loopLength).fill(0);
        for (let i = 0; i < this.loopLength; i += 16) {
            this.skankPattern[i + 4] = 1; // Beat 2
            this.skankPattern[i + 12] = 1; // Beat 4

            // Occasional double chop?
            if (Math.random() > 0.8) this.skankPattern[i + 14] = 1;
        }
    }

    startMusic() {
        if (this.isPlaying) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        if (!this.tempo) this.initMusic();

        this.generateComposition();

        this.isPlaying = true;
        this.current16thNote = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.scheduler();
    }

    stopMusic() {
        this.isPlaying = false;
        clearTimeout(this.timerID);
    }

    scheduler() {
        if (!this.isPlaying) return;

        // While there are notes that will need to play before the next interval, 
        // schedule them and advance the pointer.
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.current16thNote, this.nextNoteTime);
            this.nextNote();
        }

        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }

    nextNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat; // Advance by a 16th note
        this.current16thNote++;
        if (this.current16thNote === this.loopLength) {
            this.current16thNote = 0;
        }
    }

    scheduleNote(beatNumber, time) {
        // --- 1. Drums ---
        // Simple One Drop Logic
        // 16th index in a bar (0-15)
        const stepInBar = beatNumber % 16;

        if (stepInBar % 4 === 0) { // Quarter notes hihats
            this.playNoise(time, 0.03, 2000 + Math.random() * 1000);
        }

        // Kick / Rim on Beat 3 (index 8)
        if (stepInBar === 8) {
            this.playKick(time);
            this.playNoise(time, 0.08, 900);
        }

        // --- 2. Bass ---
        const bassNote = this.bassLine[beatNumber];
        if (bassNote) {
            this.playBass(time, bassNote.note, bassNote.len);
        }

        // --- 3. Skank (Chords) ---
        if (this.skankPattern[beatNumber]) {
            // Determine Chord from Bar index
            const barIndex = Math.floor(beatNumber / 16);
            // Default to C if undefined (shouldn't happen)
            const root = this.chordMap[barIndex] || 523.25;
            this.playSkank(time, root);
        }
    }

    playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    playNoise(time, duration, filterFreq) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = filterFreq;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.1;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(time);
    }

    playBass(time, freq, length) {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.4, time); // Pretty loud
        gain.gain.linearRampToValueAtTime(0.01, time + length);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + length);
    }

    playSkank(time, rootFreq) {
        // Staccato Stab
        const duration = 0.1;
        // 3 notes
        [rootFreq, rootFreq * 1.2599, rootFreq * 1.4983].forEach(freq => { // Approx Major 3rd, 5th
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            const gain = this.ctx.createGain();
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.05, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + duration);
        });
    }
}
