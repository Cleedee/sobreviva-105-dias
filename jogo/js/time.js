/**
 * TimeManager - Sistema de ciclo dia/noite
 */

class TimeManager {
    constructor() {
        this.day = 1;
        this.totalNights = 0;
        this.timeOfDay = 0; // 0-1 (0 = meia-noite, 0.5 = meio-dia)
        
        this.dayDuration = GAME_CONFIG.DAY_DURATION;
        this.nightDuration = GAME_CONFIG.NIGHT_DURATION;
        
        this.isNight = false;
        this.isFullMoon = false;
        
        this.callbacks = {
            onDayChange: [],
            onNightStart: [],
            onDayStart: [],
            onFullMoon: []
        };
    }
    
    update(deltaTime) {
        // Avançar tempo
        const speed = 1 / (this.isNight ? this.nightDuration : this.dayDuration);
        this.timeOfDay += speed * deltaTime;
        
        // Verificar transição dia/noite
        if (this.timeOfDay >= 1) {
            this.timeOfDay = 0;
            
            if (this.isNight) {
                // Terminou a noite, começar dia
                this.isNight = false;
                this.day++;
                this.totalNights++;
                
                // Verificar lua cheia
                if (this.totalNights % GAME_CONFIG.FULL_MOON_INTERVAL === 0) {
                    this.isFullMoon = true;
                    this.triggerCallbacks('onFullMoon');
                } else {
                    this.isFullMoon = false;
                }
                
                this.triggerCallbacks('onDayStart');
                this.triggerCallbacks('onDayChange', this.day);
            } else {
                // Terminou o dia, começar noite
                this.isNight = true;
                this.triggerCallbacks('onNightStart');
            }
        }
    }
    
    // Obter brilho (0 = escuro, 1 = claro)
    getBrightness() {
        if (this.isNight) {
            // Noite: escuro com lua
            return this.isFullMoon ? 0.3 : 0.15;
        }
        
        // Dia: ciclo suave
        const t = this.timeOfDay;
        if (t < 0.25) {
            // Madrugada (0-0.25)
            return MathUtils.lerp(0.2, 1, t / 0.25);
        } else if (t < 0.75) {
            // Dia (0.25-0.75)
            return 1;
        } else {
            // Entardecer (0.75-1)
            return MathUtils.lerp(1, 0.2, (t - 0.75) / 0.25);
        }
    }
    
    // Obter cor do céu
    getSkyColor() {
        const brightness = this.getBrightness();
        
        if (this.isNight) {
            return this.isFullMoon ? 
                { r: 30, g: 40, b: 80 } : 
                { r: 10, g: 15, b: 40 };
        }
        
        const t = this.timeOfDay;
        if (t < 0.25) {
            // Madrugada
            const p = t / 0.25;
            return {
                r: MathUtils.lerp(40, 135, p),
                g: MathUtils.lerp(50, 206, p),
                b: MathUtils.lerp(80, 235, p)
            };
        } else if (t < 0.75) {
            // Dia
            return { r: 135, g: 206, b: 235 };
        } else {
            // Entardecer
            const p = (t - 0.75) / 0.25;
            return {
                r: MathUtils.lerp(135, 80, p),
                g: MathUtils.lerp(206, 50, p),
                b: MathUtils.lerp(235, 100, p)
            };
        }
    }
    
    // Obter nome do período
    getPeriodName() {
        if (this.isNight) {
            return this.isFullMoon ? 'Lua Cheia' : 'Noite';
        }
        
        const t = this.timeOfDay;
        if (t < 0.25) return 'Madrugada';
        if (t < 0.5) return 'Manhã';
        if (t < 0.75) return 'Tarde';
        return 'Entardecer';
    }
    
    // Obter ícone
    getIcon() {
        if (this.isNight) {
            return this.isFullMoon ? '🌕' : '🌙';
        }
        
        const t = this.timeOfDay;
        if (t < 0.25) return '🌅';
        if (t < 0.75) return '☀️';
        return '🌇';
    }
    
    // Registrar callback
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    // Disparar callbacks
    triggerCallbacks(event, ...args) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(cb => cb(...args));
        }
    }
    
    // Verificar se é lua cheia
    isMoonActive() {
        return this.isFullMoon;
    }
    
    // Obter progresso do dia (0-1)
    getDayProgress() {
        return this.isNight ? 
            0.5 + this.timeOfDay * 0.5 : 
            this.timeOfDay * 0.5;
    }
}
