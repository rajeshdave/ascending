/* ==========================================================================
   🎮 NUMBER CLIMBER - GAME LOGIC & AUDIO SYNTHESIS
   ========================================================================== */

// --- GAME STATE ---
const state = {
    gameMode: 'ascending', // 'ascending' or 'descending'
    currentLevel: 1,
    correctSequence: [],
    shuffledSequence: [],
    placedCount: 0,
    isMuted: false,
    mascotEmoji: '🐵',
    activeConfetti: false,
    audioContext: null,
};

// Mascot options to keep the game fun and fresh
const MASCOTS = ['🐵', '🐸', '🐼', '🐨', '🦁', '🐯', '🐰', '🦄', '🐧'];

// Level Configurations
const LEVEL_CONFIGS = {
    1: { min: 1, max: 10, count: 3, label: "1 to 10" },
    2: { min: 11, max: 20, count: 4, label: "11 to 20" },
    3: { min: 1, max: 30, count: 4, label: "1 to 30" },
    4: { min: 31, max: 60, count: 5, label: "31 to 60" },
    5: { min: 1, max: 100, count: 5, label: "1 to 100" }
};

// --- DOM ELEMENTS ---
const screens = {
    lobby: document.getElementById('lobby-screen'),
    play: document.getElementById('play-screen'),
    victory: document.getElementById('victory-screen'),
};

const buttons = {
    ascending: document.getElementById('btn-ascending'),
    descending: document.getElementById('btn-descending'),
    home: document.getElementById('btn-home'),
    mute: document.getElementById('btn-mute'),
    prevLevel: document.getElementById('btn-prev-level'),
    replay: document.getElementById('btn-replay'),
    nextLevel: document.getElementById('btn-next-level'),
};

const elements = {
    instruction: document.getElementById('instruction-text'),
    track: document.getElementById('visual-track'),
    mascot: document.getElementById('mascot-avatar'),
    bubblesContainer: document.getElementById('bubbles-container'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    victoryMascot: document.querySelector('.victory-mascot'),
    levelBtns: document.querySelectorAll('.level-btn'),
};

// ==========================================================================
// 🔊 SOUND EFFECTS GENERATION (Web Audio API)
// ==========================================================================
function initAudio() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSynthSound(type) {
    if (state.isMuted) return;
    initAudio();
    if (!state.audioContext) return;

    // Resume context if suspended (browser security auto-suspends)
    if (state.audioContext.state === 'suspended') {
        state.audioContext.resume();
    }

    const ctx = state.audioContext;
    const now = ctx.currentTime;

    switch (type) {
        case 'click': {
            // High-pitched happy pop
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            
            osc.start(now);
            osc.stop(now + 0.1);
            break;
        }
        case 'correct': {
            // Satisfying upward chime (two-note arpeggio)
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);

                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.3);
            });
            break;
        }
        case 'wrong': {
            // Low pitch buzz sliding down (boing/oops)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.3);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

            osc.start(now);
            osc.stop(now + 0.3);
            break;
        }
        case 'victory': {
            // A major chord arpeggio going up and down
            const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 to C6
            chord.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.07 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.3);

                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.35);
            });
            break;
        }
    }
}

// ==========================================================================
// 🗣️ TEXT-TO-SPEECH (Web Speech API)
// ==========================================================================
function speakText(text) {
    if (state.isMuted) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower, child-friendly pace
    utterance.pitch = 1.3; // Higher, friendlier tone

    // Try to get a high-quality female or friendly sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Samantha')) && 
        v.lang.startsWith('en')
    );
    if (friendlyVoice) {
        utterance.voice = friendlyVoice;
    }

    window.speechSynthesis.speak(utterance);
}

// ==========================================================================
// 🛠️ HELPER FUNCTIONS (Math & Setup)
// ==========================================================================

// Generate random unique numbers in a range
function generateRandomNumbers(min, max, count) {
    const pool = [];
    for (let i = min; i <= max; i++) {
        pool.push(i);
    }
    
    const selected = [];
    for (let i = 0; i < count; i++) {
        if (pool.length === 0) break;
        const randomIndex = Math.floor(Math.random() * pool.length);
        selected.push(pool.splice(randomIndex, 1)[0]);
    }
    
    return selected;
}

// Shuffle an array
function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// Change screen view
function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
    });
    screens[screenKey].classList.add('active');
    
    if (screenKey === 'victory') {
        state.activeConfetti = true;
        initConfetti();
    } else {
        state.activeConfetti = false;
    }
}

// ==========================================================================
// 🪜 GAME INITIALIZATION & TRACK GENERATION
// ==========================================================================
function startLevel(levelNum) {
    state.currentLevel = levelNum;
    state.placedCount = 0;
    
    // Update level button visuals
    elements.levelBtns.forEach(btn => {
        const btnLevel = parseInt(btn.getAttribute('data-level'));
        if (btnLevel === levelNum) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const config = LEVEL_CONFIGS[levelNum];
    
    // Pick numbers
    const rawNumbers = generateRandomNumbers(config.min, config.max, config.count);
    
    // Sort correctly depending on mode
    if (state.gameMode === 'ascending') {
        state.correctSequence = [...rawNumbers].sort((a, b) => a - b);
    } else {
        state.correctSequence = [...rawNumbers].sort((a, b) => b - a);
    }

    // Shuffle for bubbles selection
    state.shuffledSequence = shuffleArray(rawNumbers);

    // Build the visual steps
    buildTrackSteps(config.count);
    
    // Generate bubbles
    buildBubbles();

    // Position Mascot at start
    positionMascotAtStart();

    // Set voice instruction and text
    const directionWord = state.gameMode === 'ascending' ? "smallest to biggest" : "biggest to smallest";
    const rangeWord = `from ${config.min} to ${config.max}`;
    const voiceText = `Level ${levelNum}. Put the numbers in order from ${directionWord}!`;
    const headerText = `Arrange numbers from ${directionWord} (${config.label})`;
    
    elements.instruction.innerText = headerText;
    speakText(voiceText);
}

function buildTrackSteps(count) {
    // Clear previous steps (except mascot avatar)
    const steps = elements.track.querySelectorAll('.track-step');
    steps.forEach(s => s.remove());

    // Generate steps
    for (let i = 0; i < count; i++) {
        const step = document.createElement('div');
        step.classList.add('track-step');
        step.setAttribute('data-index', i);

        // Compute step heights dynamically:
        // Ascending mode: Stairs climb from left to right (height 25% to 90%)
        // Descending mode: Slide slope goes down from left to right (height 90% to 25%)
        let stepHeight;
        if (state.gameMode === 'ascending') {
            stepHeight = 25 + (i * (65 / (count - 1)));
        } else {
            stepHeight = 90 - (i * (65 / (count - 1)));
        }
        step.style.height = `${stepHeight}%`;

        // Inner elements
        const hintSpan = document.createElement('span');
        hintSpan.classList.add('track-step-hint');
        hintSpan.innerText = `Step ${i + 1}`;
        step.appendChild(hintSpan);

        const numberDiv = document.createElement('div');
        numberDiv.classList.add('track-step-number');
        numberDiv.innerText = '?';
        step.appendChild(numberDiv);

        elements.track.appendChild(step);
    }

    // Adjust slide visual styling if descending
    if (state.gameMode === 'descending') {
        elements.track.className = "track-descending";
    } else {
        elements.track.className = "track-ascending";
    }
}

function buildBubbles() {
    elements.bubblesContainer.innerHTML = '';
    
    state.shuffledSequence.forEach(num => {
        const bubble = document.createElement('div');
        bubble.classList.add('num-bubble');
        bubble.innerText = num;
        bubble.setAttribute('data-value', num);
        
        // Touch/Click interaction
        bubble.addEventListener('click', () => handleBubbleClick(bubble, num));
        
        elements.bubblesContainer.appendChild(bubble);
    });
}

function positionMascotAtStart() {
    elements.mascot.innerText = state.mascotEmoji;
    
    // We delay the position calculation slightly to let the browser complete its layout render pass
    setTimeout(() => {
        const firstStep = elements.track.querySelector('.track-step[data-index="0"]');
        if (firstStep) {
            // Position slightly to the left/bottom of the first step
            const stepRect = firstStep.getBoundingClientRect();
            const trackRect = elements.track.getBoundingClientRect();

            const bottomPos = 12; // Relative to track bottom border
            const leftPos = (stepRect.left - trackRect.left) - 50; // offset left

            elements.mascot.style.bottom = `${bottomPos}px`;
            elements.mascot.style.left = `${Math.max(10, leftPos)}px`;
        }
    }, 50);
}

function animateMascotToStep(stepIndex) {
    // Delay calculations to ensure visual updates are completed and sizes are stable
    setTimeout(() => {
        const step = elements.track.querySelector(`.track-step[data-index="${stepIndex}"]`);
        if (!step) return;

        const stepRect = step.getBoundingClientRect();
        const trackRect = elements.track.getBoundingClientRect();

        // Position mascot centered on top of the correct step
        const bottomPos = (trackRect.bottom - stepRect.top) + 5; // sit on top
        const leftPos = (stepRect.left - trackRect.left) + (stepRect.width / 2) - 28; // center horizontally

        elements.mascot.style.bottom = `${bottomPos}px`;
        elements.mascot.style.left = `${leftPos}px`;
        
        // Add hop scale effect
        elements.mascot.style.transform = "scale(1.3) translateY(-10px)";
        setTimeout(() => {
            elements.mascot.style.transform = "scale(1) translateY(0)";
        }, 300);
    }, 50);
}

// ==========================================================================
// 🎯 GAME INTERACTION & WIN STATE
// ==========================================================================
function handleBubbleClick(bubbleEl, selectedNumber) {
    if (bubbleEl.classList.contains('pop-out')) return;

    // Check if correct next number
    const expectedNumber = state.correctSequence[state.placedCount];
    
    if (selectedNumber === expectedNumber) {
        // --- CORRECT ANSWER ---
        playSynthSound('correct');
        
        // 1. Pop bubble out of choices
        bubbleEl.classList.add('pop-out');
        
        // 2. Find step and place number
        const stepIndex = state.placedCount;
        const targetStep = elements.track.querySelector(`.track-step[data-index="${stepIndex}"]`);
        
        if (targetStep) {
            targetStep.classList.add('filled');
            const numDisplay = targetStep.querySelector('.track-step-number');
            numDisplay.innerText = selectedNumber;
        }

        // 3. Move mascot to the step
        animateMascotToStep(stepIndex);
        
        state.placedCount++;

        // 4. Check level win condition
        if (state.placedCount === state.correctSequence.length) {
            setTimeout(triggerLevelWin, 1000);
        } else {
            // Speak encouraging prompt
            const encouragement = ["Good job!", "Way to go!", "Yes!", "Perfect!"];
            const phrase = encouragement[Math.floor(Math.random() * encouragement.length)];
            speakText(phrase);
        }
    } else {
        // --- INCORRECT ANSWER ---
        playSynthSound('wrong');
        
        // Shake bubble card
        bubbleEl.classList.add('shake-animation');
        setTimeout(() => {
            bubbleEl.classList.remove('shake-animation');
        }, 500);

        // Vocal hints to scaffold learning
        let hintSpeech = "";
        if (state.gameMode === 'ascending') {
            hintSpeech = `Oops! Try looking for the smallest number, which is ${expectedNumber}.`;
        } else {
            hintSpeech = `Oops! Try looking for the biggest number, which is ${expectedNumber}.`;
        }
        speakText(hintSpeech);
    }
}

function triggerLevelWin() {
    playSynthSound('victory');
    
    // Set mascot emoji on victory screen
    elements.victoryMascot.innerText = state.mascotEmoji;

    // Voice celebration
    const winPhrases = [
        `Outstanding! You finished Level ${state.currentLevel}!`,
        `Super job! You are amazing!`,
        `Hooray! You did it correctly!`
    ];
    speakText(winPhrases[Math.floor(Math.random() * winPhrases.length)]);

    // Configure Navigation buttons based on limits
    buttons.prevLevel.style.display = state.currentLevel > 1 ? 'block' : 'none';
    buttons.nextLevel.style.display = state.currentLevel < 5 ? 'block' : 'none';

    showScreen('victory');
}

// ==========================================================================
// 🎨 CONFETTI ENGINE (Canvas-based)
// ==========================================================================
let confettiParticles = [];
function initConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    
    // Set size to window size
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    confettiParticles = [];
    const colors = [
        '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f43', '#a1c4fd', '#c2e9fb', '#f368e0'
    ];

    for (let i = 0; i < 120; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2
        });
    }

    function animate() {
        if (!state.activeConfetti) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confettiParticles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            // Loop particles back to top if they fall off
            if (p.y > canvas.height) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// Re-size canvas dynamically on window resizing
window.addEventListener('resize', () => {
    if (state.activeConfetti) {
        elements.confettiCanvas.width = elements.confettiCanvas.parentElement.clientWidth;
        elements.confettiCanvas.height = elements.confettiCanvas.parentElement.clientHeight;
    }
});

// ==========================================================================
// 🎮 GENERAL EVENT HANDLERS & INITIALIZATION
// ==========================================================================

// 1. Mode selection from lobby
buttons.ascending.addEventListener('click', () => {
    initAudio();
    playSynthSound('click');
    state.gameMode = 'ascending';
    state.mascotEmoji = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    showScreen('play');
    startLevel(1);
});

buttons.descending.addEventListener('click', () => {
    initAudio();
    playSynthSound('click');
    state.gameMode = 'descending';
    state.mascotEmoji = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    showScreen('play');
    startLevel(1);
});

// 2. Navigation
buttons.home.addEventListener('click', () => {
    playSynthSound('click');
    window.speechSynthesis.cancel();
    showScreen('lobby');
});

// 3. Level Top Bar selector
elements.levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const level = parseInt(btn.getAttribute('data-level'));
        playSynthSound('click');
        startLevel(level);
    });
});

// 4. Mute toggle
buttons.mute.addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    if (state.isMuted) {
        buttons.mute.innerText = '🔇 Mute';
        buttons.mute.style.opacity = '0.7';
        window.speechSynthesis.cancel();
    } else {
        buttons.mute.innerText = '🔊 Audio';
        buttons.mute.style.opacity = '1';
        initAudio();
        speakText("Sound is back on!");
    }
});

// 5. Victory navigation
buttons.prevLevel.addEventListener('click', () => {
    playSynthSound('click');
    if (state.currentLevel > 1) {
        showScreen('play');
        // Choose a new random mascot for the next round
        state.mascotEmoji = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
        startLevel(state.currentLevel - 1);
    }
});

buttons.replay.addEventListener('click', () => {
    playSynthSound('click');
    showScreen('play');
    // Fresh mascot on retry
    state.mascotEmoji = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    startLevel(state.currentLevel);
});

buttons.nextLevel.addEventListener('click', () => {
    playSynthSound('click');
    if (state.currentLevel < 5) {
        showScreen('play');
        // Choose a new random mascot for the next round
        state.mascotEmoji = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
        startLevel(state.currentLevel + 1);
    }
});

// Ensure voices are loaded (browser quirks)
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
}
