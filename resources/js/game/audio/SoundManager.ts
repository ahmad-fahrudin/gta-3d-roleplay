export class SoundManager {
    private ctx: AudioContext | null = null;
    private engineOsc: OscillatorNode | null = null;
    private engineGain: GainNode | null = null;
    private engineSubOsc: OscillatorNode | null = null;
    private hornOsc1: OscillatorNode | null = null;
    private hornOsc2: OscillatorNode | null = null;
    private hornGain: GainNode | null = null;
    private isEngineRunning: boolean = false;
    private isHornActive: boolean = false;
    private initialized: boolean = false;

    init() {
        if (this.initialized) return;
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            this.ctx = new AudioCtx();
            this.initialized = true;
        } catch {
            console.warn('Web Audio API not supported in this browser');
        }
    }

    private ensureContext() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    startEngine() {
        this.ensureContext();
        if (!this.ctx || this.isEngineRunning) return;

        this.isEngineRunning = true;

        // Main low-frequency rumble
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 45;

        // Sub bass
        this.engineSubOsc = this.ctx.createOscillator();
        this.engineSubOsc.type = 'triangle';
        this.engineSubOsc.frequency.value = 25;

        // Lowpass filter to make it sound like an exhaust/muffler
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0.08;

        this.engineOsc.connect(filter);
        this.engineSubOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);

        this.engineOsc.start();
        this.engineSubOsc.start();
    }

    updateEngine(speedKmH: number, isAccelerating: boolean) {
        if (!this.ctx || !this.isEngineRunning || !this.engineOsc || !this.engineSubOsc || !this.engineGain) return;

        const basePitch = 45;
        const normalizedSpeed = Math.min(Math.abs(speedKmH) / 120, 1);
        const targetPitch = basePitch + normalizedSpeed * 120 + (isAccelerating ? 25 : 0);

        this.engineOsc.frequency.setTargetAtTime(targetPitch, this.ctx.currentTime, 0.1);
        this.engineSubOsc.frequency.setTargetAtTime(targetPitch * 0.5, this.ctx.currentTime, 0.1);

        const targetVolume = isAccelerating ? 0.12 : 0.05 + normalizedSpeed * 0.05;
        this.engineGain.gain.setTargetAtTime(targetVolume, this.ctx.currentTime, 0.1);
    }

    stopEngine() {
        if (!this.isEngineRunning) return;
        this.isEngineRunning = false;

        if (this.engineGain && this.ctx) {
            this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        }

        setTimeout(() => {
            if (this.engineOsc) {
                try { this.engineOsc.stop(); this.engineOsc.disconnect(); } catch {}
                this.engineOsc = null;
            }
            if (this.engineSubOsc) {
                try { this.engineSubOsc.stop(); this.engineSubOsc.disconnect(); } catch {}
                this.engineSubOsc = null;
            }
        }, 150);
    }

    startHorn() {
        this.ensureContext();
        if (!this.ctx || this.isHornActive) return;

        this.isHornActive = true;
        this.hornOsc1 = this.ctx.createOscillator();
        this.hornOsc2 = this.ctx.createOscillator();

        this.hornOsc1.type = 'sawtooth';
        this.hornOsc2.type = 'sawtooth';
        this.hornOsc1.frequency.value = 415; // G#4
        this.hornOsc2.frequency.value = 494; // B4

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1400;

        this.hornGain = this.ctx.createGain();
        this.hornGain.gain.value = 0.15;

        this.hornOsc1.connect(filter);
        this.hornOsc2.connect(filter);
        filter.connect(this.hornGain);
        this.hornGain.connect(this.ctx.destination);

        this.hornOsc1.start();
        this.hornOsc2.start();
    }

    stopHorn() {
        if (!this.isHornActive) return;
        this.isHornActive = false;

        if (this.hornGain && this.ctx) {
            this.hornGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        }

        setTimeout(() => {
            if (this.hornOsc1) {
                try { this.hornOsc1.stop(); this.hornOsc1.disconnect(); } catch {}
                this.hornOsc1 = null;
            }
            if (this.hornOsc2) {
                try { this.hornOsc2.stop(); this.hornOsc2.disconnect(); } catch {}
                this.hornOsc2 = null;
            }
        }, 80);
    }

    playDoorSound() {
        this.ensureContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
    }

    playFootstep() {
        this.ensureContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.07);
    }

    playNotification() {
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
    }
}

export const soundManager = new SoundManager();

