// Text samples for different difficulty levels
const textSamples = {
    easy: [
        "The quick brown fox jumps over the lazy dog.",
        "Hello world! This is a simple typing test.",
        "Practice makes perfect. Keep typing to improve your speed.",
        "The sun shines bright in the clear blue sky.",
        "Learning to type faster takes time and patience."
    ],
    medium: [
        "The art of programming is the art of organizing complexity, of mastering multitude and avoiding its bastard chaos as effectively as possible. Programming is not just about writing code; it's about solving problems and creating solutions that make life easier for everyone.",
        "Technology has revolutionized the way we communicate, work, and live our daily lives. From smartphones to artificial intelligence, we are constantly surrounded by innovations that shape our future and transform our present reality in ways we never imagined possible.",
        "The journey of learning is never-ending, filled with challenges, discoveries, and moments of breakthrough. Every expert was once a beginner, and every master was once a disaster. The key to success lies not in avoiding failure, but in learning from it and persisting through difficulties."
    ],
    hard: [
        "The intricate complexities of modern software development encompass a vast array of methodologies, frameworks, and paradigms that continuously evolve to meet the ever-changing demands of our digital society. From object-oriented programming principles to functional programming paradigms, from microservices architecture to monolithic structures, developers must navigate through an extensive landscape of technical knowledge while maintaining code quality, performance optimization, and scalability considerations that are crucial for building robust, maintainable, and efficient applications that can withstand the test of time and user expectations.",
        "The philosophical implications of artificial intelligence and machine learning extend far beyond mere technological advancement, touching upon fundamental questions about consciousness, creativity, and the nature of human intelligence itself. As we develop increasingly sophisticated algorithms capable of pattern recognition, natural language processing, and decision-making processes that rival or exceed human capabilities in specific domains, we must grapple with ethical considerations surrounding autonomy, privacy, bias, and the potential displacement of human workers across various industries.",
        "The interconnected nature of global economies, environmental systems, and social structures creates a complex web of dependencies and feedback loops that challenge traditional approaches to problem-solving and policy-making. Climate change, economic inequality, technological disruption, and geopolitical tensions all interact in ways that require holistic, interdisciplinary thinking and collaborative approaches that transcend national boundaries and sectoral silos."
    ]
};

// Typing tips
const typingTips = [
    "Keep your fingers on the home row keys: ASDF and JKL;",
    "Use all ten fingers, not just your index fingers!",
    "Look at the screen, not your keyboard while typing.",
    "Practice regularly - even 10 minutes daily helps.",
    "Maintain good posture with feet flat on the floor.",
    "Keep your wrists straight and slightly elevated.",
    "Don't rush - accuracy is more important than speed.",
    "Use proper finger placement for each key.",
    "Take breaks to avoid strain and fatigue.",
    "Focus on rhythm and consistency in your typing."
];

// Global variables
let currentText = '';
let startTime = null;
let endTime = null;
let testActive = false;
let timerInterval = null;
let countdownInterval = null;
let currentCharIndex = 0;
let currentStreak = 0;
let maxStreak = 0;
let soundEnabled = true;
let darkMode = false;
let currentTipIndex = 0;

// DOM elements
const elements = {
    startBtn: document.getElementById('startBtn'),
    difficulty: document.getElementById('difficulty'),
    soundToggle: document.getElementById('soundToggle'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    testArea: document.getElementById('testArea'),
    countdown: document.getElementById('countdown'),
    countdownText: document.getElementById('countdownText'),
    textToType: document.getElementById('textToType'),
    userInput: document.getElementById('userInput'),
    wpm: document.getElementById('wpm'),
    accuracy: document.getElementById('accuracy'),
    time: document.getElementById('time'),
    streak: document.getElementById('streak'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    results: document.getElementById('results'),
    finalWpm: document.getElementById('finalWpm'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    finalTime: document.getElementById('finalTime'),
    charCount: document.getElementById('charCount'),
    retryBtn: document.getElementById('retryBtn'),
    scoresList: document.getElementById('scoresList'),
    currentTip: document.getElementById('currentTip'),
    nextTipBtn: document.getElementById('nextTipBtn')
};

// Initialize the application
function init() {
    elements.startBtn.addEventListener('click', startTest);
    elements.retryBtn.addEventListener('click', resetTest);
    elements.userInput.addEventListener('input', handleInput);
    elements.soundToggle.addEventListener('change', toggleSound);
    elements.darkModeToggle.addEventListener('change', toggleDarkMode);
    elements.nextTipBtn.addEventListener('click', showNextTip);
    
    loadScores();
    loadSettings();
    showNextTip();
}

// Toggle sound effects
function toggleSound() {
    soundEnabled = elements.soundToggle.checked;
    localStorage.setItem('soundEnabled', soundEnabled);
}

// Toggle dark mode
function toggleDarkMode() {
    darkMode = elements.darkModeToggle.checked;
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
}

// Play typing sound
function playTypingSound() {
    if (!soundEnabled) return;
    
    // Create a simple typing sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Show next typing tip
function showNextTip() {
    elements.currentTip.querySelector('p').textContent = typingTips[currentTipIndex];
    currentTipIndex = (currentTipIndex + 1) % typingTips.length;
}

// Load settings from localStorage
function loadSettings() {
    const savedSound = localStorage.getItem('soundEnabled');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
        elements.soundToggle.checked = soundEnabled;
    }
    
    if (savedDarkMode !== null) {
        darkMode = savedDarkMode === 'true';
        elements.darkModeToggle.checked = darkMode;
        document.body.classList.toggle('dark-mode', darkMode);
    }
}

// Start the typing test
function startTest() {
    const difficulty = elements.difficulty.value;
    currentText = getRandomText(difficulty);
    elements.textToType.textContent = currentText;
    
    // Show countdown
    elements.countdown.style.display = 'block';
    elements.testArea.style.display = 'block';
    elements.startBtn.disabled = true;
    
    startCountdown();
}

// Start countdown timer
function startCountdown() {
    let count = 3;
    elements.countdownText.textContent = count;
    
    countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            elements.countdownText.textContent = count;
        } else {
            clearInterval(countdownInterval);
            elements.countdown.style.display = 'none';
            startTypingTest();
        }
    }, 1000);
}

// Start the actual typing test
function startTypingTest() {
    testActive = true;
    startTime = Date.now();
    elements.userInput.disabled = false;
    elements.userInput.focus();
    currentCharIndex = 0;
    currentStreak = 0;
    maxStreak = 0;
    
    // Start timer
    timerInterval = setInterval(updateStats, 100);
    
    // Highlight first character
    highlightCurrentChar();
}

// Handle user input
function handleInput() {
    if (!testActive) return;
    
    const userText = elements.userInput.value;
    const textLength = userText.length;
    
    // Play typing sound
    playTypingSound();
    
    // Update progress
    const progress = (textLength / currentText.length) * 100;
    elements.progressFill.style.width = progress + '%';
    elements.progressText.textContent = Math.round(progress) + '%';
    
    // Check if test is complete
    if (textLength >= currentText.length) {
        endTest();
        return;
    }
    
    // Update character highlighting and streak
    highlightCurrentChar();
}

// Highlight current character and check accuracy
function highlightCurrentChar() {
    const userText = elements.userInput.value;
    const textLength = userText.length;
    
    let html = '';
    let correctChars = 0;
    let currentStreakCount = 0;
    
    for (let i = 0; i < currentText.length; i++) {
        const char = currentText[i];
        let className = '';
        
        if (i < textLength) {
            if (userText[i] === char) {
                className = 'correct';
                correctChars++;
                currentStreakCount++;
            } else {
                className = 'incorrect';
                currentStreakCount = 0; // Reset streak on error
            }
        } else if (i === textLength) {
            className = 'current';
        }
        
        html += `<span class="${className}">${char}</span>`;
    }
    
    elements.textToType.innerHTML = html;
    
    // Update streak
    currentStreak = currentStreakCount;
    if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
    }
    elements.streak.textContent = currentStreak;
    
    // Update accuracy
    const accuracy = textLength > 0 ? (correctChars / textLength) * 100 : 100;
    elements.accuracy.textContent = Math.round(accuracy) + '%';
}

// Update real-time stats
function updateStats() {
    if (!testActive || !startTime) return;
    
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000; // in seconds
    const userText = elements.userInput.value;
    const wordsTyped = userText.trim().split(/\s+/).length;
    const wpm = elapsedTime > 0 ? Math.round((wordsTyped / elapsedTime) * 60) : 0;
    
    elements.wpm.textContent = wpm;
    elements.time.textContent = Math.round(elapsedTime) + 's';
}

// End the test
function endTest() {
    testActive = false;
    endTime = Date.now();
    
    clearInterval(timerInterval);
    elements.userInput.disabled = true;
    
    // Calculate final stats
    const totalTime = (endTime - startTime) / 1000;
    const userText = elements.userInput.value;
    const wordsTyped = userText.trim().split(/\s+/).length;
    const finalWpm = Math.round((wordsTyped / totalTime) * 60);
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < Math.min(userText.length, currentText.length); i++) {
        if (userText[i] === currentText[i]) {
            correctChars++;
        }
    }
    const finalAccuracy = Math.round((correctChars / userText.length) * 100);
    
    // Display results
    elements.finalWpm.textContent = finalWpm;
    elements.finalAccuracy.textContent = finalAccuracy + '%';
    elements.finalTime.textContent = Math.round(totalTime) + 's';
    elements.charCount.textContent = userText.length;
    
    elements.results.style.display = 'block';
    
    // Save score
    saveScore(finalWpm, finalAccuracy, totalTime, userText.length);
}

// Reset the test
function resetTest() {
    testActive = false;
    startTime = null;
    endTime = null;
    currentCharIndex = 0;
    currentStreak = 0;
    maxStreak = 0;
    
    clearInterval(timerInterval);
    clearInterval(countdownInterval);
    
    elements.userInput.value = '';
    elements.userInput.disabled = true;
    elements.startBtn.disabled = false;
    elements.testArea.style.display = 'none';
    elements.results.style.display = 'none';
    elements.countdown.style.display = 'none';
    
    // Reset stats
    elements.wpm.textContent = '0';
    elements.accuracy.textContent = '100%';
    elements.time.textContent = '0s';
    elements.streak.textContent = '0';
    elements.progressFill.style.width = '0%';
    elements.progressText.textContent = '0%';
}

// Get random text based on difficulty
function getRandomText(difficulty) {
    const texts = textSamples[difficulty];
    return texts[Math.floor(Math.random() * texts.length)];
}

// Save score to localStorage
function saveScore(wpm, accuracy, time, chars) {
    const scores = getScores();
    const newScore = {
        wpm: wpm,
        accuracy: accuracy,
        time: Math.round(time),
        chars: chars,
        date: new Date().toLocaleDateString(),
        difficulty: elements.difficulty.value
    };
    
    scores.unshift(newScore);
    
    // Keep only last 10 scores
    if (scores.length > 10) {
        scores.splice(10);
    }
    
    localStorage.setItem('typingScores', JSON.stringify(scores));
    loadScores();
}

// Get scores from localStorage
function getScores() {
    const scores = localStorage.getItem('typingScores');
    return scores ? JSON.parse(scores) : [];
}

// Load and display scores
function loadScores() {
    const scores = getScores();
    
    if (scores.length === 0) {
        elements.scoresList.innerHTML = '<p class="no-scores">No scores yet. Complete a test to see your scores!</p>';
        return;
    }
    
    elements.scoresList.innerHTML = scores.map(score => `
        <div class="score-item">
            <div class="score-info">
                <div class="score-wpm">${score.wpm} WPM</div>
                <div class="score-details">${score.accuracy}% accuracy • ${score.time}s • ${score.difficulty}</div>
            </div>
            <div class="score-date">${score.date}</div>
        </div>
    `).join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
