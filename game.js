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
    // Tutorial State
    tutorialMode: 'ascending',
    isTutorialPlaying: false,
    tutorialTimerIds: []
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
    tutorial: document.getElementById('tutorial-screen'),
    naamJap: document.getElementById('naam-jap-screen'),
};

const buttons = {
    ascending: document.getElementById('btn-ascending'),
    descending: document.getElementById('btn-descending'),
    home: document.getElementById('btn-home'),
    mute: document.getElementById('btn-mute'),
    prevLevel: document.getElementById('btn-prev-level'),
    replay: document.getElementById('btn-replay'),
    nextLevel: document.getElementById('btn-next-level'),
    // Tutorial Buttons
    tutorial: document.getElementById('btn-tutorial'),
    tutHome: document.getElementById('btn-tutorial-home'),
    tutMute: document.getElementById('btn-tutorial-mute'),
    tutAsc: document.getElementById('btn-tut-ascending'),
    tutDesc: document.getElementById('btn-tut-descending'),
    tutPlay: document.getElementById('btn-play-tutorial'),
    tutPlayGame: document.getElementById('btn-tut-play-game'),
    // Naam Jap Buttons
    naamJap: document.getElementById('btn-naam-jap'),
    naamJapHome: document.getElementById('btn-naam-jap-home'),
    naamJapMute: document.getElementById('btn-naam-jap-mute'),
};

const elements = {
    instruction: document.getElementById('instruction-text'),
    track: document.getElementById('visual-track'),
    mascot: document.getElementById('mascot-avatar'),
    bubblesContainer: document.getElementById('bubbles-container'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    victoryMascot: document.querySelector('.victory-mascot'),
    levelBtns: document.querySelectorAll('.level-btn'),
    // Tutorial Elements
    tutText: document.getElementById('tutorial-text'),
    tutTrack: document.getElementById('tutorial-track'),
    tutMascot: document.getElementById('tutorial-mascot'),
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
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.35);

                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.35);
            });
            break;
        }
        case 'bead': {
            // Short wooden bead click
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            
            osc.start(now);
            osc.stop(now + 0.05);
            break;
        }
        case 'bowl': {
            // Tibetan singing bowl chime (rich multi-frequency resonant sound)
            const frequencies = [180, 271, 362, 545, 728];
            const duration = 4.0;
            
            frequencies.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                
                if (index > 0) {
                    osc.detune.setValueAtTime((Math.random() - 0.5) * 15, now);
                }
                
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.12 / frequencies.length, now + 0.25);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
                
                osc.start(now);
                osc.stop(now + duration + 0.5);
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
// 📖 TUTORIAL ENGINE
// ==========================================================================
function initTutorial(mode) {
    stopTutorialAnimation();
    state.tutorialMode = mode;
    
    // Set tabs active
    if (mode === 'ascending') {
        buttons.tutAsc.classList.add('active');
        buttons.tutDesc.classList.remove('active');
        elements.tutText.innerText = "Ascending means numbers go UP from smallest to biggest!";
        elements.tutTrack.className = "track-ascending";
    } else {
        buttons.tutAsc.classList.remove('active');
        buttons.tutDesc.classList.add('active');
        elements.tutText.innerText = "Descending means numbers go DOWN from biggest to smallest!";
        elements.tutTrack.className = "track-descending";
    }

    // Build 5 fixed steps
    buildTutorialSteps();
    
    // Position mascot
    positionTutorialMascotAtStart();

    buttons.tutPlay.innerText = "▶️ Watch Tutorial";
    
    const explanation = mode === 'ascending' 
        ? "Let's learn Ascending numbers. Ascending means going up from smallest to biggest. Click watch to see how!" 
        : "Let's learn Descending numbers. Descending means sliding down from biggest to smallest. Click watch to see how!";
    speakText(explanation);
}

function buildTutorialSteps() {
    // Clear previous
    const steps = elements.tutTrack.querySelectorAll('.track-step');
    steps.forEach(s => s.remove());

    const count = 5;
    for (let i = 0; i < count; i++) {
        const step = document.createElement('div');
        step.classList.add('track-step');
        step.setAttribute('data-index', i);

        let stepHeight;
        if (state.tutorialMode === 'ascending') {
            stepHeight = 25 + (i * (65 / (count - 1)));
        } else {
            stepHeight = 90 - (i * (65 / (count - 1)));
        }
        step.style.height = `${stepHeight}%`;

        const hintSpan = document.createElement('span');
        hintSpan.classList.add('track-step-hint');
        hintSpan.innerText = `Step ${i + 1}`;
        step.appendChild(hintSpan);

        const numberDiv = document.createElement('div');
        numberDiv.classList.add('track-step-number');
        numberDiv.innerText = '?';
        step.appendChild(numberDiv);

        elements.tutTrack.appendChild(step);
    }
}

function positionTutorialMascotAtStart() {
    elements.tutMascot.innerText = state.mascotEmoji;
    
    setTimeout(() => {
        const firstStep = elements.tutTrack.querySelector('.track-step[data-index="0"]');
        if (firstStep) {
            const stepRect = firstStep.getBoundingClientRect();
            const trackRect = elements.tutTrack.getBoundingClientRect();

            const bottomPos = 12;
            const leftPos = (stepRect.left - trackRect.left) - 50;

            elements.tutMascot.style.bottom = `${bottomPos}px`;
            elements.tutMascot.style.left = `${Math.max(10, leftPos)}px`;
        }
    }, 50);
}

function animateTutorialMascotToStep(stepIndex) {
    const step = elements.tutTrack.querySelector(`.track-step[data-index="${stepIndex}"]`);
    if (!step) return;

    const stepRect = step.getBoundingClientRect();
    const trackRect = elements.tutTrack.getBoundingClientRect();

    const bottomPos = (trackRect.bottom - stepRect.top) + 5;
    const leftPos = (stepRect.left - trackRect.left) + (stepRect.width / 2) - 28;

    elements.tutMascot.style.bottom = `${bottomPos}px`;
    elements.tutMascot.style.left = `${leftPos}px`;
    
    elements.tutMascot.style.transform = "scale(1.3) translateY(-10px)";
    setTimeout(() => {
        elements.tutMascot.style.transform = "scale(1) translateY(0)";
    }, 300);
}

function stopTutorialAnimation() {
    // Clear all scheduled timeouts
    state.tutorialTimerIds.forEach(id => clearTimeout(id));
    state.tutorialTimerIds = [];
    state.isTutorialPlaying = false;
    buttons.tutPlay.innerText = "▶️ Watch Tutorial";
    window.speechSynthesis.cancel();
}

function runTutorialAnimation() {
    if (state.isTutorialPlaying) {
        stopTutorialAnimation();
        initTutorial(state.tutorialMode);
        return;
    }

    state.isTutorialPlaying = true;
    buttons.tutPlay.innerText = "⏹️ Stop Tutorial";

    // Clear steps
    const steps = elements.tutTrack.querySelectorAll('.track-step');
    steps.forEach(step => {
        step.classList.remove('filled');
        step.querySelector('.track-step-number').innerText = '?';
    });
    positionTutorialMascotAtStart();

    const sequence = state.tutorialMode === 'ascending' ? [1, 2, 3, 4, 5] : [5, 4, 3, 2, 1];
    
    // Narrate start
    const introSpeech = state.tutorialMode === 'ascending'
        ? "Let's count up from smallest to biggest! Ready?"
        : "Let's count down from biggest to smallest! Ready?";
    speakText(introSpeech);

    let delay = 3000; // Let the intro read

    sequence.forEach((num, idx) => {
        const tId = setTimeout(() => {
            // Fill step
            const step = steps[idx];
            step.classList.add('filled');
            step.querySelector('.track-step-number').innerText = num;

            // Animate mascot
            animateTutorialMascotToStep(idx);
            playSynthSound('correct');

            // Speak the number
            speakText(`${num}`);
        }, delay);
        state.tutorialTimerIds.push(tId);
        delay += 1500;
    });

    // Final celebration
    const tIdFinal = setTimeout(() => {
        playSynthSound('victory');
        const finalSpeech = state.tutorialMode === 'ascending'
            ? "Look! The numbers go up: One, Two, Three, Four, Five. That is Ascending!"
            : "Look! The numbers go down: Five, Four, Three, Two, One. That is Descending!";
        
        elements.tutText.innerText = state.tutorialMode === 'ascending'
            ? "🌟 1, 2, 3, 4, 5 are Ascending numbers!"
            : "🌟 5, 4, 3, 2, 1 are Descending numbers!";
            
        speakText(finalSpeech);
        
        // Quick visual jump celebration
        elements.tutMascot.classList.add('celebrate-animation');
        
        setTimeout(() => {
            elements.tutMascot.classList.remove('celebrate-animation');
            stopTutorialAnimation();
        }, 5000);

    }, delay);
    state.tutorialTimerIds.push(tIdFinal);
}

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

buttons.tutorial.addEventListener('click', () => {
    initAudio();
    playSynthSound('click');
    showScreen('tutorial');
    state.mascotEmoji = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    initTutorial('ascending');
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
    syncMuteState();
    if (!state.isMuted) {
        speakText("Sound is back on!");
    }
});

// 5. Victory navigation
buttons.prevLevel.addEventListener('click', () => {
    playSynthSound('click');
    if (state.currentLevel > 1) {
        showScreen('play');
        state.mascotEmoji = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
        startLevel(state.currentLevel - 1);
    }
});

buttons.replay.addEventListener('click', () => {
    playSynthSound('click');
    showScreen('play');
    state.mascotEmoji = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    startLevel(state.currentLevel);
});

buttons.nextLevel.addEventListener('click', () => {
    playSynthSound('click');
    if (state.currentLevel < 5) {
        showScreen('play');
        state.mascotEmoji = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
        startLevel(state.currentLevel + 1);
    }
});

// 6. Tutorial screen navigation
buttons.tutHome.addEventListener('click', () => {
    playSynthSound('click');
    stopTutorialAnimation();
    showScreen('lobby');
});

buttons.tutMute.addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    syncMuteState();
    if (!state.isMuted) {
        speakText("Sound is back on!");
    }
});

buttons.tutAsc.addEventListener('click', () => {
    playSynthSound('click');
    initTutorial('ascending');
});

buttons.tutDesc.addEventListener('click', () => {
    playSynthSound('click');
    initTutorial('descending');
});

buttons.tutPlay.addEventListener('click', () => {
    playSynthSound('click');
    runTutorialAnimation();
});

buttons.tutPlayGame.addEventListener('click', () => {
    playSynthSound('click');
    stopTutorialAnimation();
    state.gameMode = state.tutorialMode;
    showScreen('play');
    startLevel(1);
});

// Ensure voices are loaded (browser quirks)
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
}

// ==========================================================================
// 🔊 MUTE STATE SYNCHRONIZATION HELPERS
// ==========================================================================
function syncMuteState() {
    const text = state.isMuted ? '🔇 Mute' : '🔊 Audio';
    const opacity = state.isMuted ? '0.7' : '1';
    
    if (buttons.mute) {
        buttons.mute.innerText = text;
        buttons.mute.style.opacity = opacity;
    }
    if (buttons.tutMute) {
        buttons.tutMute.innerText = text;
        buttons.tutMute.style.opacity = opacity;
    }
    if (buttons.naamJapMute) {
        buttons.naamJapMute.innerText = text;
        buttons.naamJapMute.style.opacity = opacity;
    }
    
    if (state.isMuted) {
        window.speechSynthesis.cancel();
    } else {
        initAudio();
    }
}

// ==========================================================================
// 📿 NAAM JAP TRACKER LOGIC (NO-DATABASE LOCAL PERSISTENCE)
// ==========================================================================
const NaamJapManager = {
    db: { version: 1, lastUpdated: new Date().toISOString(), profiles: [] },
    activeProfile: null,
    idleTimer: null,
    idleLimit: 30000, // 30 seconds

    init() {
        // Load data on start
        this.loadDb();
        
        // Setup initial view
        this.renderProfiles();
        
        // Bind event listeners
        this.bindEvents();

        // Check for vibration support (iOS Safari does not support Vibration API)
        const chkVibrate = document.getElementById('nj-chk-vibrate');
        if (chkVibrate) {
            if (!navigator.vibrate) {
                chkVibrate.disabled = true;
                chkVibrate.checked = false;
                const label = chkVibrate.nextElementSibling;
                if (label) {
                    label.innerText = "📳 Vibration (N/A)";
                    label.title = "Vibration is not supported on this device/browser (e.g. iOS iPhone)";
                }
            }
        }
    },

    loadDb() {
        const stored = localStorage.getItem('ascending_game_naam_jap_db');
        if (stored) {
            try {
                this.db = JSON.parse(stored);
                // Ensure profiles array exists
                if (!Array.isArray(this.db.profiles)) {
                    this.db.profiles = [];
                }
            } catch (e) {
                console.error("Error loading local storage database", e);
                this.showStatus("Error loading saved data. Starting fresh.", true);
            }
        }
    },

    saveDb() {
        this.db.lastUpdated = new Date().toISOString();
        localStorage.setItem('ascending_game_naam_jap_db', JSON.stringify(this.db));
    },

    bindEvents() {
        const self = this;

        // Lobby tab navigation
        buttons.naamJap.addEventListener('click', () => {
            initAudio();
            playSynthSound('click');
            showScreen('naamJap');
            self.initView();
        });

        // Home button
        buttons.naamJapHome.addEventListener('click', () => {
            playSynthSound('click');
            self.exitChanting();
            showScreen('lobby');
        });

        // Mute button
        buttons.naamJapMute.addEventListener('click', () => {
            state.isMuted = !state.isMuted;
            syncMuteState();
            if (!state.isMuted) {
                speakText("Sound is back on!");
            }
        });

        // Add Profile
        const btnAddProfile = document.getElementById('btn-nj-add-profile');
        if (btnAddProfile) {
            btnAddProfile.addEventListener('click', () => {
                const nameInput = document.getElementById('nj-name-input');
                const avatarSelect = document.getElementById('nj-avatar-select');
                const name = nameInput.value.trim();
                const avatar = avatarSelect.value;

                if (!name) {
                    alert("Please enter a name for the profile.");
                    return;
                }

                self.addProfile(name, avatar);
                nameInput.value = ''; // clear input
                playSynthSound('click');
            });
        }

        // Back to Profiles List
        const btnBackToProfiles = document.getElementById('btn-nj-back-to-profiles');
        if (btnBackToProfiles) {
            btnBackToProfiles.addEventListener('click', () => {
                playSynthSound('click');
                self.exitChanting();
            });
        }

        // Giant Chant Tapping Zone
        const tapZone = document.getElementById('nj-tap-zone');
        if (tapZone) {
            // pointerdown handles both touch and mouse click instantly, counting as user gesture for iOS audio context activation
            tapZone.addEventListener('pointerdown', (e) => {
                self.chantTap();
            });
        }

        // Adjust count
        const btnAdjust = document.getElementById('btn-nj-adjust-count');
        if (btnAdjust) {
            btnAdjust.addEventListener('click', () => {
                playSynthSound('click');
                self.adjustCount();
            });
        }

        // Reset today's count
        const btnReset = document.getElementById('btn-nj-reset-today');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                playSynthSound('click');
                self.resetToday();
            });
        }

        // Save & Backup (Merges database & triggers file download)
        const btnSaveNow = document.getElementById('btn-nj-save-now');
        if (btnSaveNow) {
            btnSaveNow.addEventListener('click', () => {
                self.exportBackup();
            });
        }

        const btnExport = document.getElementById('btn-nj-export');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                self.exportBackup();
            });
        }

        // Import backup (Triggering the file picker)
        const btnImportTrigger = document.getElementById('btn-nj-import-trigger');
        const fileInput = document.getElementById('nj-import-file-input');
        if (btnImportTrigger && fileInput) {
            btnImportTrigger.addEventListener('click', () => {
                playSynthSound('click');
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    self.importBackup(file);
                }
                fileInput.value = ''; // reset so same file can be selected again
            });
        }
    },

    initView() {
        this.activeProfile = null;
        document.getElementById('nj-dashboard-view').classList.add('active');
        document.getElementById('nj-chanting-view').classList.remove('active');
        this.renderProfiles();
    },

    renderProfiles() {
        const grid = document.getElementById('nj-profiles-list');
        if (!grid) return;
        
        grid.innerHTML = '';
        const todayStr = this.getTodayString();

        if (this.db.profiles.length === 0) {
            grid.innerHTML = `<div class="nj-card" style="grid-column: 1/-1; text-align: center; color: hsl(210, 15%, 45%); padding: 2rem;">
                No profiles created yet. Create a profile above or import your backup file to start!
            </div>`;
            return;
        }

        this.db.profiles.forEach(profile => {
            const todayCount = (profile.history && profile.history[todayStr]) || 0;
            
            const card = document.createElement('div');
            card.className = 'profile-card';
            card.innerHTML = `
                <button class="profile-delete-btn" title="Delete Profile">❌</button>
                <div class="profile-avatar">${profile.avatar || '🧘'}</div>
                <div class="profile-name">${this.escapeHTML(profile.name)}</div>
                <div class="profile-count-badge">Today: ${todayCount}</div>
            `;

            // Card click goes to chanting view
            card.addEventListener('click', (e) => {
                // If clicked delete button, skip selecting profile
                if (e.target.classList.contains('profile-delete-btn')) {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete profile "${profile.name}" and all their chanting history? This cannot be undone.`)) {
                        this.deleteProfile(profile.id);
                    }
                    return;
                }
                this.selectProfile(profile.id);
            });

            grid.appendChild(card);
        });
    },

    addProfile(name, avatar) {
        const newProfile = {
            id: 'profile_' + Date.now() + Math.random().toString(36).substr(2, 5),
            name: name,
            avatar: avatar,
            createdAt: new Date().toISOString(),
            history: {}
        };
        
        this.db.profiles.push(newProfile);
        this.saveDb();
        this.renderProfiles();
        this.showStatus(`Profile "${name}" created!`, false);
    },

    deleteProfile(profileId) {
        this.db.profiles = this.db.profiles.filter(p => p.id !== profileId);
        this.saveDb();
        this.renderProfiles();
        playSynthSound('wrong');
        this.showStatus("Profile deleted", false);
    },

    selectProfile(profileId) {
        const profile = this.db.profiles.find(p => p.id === profileId);
        if (!profile) return;

        this.activeProfile = profile;
        
        // Update Title & Views
        document.getElementById('nj-active-profile-name').innerText = `${profile.avatar || '🧘'} ${profile.name}`;
        document.getElementById('nj-dashboard-view').classList.remove('active');
        document.getElementById('nj-chanting-view').classList.add('active');

        // Update counts
        this.updateChantingCounts();

        // Render chart
        this.renderHistoryChart(profile);

        // Reset and start idle timer
        this.resetIdleTimer();
        
        playSynthSound('click');
    },

    exitChanting() {
        this.activeProfile = null;
        this.stopIdleTimer();
        document.getElementById('nj-dashboard-view').classList.add('active');
        document.getElementById('nj-chanting-view').classList.remove('active');
        this.renderProfiles();
    },

    chantTap() {
        if (!this.activeProfile) return;

        const profile = this.activeProfile;
        const todayStr = this.getTodayString();

        if (!profile.history) profile.history = {};
        profile.history[todayStr] = (profile.history[todayStr] || 0) + 1;

        // Auto save back to local storage
        this.saveDb();

        // Update view counts
        this.updateChantingCounts();

        // Play tap audio
        const chkSound = document.getElementById('nj-chk-sound');
        if (chkSound && chkSound.checked) {
            playSynthSound('bead');
        }

        // Tap vibration haptics
        const chkVibrate = document.getElementById('nj-chk-vibrate');
        if (chkVibrate && chkVibrate.checked && navigator.vibrate) {
            navigator.vibrate(20);
        }

        // Visual feedback animation on the tap zone
        const tapZone = document.getElementById('nj-tap-zone');
        if (tapZone) {
            tapZone.style.transform = 'scale(0.92)';
            setTimeout(() => {
                tapZone.style.transform = '';
            }, 80);
        }

        // Reset the idle timer to prevent Tibetan bowl from sounding
        this.resetIdleTimer();
    },

    updateChantingCounts() {
        if (!this.activeProfile) return;
        const profile = this.activeProfile;
        const todayStr = this.getTodayString();

        const todayCount = (profile.history && profile.history[todayStr]) || 0;
        let lifetimeCount = 0;
        if (profile.history) {
            Object.values(profile.history).forEach(val => {
                lifetimeCount += val;
            });
        }

        document.getElementById('nj-today-count').innerText = todayCount;
        document.getElementById('nj-lifetime-count').innerText = lifetimeCount;
    },

    adjustCount() {
        if (!this.activeProfile) return;
        
        const profile = this.activeProfile;
        const todayStr = this.getTodayString();
        const currentToday = (profile.history && profile.history[todayStr]) || 0;

        const val = prompt(`Adjust today's Naam Jap count for ${profile.name}:`, currentToday);
        if (val === null) return; // user cancelled

        const parsed = parseInt(val, 10);
        if (isNaN(parsed) || parsed < 0) {
            alert("Please enter a valid positive number.");
            return;
        }

        if (!profile.history) profile.history = {};
        profile.history[todayStr] = parsed;
        
        this.saveDb();
        this.updateChantingCounts();
        this.renderHistoryChart(profile);
        this.resetIdleTimer();
        this.showStatus("Count updated!", false);
    },

    resetToday() {
        if (!this.activeProfile) return;

        const profile = this.activeProfile;
        if (confirm(`Reset today's count for ${profile.name} to 0? (Lifetime count will adjust accordingly)`)) {
            const todayStr = this.getTodayString();
            if (!profile.history) profile.history = {};
            profile.history[todayStr] = 0;
            
            this.saveDb();
            this.updateChantingCounts();
            this.renderHistoryChart(profile);
            this.resetIdleTimer();
            this.showStatus("Today's count reset", false);
        }
    },

    resetIdleTimer() {
        this.stopIdleTimer();
        // Set new idle timeout for Tibetan bowl chime (30 seconds)
        this.idleTimer = setTimeout(() => {
            // Play Tibet singing bowl chime if not muted
            playSynthSound('bowl');
            // Give visual feedback on the emoji (sparkles)
            const emoji = document.getElementById('nj-tap-emoji');
            if (emoji) {
                emoji.innerText = '✨';
                setTimeout(() => {
                    const activeEmoji = (this.activeProfile && this.activeProfile.avatar) || '📿';
                    emoji.innerText = activeEmoji;
                }, 3000);
            }
            // Set the idle timer again
            this.resetIdleTimer();
        }, this.idleLimit);
    },

    stopIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
    },

    exportBackup() {
        this.saveDb(); // Ensure latest states are written

        // Generate filename with date and unique time (hours, minutes, seconds)
        // This avoids the browser "Download this file again?" warning dialogue on Android and iOS
        const d = new Date();
        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const timeStr = `${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}`;
        
        let profilePart = 'all_profiles';
        if (this.activeProfile) {
            profilePart = this.activeProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
        
        const filename = `naam_jap_${profilePart}_${dateStr}_${timeStr}.json`;

        // Create blob download trigger
        const jsonStr = JSON.stringify(this.db, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Resonant Tibetan bowl feedback on saving
        playSynthSound('bowl');

        this.showStatus("Backup saved successfully!", false);
    },

    importBackup(file) {
        const reader = new FileReader();
        const self = this;
        
        reader.onload = function(e) {
            try {
                const importedDb = JSON.parse(e.target.result);
                
                if (!importedDb || !Array.isArray(importedDb.profiles)) {
                    throw new Error("Invalid backup file structure.");
                }

                // Merge imported profiles back into local db
                importedDb.profiles.forEach(importedProfile => {
                    // Try to match profile by ID, fallback to match by Name
                    let localProfile = self.db.profiles.find(p => p.id === importedProfile.id);
                    if (!localProfile) {
                        localProfile = self.db.profiles.find(p => p.name.toLowerCase() === importedProfile.name.toLowerCase());
                    }

                    if (localProfile) {
                        // Merge counts
                        if (importedProfile.history) {
                            if (!localProfile.history) localProfile.history = {};
                            
                            Object.keys(importedProfile.history).forEach(date => {
                                const localCount = localProfile.history[date] || 0;
                                const fileCount = importedProfile.history[date] || 0;
                                // Keep maximum count to prevent losing progress
                                localProfile.history[date] = Math.max(localCount, fileCount);
                            });
                        }
                        if (importedProfile.avatar) localProfile.avatar = importedProfile.avatar;
                    } else {
                        // New profile - insert
                        self.db.profiles.push({
                            id: importedProfile.id || 'profile_' + Date.now() + Math.random().toString(36).substr(2, 5),
                            name: importedProfile.name,
                            avatar: importedProfile.avatar || '🧘',
                            createdAt: importedProfile.createdAt || new Date().toISOString(),
                            history: importedProfile.history || {}
                        });
                    }
                });

                self.saveDb();
                self.renderProfiles();
                
                // Play bowl chime on success
                playSynthSound('bowl');
                self.showStatus("Backup imported and merged successfully!", false);

            } catch (err) {
                console.error(err);
                playSynthSound('wrong');
                self.showStatus("Error: Invalid JSON file structure.", true);
            }
        };

        reader.readAsText(file);
    },

    renderHistoryChart(profile) {
        const chartContainer = document.getElementById('nj-history-chart');
        if (!chartContainer) return;

        chartContainer.innerHTML = '';
        
        // Generate last 7 days dates
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days.push(d);
        }

        // Get max count to scale heights
        let maxVal = 0;
        const counts = days.map(d => {
            const dateKey = this.formatDate(d);
            const count = (profile.history && profile.history[dateKey]) || 0;
            if (count > maxVal) maxVal = count;
            return { dateLabel: this.formatDateLabel(d), count: count };
        });

        // If all days are 0, set scale base to 10
        if (maxVal === 0) maxVal = 10;

        counts.forEach(day => {
            const heightPercent = Math.min(100, Math.max(2, (day.count / maxVal) * 100));
            
            const barContainer = document.createElement('div');
            barContainer.className = 'history-bar-container';
            barContainer.innerHTML = `
                <div class="history-bar" style="height: ${heightPercent}px;">
                    <div class="history-bar-tooltip">${day.count}</div>
                </div>
                <div class="history-date">${day.dateLabel}</div>
            `;
            chartContainer.appendChild(barContainer);
        });
    },

    showStatus(msg, isError) {
        const statusEl = document.getElementById('nj-backup-status');
        if (!statusEl) return;

        statusEl.innerText = msg;
        statusEl.className = 'backup-status' + (isError ? ' error' : '');

        setTimeout(() => {
            if (statusEl.innerText === msg) {
                statusEl.innerText = '';
            }
        }, 5000);
    },

    // UTILITIES
    getTodayString() {
        return this.formatDate(new Date());
    },

    formatDate(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDateLabel(d) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
    },

    escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// Initialize Naam Jap Tracker
NaamJapManager.init();
