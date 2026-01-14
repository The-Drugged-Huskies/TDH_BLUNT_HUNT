/**
 * audio.js
 * Handles procedural sound effects using Web Audio API.
 * Features: Procedural Reggae Soundtrack, Dub Effects, Song Structure.
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

    // --- Music Sequencer with Dub FX ---

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

        // Setup Dub Delay
        this.createDubDelay();
    }

    createDubDelay() {
        // Create Delay Chain: Source -> Delay -> Feedback -> Source
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.value = 0.375; // 3/16th note delay (dotted eighth feel) at 120BPM
        // 60/120 = 0.5s per beat. 16th = 0.125s. 3*0.125 = 0.375s.

        this.feedbackGain = this.ctx.createGain();
        this.feedbackGain.gain.value = 0.6; // 60% feedback

        // Filter for "Tape Dub" sound (High pass + Low pass)
        this.delayFilter = this.ctx.createBiquadFilter();
        this.delayFilter.type = 'lowpass';
        this.delayFilter.frequency.value = 1200; // Darken the repeats

        // Chain
        this.delayNode.connect(this.feedbackGain);
        this.feedbackGain.connect(this.delayFilter);
        this.delayFilter.connect(this.delayNode); // Feedback Loop

        // Output to master
        this.delayNode.connect(this.ctx.destination);
    }

    generateComposition() {
        // Define Sections
        this.verse = this.generateSection('verse');
        this.chorus = this.generateSection('chorus');

        this.currentSection = 'verse'; // Start with Verse
    }

    generateSection(type) {
        // Basic Chords
        const C = 523.25, Dm = 587.33, Em = 659.25, F = 698.46, G = 783.99, Am = 880.00;
        const chords = { 'I': C, 'ii': Dm, 'iii': Em, 'IV': F, 'V': G, 'vi': Am };

        let prog;
        if (type === 'verse') {
            const verseProgs = [
                ['I', 'ii'], // Classic 2-chord skank
                ['I', 'V'],
                ['ii', 'iii'],
                ['I', 'vi', 'ii', 'V']
            ];
            prog = verseProgs[Math.floor(Math.random() * verseProgs.length)];
        } else {
            // Chorus adds energy (IV, V)
            const chorusProgs = [
                ['IV', 'V', 'I', 'I'],
                ['IV', 'I', 'V', 'I'],
                ['vi', 'IV', 'I', 'V']
            ];
            prog = chorusProgs[Math.floor(Math.random() * chorusProgs.length)];
        }

        // Expand prog to 8 bars
        // Use modulus to cycle through the progression
        const chordMap = [];
        for (let i = 0; i < 8; i++) {
            const chordName = prog[i % prog.length];
            chordMap.push(chords[chordName]);
        }

        // Generate Bass & Skank for this section
        const bassLine = new Array(128).fill(null);
        const skankPattern = new Array(128).fill(0);

        const patternType = Math.random() > 0.5 ? 'onedrop' : 'steppers';

        for (let bar = 0; bar < 8; bar++) {
            const root = chordMap[bar] / 4; // Bass Octave
            const offset = bar * 16;

            // Bass
            if (patternType === 'onedrop') {
                bassLine[offset + 8] = { note: root, len: 0.8 }; // Beat 3
                // Variation
                if (Math.random() > 0.6) bassLine[offset + 14] = { note: root * 1.5, len: 0.2 };
            } else {
                // Steppers (Four on the floor feel)
                bassLine[offset] = { note: root, len: 0.4 };
                bassLine[offset + 4] = { note: root, len: 0.4 };
                bassLine[offset + 8] = { note: root, len: 0.4 };
                bassLine[offset + 12] = { note: root, len: 0.4 };
            }

            // Skank (Beats 2 & 4)
            skankPattern[offset + 4] = 1;
            skankPattern[offset + 12] = 1;
            if (Math.random() > 0.9) skankPattern[offset + 14] = 1; // Rare double skank
        }

        return { chordMap, bassLine, skankPattern };
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

        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.current16thNote, this.nextNoteTime);
            this.nextNote();
        }

        this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }

    nextNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat; // Advance by 16th note
        this.current16thNote++;

        // Loop and Section Switching
        if (this.current16thNote === this.loopLength) {
            this.current16thNote = 0;
            // Toggle Section
            this.currentSection = (this.currentSection === 'verse') ? 'chorus' : 'verse';
        }
    }

    scheduleNote(beatNumber, time) {
        // Use data from current section
        const sectionData = this.currentSection === 'chorus' ? this.chorus : this.verse;

        // --- 1. Drums ---
        const stepInBar = beatNumber % 16;

        // Hats
        if (stepInBar % 4 === 0) {
            this.playNoise(time, 0.03, 2000 + Math.random() * 1000);
        }

        // Kick / Rim (One Drop logic primarily on Beat 3)
        // If Chorus, maybe drive harder (kick on 1 too)
        if (this.currentSection === 'chorus' && stepInBar === 0) {
            this.playKick(time); // Driving kick
        }

        if (stepInBar === 8) { // Beat 3 (Standard One Drop)
            this.playKick(time);
            this.playNoise(time, 0.08, 900); // Snare

            // Random Dub Throw on Snare
            if (Math.random() > 0.7) {
                this.playDubThrow(time, 900);
            }
        }

        // --- 2. Bass ---
        const bassNote = sectionData.bassLine[beatNumber];
        if (bassNote) {
            this.playBass(time, bassNote.note, bassNote.len);
        }

        // --- 3. Skank (Chords) ---
        if (sectionData.skankPattern[beatNumber]) {
            const barIndex = Math.floor(beatNumber / 16);
            const root = sectionData.chordMap[barIndex] || 523.25;
            this.playSkank(time, root);

            // Random Dub Throw on Skank
            if (Math.random() > 0.8) {
                this.playDubThrow(time, null, root); // Skank throw
            }
        }
    }

    // --- Sound Generators with sends to Delay ---

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
        return { noise, gain }; // Return for potential processing
    }

    playBass(time, freq, length) {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.linearRampToValueAtTime(0.01, time + length);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + length);
    }

    playSkank(time, rootFreq) {
        const duration = 0.1;
        [rootFreq, rootFreq * 1.2599, rootFreq * 1.4983].forEach(freq => {
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

    playDubThrow(time, noiseFreq, chordRoot) {
        if (!this.delayNode) return;

        // Create a separate sound source just for the delay line
        if (noiseFreq) {
            // Snare Throw
            const bufferSize = this.ctx.sampleRate * 0.15;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass'; // Bandpass for telephone/dub effect
            filter.frequency.value = noiseFreq;

            const gain = this.ctx.createGain();
            gain.gain.value = 0.3; // Send level

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.delayNode); // SEND TO DELAY ONLY (or dest too if we want direct sound)

            noise.start(time);
        } else if (chordRoot) {
            // Chord Throw (Single Blip)
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = chordRoot * 2; // High beep

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 2000;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.delayNode); // Send to Delay

            osc.start(time);
            osc.stop(time + 0.1);
        }
    }
}
