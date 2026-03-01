let audioCtx;
let oscillatore;
let filtro;
let nodoVolume;
let inFunzione = false;

function toggleMotore() {
    // I browser richiedono un'interazione dell'utente per avviare l'AudioContext
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const btn = document.getElementById('accensioneBtn');
    const acceleratore = document.getElementById('acceleratore');

    if (inFunzione) {
        // Spegnimento
        oscillatore.stop();
        oscillatore.disconnect();
        inFunzione = false;
        
        btn.innerText = "Accendi Motore";
        btn.classList.remove('running');
        acceleratore.disabled = true;
        acceleratore.value = 800;
        aggiornaRPM(800);
    } else {
        // Accensione
        creaCircuitoAudio();
        inFunzione = true;
        
        btn.innerText = "Spegni Motore";
        btn.classList.add('running');
        acceleratore.disabled = false;
    }
}

function creaCircuitoAudio() {
    oscillatore = audioCtx.createOscillator();
    filtro = audioCtx.createBiquadFilter();
    nodoVolume = audioCtx.createGain();

    // Usiamo un'onda a dente di sega per un suono aspro e "meccanico"
    oscillatore.type = 'sawtooth';
    
    // Frequenza di base (minimo regime)
    oscillatore.frequency.value = 30; 

    // Il filtro passa-basso (lowpass) attutisce il suono per simulare lo scarico
    filtro.type = 'lowpass';
    filtro.frequency.value = 150; 
    filtro.Q.value = 5; // Aggiunge un po' di risonanza

    // Imposta un volume base
    nodoVolume.gain.value = 0.6;

    // Collega i nodi: Oscillatore -> Filtro -> Volume -> Casse
    oscillatore.connect(filtro);
    filtro.connect(nodoVolume);
    nodoVolume.connect(audioCtx.destination);

    oscillatore.start();
}

function aggiornaRPM(valore) {
    document.getElementById('rpmTesto').innerText = valore + " RPM";
    
    if (inFunzione && oscillatore) {
        // Mappa i giri motore (800-8000) alle frequenze dell'oscillatore (es. 30Hz - 150Hz)
        let frequenzaBase = 30 + ((valore - 800) / 7200) * 120;
        
        // Cambia fluidamente la frequenza
        oscillatore.frequency.setTargetAtTime(frequenzaBase, audioCtx.currentTime, 0.1);
        
        // Apriamo il filtro man mano che i giri salgono per un suono più acuto
        let frequenzaFiltro = 150 + ((valore - 800) / 7200) * 800;
        filtro.frequency.setTargetAtTime(frequenzaFiltro, audioCtx.currentTime, 0.1);
    }
}
