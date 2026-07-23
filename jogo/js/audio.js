/**
 * Audio - Sistema de áudio do jogo (Web Audio API)
 * Sons gerados proceduralmente, sem arquivos externos
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.5;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.6;
        this.enabled = true;
        this.musicPlaying = false;
        this.currentMusic = null;
        this.musicNodes = [];
        
        // Cooldown para sons de passos
        this.lastStepTime = 0;
        this.stepCooldown = 180;
    }
    
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API não disponível');
            this.enabled = false;
        }
    }
    
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    // ========================================
    // Utilitários
    // ========================================
    
    createGain(volume = 1) {
        const gain = this.ctx.createGain();
        gain.gain.value = volume * this.masterVolume;
        gain.connect(this.ctx.destination);
        return gain;
    }
    
    now() {
        return this.ctx ? this.ctx.currentTime : 0;
    }
    
    // ========================================
    // Sons de passos
    // ========================================
    
    playFootstep() {
        if (!this.enabled || !this.ctx) return;
        const now = performance.now();
        if (now - this.lastStepTime < this.stepCooldown) return;
        this.lastStepTime = now;
        
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.15);
        
        // Ruído suave de passo
        const bufferSize = this.ctx.sampleRate * 0.06;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400 + Math.random() * 200;
        
        noise.connect(filter);
        filter.connect(gain);
        
        noise.start(t);
        noise.stop(t + 0.06);
    }
    
    // ========================================
    // Sons de combate
    // ========================================
    
    playAttack() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.4);
        
        // Whoosh rápido
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, t);
        filter.frequency.exponentialRampToValueAtTime(200, t + 0.12);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        
        osc.start(t);
        osc.stop(t + 0.15);
    }
    
    playHit() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.5);
        
        // Impacto grave
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
        
        osc.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        
        osc.start(t);
        osc.stop(t + 0.12);
        
        // Ruído de impacto
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.createGain(this.sfxVolume * 0.3);
        noise.connect(noiseGain);
        noise.start(t);
        noise.stop(t + 0.05);
    }
    
    playDamage() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.4);
        
        // Tom descendente de dor
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        
        osc.start(t);
        osc.stop(t + 0.25);
    }
    
    // ========================================
    // Sons de coleta
    // ========================================
    
    playCollect() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.3);
        
        // Duas notas ascendentes agradáveis
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, t);         // C5
        osc.frequency.setValueAtTime(659, t + 0.06);   // E5
        osc.frequency.setValueAtTime(784, t + 0.12);   // G5
        
        osc.connect(gain);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, t + 0.01);
        gain.gain.setValueAtTime(this.sfxVolume * 0.3, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        
        osc.start(t);
        osc.stop(t + 0.25);
    }
    
    playCraft() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.35);
        
        // Sequência de marteladas
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800 + i * 200, t + i * 0.08);
            osc.frequency.exponentialRampToValueAtTime(200, t + i * 0.08 + 0.05);
            
            const noteGain = this.createGain(this.sfxVolume * 0.25);
            osc.connect(noteGain);
            noteGain.gain.setValueAtTime(0, t + i * 0.08);
            noteGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.25, t + i * 0.08 + 0.005);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.06);
            
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 0.06);
        }
    }
    
    playPlace() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.3);
        
        // Thunk grave de colocar
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);
        
        osc.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        
        osc.start(t);
        osc.stop(t + 0.15);
    }
    
    // ========================================
    // Sons de UI
    // ========================================
    
    playClick() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.2);
        
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 600;
        
        osc.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        
        osc.start(t);
        osc.stop(t + 0.05);
    }
    
    playOpen() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.25);
        
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        
        osc.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        
        osc.start(t);
        osc.stop(t + 0.12);
    }
    
    playClose() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.2);
        
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(250, t + 0.08);
        
        osc.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        
        osc.start(t);
        osc.stop(t + 0.1);
    }
    
    playEat() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.25);
        
        // Som de mastigação
        for (let i = 0; i < 2; i++) {
            const bufferSize = this.ctx.sampleRate * 0.04;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
                data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufferSize, 3);
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 800 + i * 400;
            filter.Q.value = 2;
            
            const noteGain = this.createGain(this.sfxVolume * 0.25);
            noise.connect(filter);
            filter.connect(noteGain);
            noise.start(t + i * 0.06);
            noise.stop(t + i * 0.06 + 0.04);
        }
    }
    
    playDrink() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.25);
        
        // Glug-glug
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300 + i * 50, t + i * 0.1);
            osc.frequency.exponentialRampToValueAtTime(150, t + i * 0.1 + 0.08);
            
            const noteGain = this.createGain(this.sfxVolume * 0.15);
            osc.connect(noteGain);
            noteGain.gain.setValueAtTime(0, t + i * 0.1);
            noteGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.15, t + i * 0.1 + 0.01);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.1);
            
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 0.1);
        }
    }
    
    // ========================================
    // Sons de inimigos
    // ========================================
    
    playWolfGrowl() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.25);
        
        // Rugido grave e rítmico
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.linearRampToValueAtTime(120, t + 0.3);
        osc.frequency.linearRampToValueAtTime(60, t + 0.6);
        
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 8;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 20;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.25, t + 0.1);
        gain.gain.setValueAtTime(this.sfxVolume * 0.25, t + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
        
        osc.start(t);
        lfo.start(t);
        osc.stop(t + 0.7);
        lfo.stop(t + 0.7);
    }
    
    playBearRoar() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.35);
        
        // Rugido de urso - grave e longo
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.2);
        osc.frequency.linearRampToValueAtTime(50, t + 0.8);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(200, t + 0.8);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.35, t + 0.15);
        gain.gain.setValueAtTime(this.sfxVolume * 0.35, t + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        
        osc.start(t);
        osc.stop(t + 1.0);
    }
    
    playEnemyDeath() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.3);
        
        // Descendente dramático
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.4);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        
        osc.start(t);
        osc.stop(t + 0.5);
    }
    
    // ========================================
    // Sons de ambientação
    // ========================================
    
    playBirdChirp() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.1);
        
        // Pio rápido e agudo
        for (let i = 0; i < 2; i++) {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(2000 + Math.random() * 1000, t + i * 0.1);
            osc.frequency.exponentialRampToValueAtTime(1500, t + i * 0.1 + 0.05);
            
            const noteGain = this.createGain(this.sfxVolume * 0.1);
            osc.connect(noteGain);
            noteGain.gain.setValueAtTime(0, t + i * 0.1);
            noteGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.1, t + i * 0.1 + 0.005);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.08);
            
            osc.start(t + i * 0.1);
            osc.stop(t + i * 0.1 + 0.08);
        }
    }
    
    playWaterDrip() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.12);
        
        // Ping de água
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);
        
        osc.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        
        osc.start(t);
        osc.stop(t + 0.2);
    }
    
    playWind() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        
        // Sopro de vento
        const bufferSize = this.ctx.sampleRate * 1.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const env = Math.sin(Math.PI * i / bufferSize);
            data[i] = (Math.random() * 2 - 1) * env * 0.3;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.5;
        
        const gain = this.createGain(this.sfxVolume * 0.08);
        noise.connect(filter);
        filter.connect(gain);
        
        noise.start(t);
    }
    
    // ========================================
    // Sons de eventos
    // ========================================
    
    playDayStart() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.3);
        
        // Fanfarra alegre ascendente
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const noteGain = this.createGain(this.sfxVolume * 0.2);
            osc.connect(noteGain);
            noteGain.gain.setValueAtTime(0, t + i * 0.12);
            noteGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, t + i * 0.12 + 0.01);
            noteGain.gain.setValueAtTime(this.sfxVolume * 0.15, t + i * 0.12 + 0.1);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.2);
            
            osc.start(t + i * 0.12);
            osc.stop(t + i * 0.12 + 0.2);
        });
    }
    
    playNightStart() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.3);
        
        // Fanfarra descendente sinistra
        const notes = [440, 370, 311, 220];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            const noteGain = this.createGain(this.sfxVolume * 0.2);
            osc.connect(noteGain);
            noteGain.gain.setValueAtTime(0, t + i * 0.2);
            noteGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, t + i * 0.2 + 0.01);
            noteGain.gain.setValueAtTime(this.sfxVolume * 0.15, t + i * 0.2 + 0.15);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.3);
            
            osc.start(t + i * 0.2);
            osc.stop(t + i * 0.2 + 0.3);
        });
    }
    
    playFullMoon() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.4);
        
        // Cordom sinistro
        const freqs = [220, 277, 330, 440];
        freqs.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const noteGain = this.createGain(this.sfxVolume * 0.1);
            osc.connect(noteGain);
            noteGain.gain.setValueAtTime(0, t);
            noteGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.1, t + 0.5);
            noteGain.gain.setValueAtTime(this.sfxVolume * 0.08, t + 2.0);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);
            
            osc.start(t);
            osc.stop(t + 3.0);
        });
    }
    
    playVictory() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.4);
        
        // Fanfarra de vitória
        const notes = [523, 659, 784, 1047, 784, 1047, 1319];
        const durations = [0.12, 0.12, 0.12, 0.25, 0.12, 0.12, 0.4];
        let time = 0;
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const noteGain = this.createGain(this.sfxVolume * 0.3);
            osc.connect(noteGain);
            noteGain.gain.setValueAtTime(0, t + time);
            noteGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, t + time + 0.01);
            noteGain.gain.setValueAtTime(this.sfxVolume * 0.25, t + time + durations[i] * 0.7);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + time + durations[i]);
            
            osc.start(t + time);
            osc.stop(t + time + durations[i]);
            time += durations[i];
        });
    }
    
    playGameOver() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.4);
        
        // Acorde descendente triste
        const notes = [330, 311, 262, 196];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const noteGain = this.createGain(this.sfxVolume * 0.2);
            osc.connect(noteGain);
            noteGain.gain.setValueAtTime(0, t + i * 0.3);
            noteGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, t + i * 0.3 + 0.02);
            noteGain.gain.setValueAtTime(this.sfxVolume * 0.15, t + i * 0.3 + 0.5);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.3 + 0.8);
            
            osc.start(t + i * 0.3);
            osc.stop(t + i * 0.3 + 0.8);
        });
    }
    
    playChildRescue() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.3);
        
        // Notas alegres
        const notes = [784, 988, 1175, 1568];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const noteGain = this.createGain(this.sfxVolume * 0.2);
            osc.connect(noteGain);
            noteGain.gain.setValueAtTime(0, t + i * 0.08);
            noteGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, t + i * 0.08 + 0.01);
            noteGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.15);
            
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 0.15);
        });
    }
    
    playTrap() {
        if (!this.enabled || !this.ctx) return;
        const t = this.now();
        const gain = this.createGain(this.sfxVolume * 0.35);
        
        // Snap de armadilha
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
        
        osc.connect(gain);
        gain.gain.setValueAtTime(this.sfxVolume * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        
        osc.start(t);
        osc.stop(t + 0.08);
        
        // Ruído de impacto
        const bufferSize = this.ctx.sampleRate * 0.04;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.createGain(this.sfxVolume * 0.4);
        noise.connect(noiseGain);
        noise.start(t);
        noise.stop(t + 0.04);
    }
    
    // ========================================
    // Música de fundo procedural
    // ========================================
    
    startMusic(isNight = false) {
        if (!this.enabled || !this.ctx) return;
        this.stopMusic();
        this.musicPlaying = true;
        
        if (isNight) {
            this.playNightAmbient();
        } else {
            this.playDayAmbient();
        }
    }
    
    stopMusic() {
        this.musicPlaying = false;
        this.musicNodes.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        this.musicNodes = [];
    }
    
    playDayAmbient() {
        if (!this.musicPlaying || !this.ctx) return;
        const t = this.now();
        
        // Padrão musical suave de dia
        const baseNotes = [262, 294, 330, 349, 392, 440, 494, 523];
        const gain = this.createGain(this.musicVolume * 0.15);
        
        // Notas aleatórias suaves
        const numNotes = 8;
        for (let i = 0; i < numNotes; i++) {
            const freq = baseNotes[Math.floor(Math.random() * baseNotes.length)];
            const octave = Math.random() > 0.5 ? 1 : 0.5;
            const noteTime = t + i * 0.6;
            
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq * octave;
            
            const noteGain = this.ctx.createGain();
            noteGain.gain.setValueAtTime(0, noteTime);
            noteGain.gain.linearRampToValueAtTime(this.musicVolume * 0.15, noteTime + 0.05);
            noteGain.gain.setValueAtTime(this.musicVolume * 0.1, noteTime + 0.3);
            noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.55);
            
            osc.connect(noteGain);
            noteGain.connect(this.ctx.destination);
            
            osc.start(noteTime);
            osc.stop(noteTime + 0.6);
            this.musicNodes.push(osc);
        }
        
        // Próximo ciclo
        setTimeout(() => {
            if (this.musicPlaying) this.playDayAmbient();
        }, numNotes * 600 + 1000);
    }
    
    playNightAmbient() {
        if (!this.musicPlaying || !this.ctx) return;
        const t = this.now();
        
        // Notas graves e sinistras
        const baseNotes = [110, 123, 131, 147, 165];
        const gain = this.createGain(this.musicVolume * 0.12);
        
        const numNotes = 6;
        for (let i = 0; i < numNotes; i++) {
            const freq = baseNotes[Math.floor(Math.random() * baseNotes.length)];
            const noteTime = t + i * 1.0;
            
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            const noteGain = this.ctx.createGain();
            noteGain.gain.setValueAtTime(0, noteTime);
            noteGain.gain.linearRampToValueAtTime(this.musicVolume * 0.12, noteTime + 0.1);
            noteGain.gain.setValueAtTime(this.musicVolume * 0.08, noteTime + 0.6);
            noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.95);
            
            osc.connect(noteGain);
            noteGain.connect(this.ctx.destination);
            
            osc.start(noteTime);
            osc.stop(noteTime + 1.0);
            this.musicNodes.push(osc);
        }
        
        setTimeout(() => {
            if (this.musicPlaying) this.playNightAmbient();
        }, numNotes * 1000 + 2000);
    }
    
    // ========================================
    // Ambient loop
    // ========================================
    
    startAmbientLoop() {
        if (!this.enabled || !this.ctx) return;
        
        // Pássaros aleatórios durante o dia
        this._ambientInterval = setInterval(() => {
            if (!this.musicPlaying) return;
            const hour = game && game.timeManager ? game.timeManager.hour : 12;
            if (hour >= 6 && hour < 20 && Math.random() < 0.3) {
                this.playBirdChirp();
            } else if (hour >= 20 || hour < 6) {
                if (Math.random() < 0.1) this.playWind();
            }
        }, 4000);
    }
    
    stopAmbientLoop() {
        if (this._ambientInterval) {
            clearInterval(this._ambientInterval);
            this._ambientInterval = null;
        }
    }
}

// Instância global
const audioManager = new AudioManager();
