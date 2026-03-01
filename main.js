import { EngineSoundSystem } from './audioEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    // Elementi DOM
    const btnIgnition = document.getElementById('btn-ignition');
    const btnIdle = document.getElementById('btn-idle');
    const btnRev = document.getElementById('btn-rev');
    const btnAccel = document.getElementById('btn-accel');
    const rpmDisplay = document.getElementById('rpm-display');
    const needle = document.getElementById('needle');

    // Inizializza il motore audio passando una funzione che si attiverà ad ogni frame
    const engine = new EngineSoundSystem((rpm, isPlaying) => {
        // Aggiorna il testo digitale
        rpmDisplay.innerText = Math.round(Math.max(0, rpm)).toString().padStart(4, '0');
        
        // Calcola e aggiorna la rotazione della lancetta
        const maxRpm = 8000;
        const normalizedRpm = Math.min(Math.max(rpm, 0), maxRpm);
        const rotation = -135 + (normalizedRpm / maxRpm) * 270;
        needle.style.transform = `rotate(${rotation}deg)`;

        // Gestisce lo stato dei pulsanti e del cruscotto
        if (isPlaying) {
            btnIgnition.innerText = 'Stop Engine';
            btnIgnition.classList.add('is-playing');
            btnIdle.disabled = false;
            btnRev.disabled = false;
            btnAccel.disabled = false;
        } else {
            btnIgnition.innerText = 'Ignition';
            btnIgnition.classList.remove('is-playing');
            btnIdle.disabled = true;
            btnRev.disabled = true;
            btnAccel.disabled = true;
        }
    });

    // Event Listeners per i pulsanti
    btnIgnition.addEventListener('click', () => {
        if (engine.isPlaying) {
            engine.stopEngine();
        } else {
            engine.startEngine();
        }
    });

    btnIdle.addEventListener('click', () => {
        if (engine.isPlaying) engine.setTargetRpm(800);
    });

    btnRev.addEventListener('click', () => {
        if (engine.isPlaying) {
            engine.setTargetRpm(4500);
            setTimeout(() => {
                if(engine.isPlaying) engine.setTargetRpm(800);
            }, 400); // Sgasata veloce
        }
    });

    // Gestione complessa del pedale dell'acceleratore (mouse e touch)
    const handleAccelerate = (e) => {
        e.preventDefault(); // Previene lo scrolling della pagina su mobile
        if (engine.isPlaying) engine.setTargetRpm(7500);
    };

    const handleRelease = (e) => {
        e.preventDefault();
        if (engine.isPlaying) engine.setTargetRpm(800);
    };

    // Eventi Mouse
    btnAccel.addEventListener('mousedown', handleAccelerate);
    btnAccel.addEventListener('mouseup', handleRelease);
    btnAccel.addEventListener('mouseleave', handleRelease); // Se il cursore esce dal pulsante
    
    // Eventi Touch (ottimizzati per dispositivi mobili)
    btnAccel.addEventListener('touchstart', handleAccelerate, { passive: false });
    btnAccel.addEventListener('touchend', handleRelease, { passive: false });
});document.addEventListener('DOMContentLoaded', () => {
    // Elementi DOM
    const btnIgnition = document.getElementById('btn-ignition');
    const btnIdle = document.getElementById('btn-idle');
    const btnRev = document.getElementById('btn-rev');
    const btnAccel = document.getElementById('btn-accel');
    const rpmDisplay = document.getElementById('rpm-display');
    const needle = document.getElementById('needle');

    // Inizializza il motore audio passando una funzione che si attiverà ad ogni frame
    const engine = new EngineSoundSystem((rpm, isPlaying) => {
        // Aggiorna il testo digitale
        rpmDisplay.innerText = Math.round(Math.max(0, rpm)).toString().padStart(4, '0');
        
        // Calcola e aggiorna la rotazione della lancetta
        const maxRpm = 8000;
        const normalizedRpm = Math.min(Math.max(rpm, 0), maxRpm);
        const rotation = -135 + (normalizedRpm / maxRpm) * 270;
        needle.style.transform = `rotate(${rotation}deg)`;

        // Gestisce lo stato dei pulsanti e del cruscotto
        if (isPlaying) {
            btnIgnition.innerText = 'Stop Engine';
            btnIgnition.classList.add('is-playing');
            btnIdle.disabled = false;
            btnRev.disabled = false;
            btnAccel.disabled = false;
        } else {
            btnIgnition.innerText = 'Ignition';
            btnIgnition.classList.remove('is-playing');
            btnIdle.disabled = true;
            btnRev.disabled = true;
            btnAccel.disabled = true;
        }
    });

    // Event Listeners per i pulsanti
    btnIgnition.addEventListener('click', () => {
        if (engine.isPlaying) {
            engine.stopEngine();
        } else {
            engine.startEngine();
        }
    });

    btnIdle.addEventListener('click', () => {
        if (engine.isPlaying) engine.setTargetRpm(800);
    });

    btnRev.addEventListener('click', () => {
        if (engine.isPlaying) {
            engine.setTargetRpm(4500);
            setTimeout(() => {
                if(engine.isPlaying) engine.setTargetRpm(800);
            }, 400); // Sgasata veloce
        }
    });

    // Gestione complessa del pedale dell'acceleratore (mouse e touch)
    const handleAccelerate = (e) => {
        e.preventDefault(); // Previene comportamenti strani su mobile
        if (engine.isPlaying) engine.setTargetRpm(7500);
    };

    const handleRelease = (e) => {
        e.preventDefault();
        if (engine.isPlaying) engine.setTargetRpm(800);
    };

    btnAccel.addEventListener('mousedown', handleAccelerate);
    btnAccel.addEventListener('mouseup', handleRelease);
    btnAccel.addEventListener('mouseleave', handleRelease); // Se il mouse esce dal pulsante
    
    // Supporto per schermi touch
    btnAccel.addEventListener('touchstart', handleAccelerate);
    btnAccel.addEventListener('touchend', handleRelease);
});
