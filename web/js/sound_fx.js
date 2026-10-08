/**
 * ========================================================================
 * SHAE Smalltalk GUI Calculator — Haptic Web Audio Synthesizer
 * Generates tactile mechanical keyboard clicks using Web Audio API oscillators
 * Copyright (c) 2026 spdedsec <legendsatya7272@gmail.com>
 * License: MIT
 * ========================================================================
 */

class SoundFxManager {
    constructor() {
        this.enabled = true;
        this.audioCtx = null;
    }

    initContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playClick(type = 'normal') {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.audioCtx) return;

            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'triangle';

            let baseFreq = 800;
            let duration = 0.015;
            let volume = 0.08;

            if (type === 'operator') {
                baseFreq = 1200;
                duration = 0.02;
                volume = 0.1;
            } else if (type === 'action' || type === 'equals') {
                baseFreq = 1500;
                duration = 0.025;
                volume = 0.12;
            } else if (type === 'clear') {
                baseFreq = 400;
                duration = 0.03;
                volume = 0.1;
            }

            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + duration);

            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            // Audio error gracefully suppressed
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

window.soundFx = new SoundFxManager();
