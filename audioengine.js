// La parola "export" qui è fondamentale
export class EngineSoundSystem {
    constructor(onUpdateCallback) {
        this.audioCtx = null;
        this.isPlaying = false;
        
        // Nodi audio
        this.osc1 = null; this.osc2 = null; this.osc3 = null;
        this.filter = null; this.gain = null; this.distortion = null;
        this.noise = null; this.noiseGain = null;

        // Stato RPM
        this.targetRpm = 0;
        this.currentRpm = 0;
        this.animationFrame = null;
        
        // Callback per aggiornare l'interfaccia visiva
        this.onUpdateCallback = onUpdateCallback;
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    makeDistortionCurve(amount = 20) {
        const k = amount;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    startEngine() {
        this.initAudio();
        const ctx = this.audioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        this.osc1 = ctx.createOscillator(); this.osc1.type = 'sawtooth';
        this.osc2 = ctx.createOscillator(); this.osc2.type = 'sawtooth';
        this.osc3 = ctx.createOscillator(); this.osc3.type = 'square';

        this.distortion = ctx.createWaveShaper();
        this.distortion.curve = this.makeDistortionCurve(20);
        this.distortion.oversample = '4x';

        this.filter = ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 150;
        this.filter.Q.value = 2;

        this.gain = ctx.createGain();
        this.gain.gain.value = 0;

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        this.noise = ctx.createBufferSource();
        this.noise.buffer = buffer;
        this.noise.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 800;
        noiseFilter.Q.value = 1;

        this.noiseGain = ctx.createGain();
        this.noiseGain.gain.value = 0;

        // Routing
        this.osc1.connect(this.distortion);
        this.osc2.connect(this.distortion);
        this.osc3.connect(this.distortion);
        this.distortion.connect(this.filter);
        this.filter.connect(this.gain);
        this.gain.connect(ctx.destination);

        this.noise.connect(noiseFilter);
        noiseFilter.connect(this.noiseGain);
        this.noiseGain.connect(ctx.destination);

        this.osc1.start(); this.osc2.start(); this.osc3.start(); this.noise.start();

        // Sequenza di accensione
        const now = ctx.currentTime;
        this.gain.gain.setValueAtTime(0, now);
        this.gain.gain.linearRampToValueAtTime(0.8, now + 0.1);
        this.gain.gain.linearRampToValueAtTime(0.5, now + 0.6);
        
        this.osc1.frequency.setValueAtTime(10, now);
        this.osc1.frequency.linearRampToValueAtTime(60, now + 0.3); 
        this.osc1.frequency.linearRampToValueAtTime(26.6, now + 0.8); 

        this.osc2.frequency.setValueAtTime(20, now);
        this.osc2.frequency.linearRampToValueAtTime(120, now + 0.3);
        this.osc2.frequency.linearRampToValueAtTime(53.2, now + 0.8);

        this.osc3.frequency.setValueAtTime(5, now);
        this.osc3.frequency.linearRampToValueAtTime(30, now + 0.3);
        this.osc3.frequency.linearRampToValueAtTime(13.3, now + 0.8);

        this.filter.frequency.setValueAtTime(100, now);
        this.filter.frequency.linearRampToValueAtTime(1000, now + 0.3);
        this.filter.frequency.linearRampToValueAtTime(250, now + 0.8);

        this.noiseGain.gain.setValueAtTime(0, now);
        this.noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.3);
        this.noiseGain.gain.linearRampToValueAtTime(0.05, now + 0.8);

        this.isPlaying = true;
        this.targetRpm = 800;
        this.currentRpm = 800;
        
        this.startRpmLoop();
    }

    stopEngine() {
        if (!this.audioCtx || !this.isPlaying) return;
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        if (this.gain) {
            this.gain.gain.cancelScheduledValues(now);
            this.gain.gain.setValueAtTime(this.gain.gain.value, now);
            this.gain.gain.linearRampToValueAtTime(0, now + 0.5);
        }
        if (this.noiseGain) {
            this.noiseGain.gain.cancelScheduledValues(now);
            this.noiseGain.gain.setValueAtTime(this.noiseGain.gain.value, now);
            this.noiseGain.gain.linearRampToValueAtTime(0, now + 0.5);
        }
        if (this.osc1) {
            this.osc1.frequency.cancelScheduledValues(now);
            this.osc1.frequency.linearRampToValueAtTime(5, now + 0.5);
            this.osc1.stop(now + 0.6);
        }
        if (this.osc2) {
            this.osc2.frequency.cancelScheduledValues(now);
            this.osc2.frequency.linearRampToValueAtTime(10, now + 0.5);
            this.osc2.stop(now + 0.6);
        }
        if (this.osc3) {
            this.osc3.frequency.cancelScheduledValues(now);
            this.osc3.frequency.linearRampToValueAtTime(2.5, now + 0.5);
            this.osc3.stop(now + 0.6);
        }
        if (this.noise) this.noise.stop(now + 0.6);

        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

        setTimeout(() => {
            this.isPlaying = false;
            this.targetRpm = 0;
            this.currentRpm = 0;
            if(this.onUpdateCallback) this.onUpdateCallback(0, false);
        }, 600);
    }

    setTargetRpm(target) {
        this.targetRpm = target;
    }

    startRpmLoop() {
        let lastTime = performance.now();
        
        const loop = (time) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            if (!this.isPlaying && this.targetRpm === 0) return;

            const diff = this.targetRpm - this.currentRpm;
            const rate = diff > 0 ? 5000 : 3000; 
            
            if (Math.abs(diff) > 10) {
                this.currentRpm += Math.sign(diff) * rate * dt;
                if (diff > 0 && this.currentRpm > this.targetRpm) this.currentRpm = this.targetRpm;
                if (diff < 0 && this.currentRpm < this.targetRpm) this.currentRpm = this.targetRpm;
            } else {
                this.currentRpm = this.targetRpm;
            }

            let displayRpm = this.currentRpm;
            if (this.targetRpm === 800) {
                displayRpm += Math.sin(time / 150) * 20; 
            }

            this.updateAudioParams(displayRpm);
            
            if(this.onUpdateCallback) this.onUpdateCallback(displayRpm, this.isPlaying);

            this.animationFrame = requestAnimationFrame(loop);
        };
        
        this.animationFrame = requestAnimationFrame(loop);
    }

    updateAudioParams(rpm) {
        if (!this.audioCtx || !this.isPlaying) return;
        const now = this.audioCtx.currentTime;
        const baseFreq = Math.max(10, rpm / 30);
        
        if (this.osc1) this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
        if (this.osc2) this.osc2.frequency.setTargetAtTime(baseFreq * 2.01, now, 0.05); 
        if (this.osc3) this.osc3.frequency.setTargetAtTime(baseFreq / 2, now, 0.05);
        
        if (this.filter) {
            const filterFreq = 250 + (rpm / 8000) * 4000;
            this.filter.frequency.setTargetAtTime(filterFreq, now, 0.05);
        }
        if (this.distortion) {
            const distAmount = 20 + (rpm / 8000) * 50;
            this.distortion.curve = this.makeDistortionCurve(distAmount);
        }
        if (this.noiseGain) {
            const noiseVol = 0.05 + Math.pow(rpm / 8000, 2) * 0.5;
            this.noiseGain.gain.setTargetAtTime(noiseVol, now, 0.05);
        }
        if (this.gain) {
            const vol = 0.5 + (rpm / 8000) * 0.5;
            this.gain.gain.setTargetAtTime(vol, now, 0.05);
        }
    }
}
