const canvas = document.getElementById('wormhole-canvas');
const ctx = canvas.getContext('2d');

let time = 0;
let mouseX = 0;
let mouseY = 0;

const personalInfo = [
    '> NAME:     WILL HAWKINS',
    '> LINKEDIN: /in/will-hawkins-iv',
    '> X:        @willmhawkins',
    '> EMAIL:    will@willmhawkins.com'
];

let showInfo = false;
let infoAnimation = 0;
let hoverLinkedIn = false;
let hoverX = false;
let hoverTransition = 0;

let secretConsole = '';
let secretConsoleActive = false;

let terminalHistory = [];
let currentDirectory = '~';

const fileSystem = {
    '/': {
        type: 'directory',
        contents: {
            'welcome.txt': { type: 'file', content: 'Welcome to the void. Can you find the secret?' },
            'projects': {
                type: 'directory',
                contents: {
                    'startup_ideas.txt': { type: 'file', content: 'AI-powered toaster\nBlockchain for pets\nQuantum-entangled socks' }
                }
            },
            'hidden': {
                type: 'directory',
                contents: {
                    '.secret': { type: 'file', content: 'Congratulations. You found the secret. Email will@willmhawkins.com with the subject "I found the void\'s secret" to discuss potential collaboration.' }
                }
            }
        }
    }
};

let warpSpeed = 1;
let glitchEffect = 0;
let voidEffect = 0;
let pulseEffect = 0;

// Add these variables at the top of the file
let pipe = null;
let conversation = [];
let transformersLoaded = false;
let snake = [];
let food = {};
let snakeDirection = 'right';
let snakeGame = false;
let snakeSpeed = 80; // Faster initial speed (milliseconds between moves)
let snakeLevel = 1;
let snakeLevelThreshold = 3; // Score needed to increase level
let snakeInterval;
let snakeScore = 0;
let keysPressed = {};
let snakeUpdateInterval;
let lastSnakeUpdate = Date.now();

// Import the pipeline from Transformers.js
// import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0/+esm';

// Modify the loadTransformers function
async function loadTransformers() {
    try {
        transformersLoaded = true;
        terminalHistory.push('Transformers.js loaded successfully.');
        return true;
    } catch (error) {
        terminalHistory.push('Failed to load Transformers.js: ' + error.message);
        return false;
    }
}

// Modify the initializeAI function
async function initializeAI() {
    if (!transformersLoaded) {
        terminalHistory.push('Loading Transformers.js...');
        const loaded = await loadTransformers();
        if (!loaded) {
            terminalHistory.push('Cannot initialize AI: Transformers.js not loaded.');
            return;
        }
    }

    terminalHistory.push('Initializing AI...');
    try {
        console.log('Creating pipeline...');
        pipe = await pipeline('text-generation', 'distilgpt2');
        console.log('Pipeline created:', pipe);
        console.log('Pipeline type:', typeof pipe);
        console.log('Pipeline properties:', Object.keys(pipe));
        terminalHistory.push('AI initialized. You can now chat with the AI using the "ai" command.');
        terminalHistory.push('Example: ai Hello, how are you?');
    } catch (error) {
        console.error('AI Initialization Error:', error);
        terminalHistory.push('Failed to initialize AI: ' + error.message);
    }
}

// Modify the aiChat function
async function aiChat(input) {
    if (!transformersLoaded) {
        terminalHistory.push('Transformers.js is not loaded. Use "ai init" to start the AI.');
        return;
    }

    if (!pipe) {
        terminalHistory.push('AI is not initialized. Use "ai init" to start the AI.');
        return;
    }

    conversation.push(`Human: ${input}`);
    const context = conversation.slice(-2).join('\n'); // Only use the last human input

    try {
        console.log('Sending to AI:', context);
        console.log('Pipe object:', pipe);
        const result = await pipe(context, {
            max_new_tokens: 50,
            temperature: 0.7,
            do_sample: true,
        });
        console.log('Raw AI response:', result);

        let response;
        if (Array.isArray(result) && result.length > 0) {
            response = result[0].trim();
        } else if (typeof result === 'string') {
            response = result.trim();
        } else {
            console.error('Unexpected AI response format:', result);
            response = "I'm sorry, I couldn't generate a response.";
        }

        // Remove any "Human:" or "AI:" prefixes from the response
        response = response.replace(/^(Human:|AI:)\s*/i, '');

        console.log('Processed AI response:', response);
        conversation.push(`AI: ${response}`);
        terminalHistory.push(`AI: ${response}`);
    } catch (error) {
        console.error('AI Error:', error);
        terminalHistory.push('AI Error: ' + error.message);
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Add this function to handle the snake game
function startSnakeGame() {
    snakeGame = true;
    snake = [{ x: 10, y: 10 }];
    snakeDirection = 'right';
    snakeSpeed = 80; // Reset speed when starting a new game
    snakeLevel = 1;
    snakeScore = 0;
    spawnFood();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    snakeUpdateInterval = setInterval(updateSnakeGame, 1000 / 60); // 60 FPS
    canvas.focus();
    terminalHistory.push('Snake game started. Use arrow keys to play, Escape to end.');
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / 20)),
        y: Math.floor(Math.random() * (canvas.height / 20))
    };
}

function handleKeyDown(e) {
    keysPressed[e.key] = true;
    e.preventDefault();
}

function handleKeyUp(e) {
    delete keysPressed[e.key];
    e.preventDefault();
}

function updateSnakeGame() {
    if (!snakeGame) return;

    // Handle input
    if (keysPressed['ArrowUp'] && snakeDirection !== 'down') snakeDirection = 'up';
    if (keysPressed['ArrowDown'] && snakeDirection !== 'up') snakeDirection = 'down';
    if (keysPressed['ArrowLeft'] && snakeDirection !== 'right') snakeDirection = 'left';
    if (keysPressed['ArrowRight'] && snakeDirection !== 'left') snakeDirection = 'right';
    if (keysPressed['Escape']) {
        endSnakeGame();
        return;
    }

    // Update snake position every snakeSpeed ms
    if (Date.now() - lastSnakeUpdate >= snakeSpeed) {
        lastSnakeUpdate = Date.now();
        const head = { ...snake[0] };
        switch (snakeDirection) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            snakeScore++;
            spawnFood();
            if (snakeScore % snakeLevelThreshold === 0) {
                snakeLevel++;
                snakeSpeed = Math.max(30, snakeSpeed - 15); // Faster speed increase
            }
        } else {
            snake.pop();
        }

        if (head.x < 0 || head.x >= canvas.width / 20 ||
            head.y < 0 || head.y >= canvas.height / 20 ||
            snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
            endSnakeGame();
        }
    }
}

function endSnakeGame() {
    snakeGame = false;
    clearInterval(snakeUpdateInterval);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    terminalHistory.push(`Snake game ended. Final Score: ${snakeScore}, Level: ${snakeLevel}`);
}

// Modify the drawWormhole function to include snake game rendering
function drawWormhole() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the wormhole with reduced opacity
    ctx.globalAlpha = snakeGame ? 0.3 : 1; // Reduce opacity when snake game is active

    ctx.strokeStyle = 'white';
    for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
            let baseY = canvas.height / 2 +
                Math.sin(x * 0.01 + i * 0.2 + time * 0.1) *
                (20 + i * 10) *
                (1 - x / canvas.width);

            let dx = x - mouseX;
            let dy = baseY - mouseY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            let effect = 50 / (1 + distance * 0.1);
            let y = baseY + effect * (baseY > mouseY ? 1 : -1);

            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    ctx.globalAlpha = 1; // Reset global alpha

    // Only draw "ENTER" and "TIME" if snake game is not active
    if (!snakeGame) {
        ctx.font = '16px monospace';
        ctx.fillStyle = 'white';
        ctx.fillText('> ENTER', 20, 30);
        ctx.fillText(`> TIME: ${time.toFixed(2)}`, 20, 60);
    }

    // Animate and display personal info
    if (showInfo) {
        infoAnimation = Math.min(infoAnimation + 0.05, 1);
    } else {
        infoAnimation = Math.max(infoAnimation - 0.05, 0);
    }

    // Update hover transition
    if (hoverLinkedIn || hoverX) {
        hoverTransition = Math.min(hoverTransition + 0.05, 1);
    } else {
        hoverTransition = Math.max(hoverTransition - 0.05, 0);
    }

    if (infoAnimation > 0) {
        personalInfo.forEach((info, index) => {
            let alpha = Math.max(0, Math.min(1, infoAnimation * 3 - index * 0.5));

            // Special handling for LinkedIn
            if (index === 1) {
                let pulse = Math.sin(time * 2 / 3) * 0.1 + 0.9;
                let r = 255 - (155 * (hoverLinkedIn ? hoverTransition : 0));
                let g = 255;
                let b = 255 - (155 * (hoverLinkedIn ? hoverTransition : 0));
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * (1 + (pulse - 1) * (hoverLinkedIn ? hoverTransition : 0))})`;
            } else if (index === 2) { // Special handling for X
                let pulse = Math.sin(time * 2 / 3) * 0.1 + 0.9;
                let r = 255 - (155 * (hoverX ? hoverTransition : 0));
                let g = 255;
                let b = 255 - (155 * (hoverX ? hoverTransition : 0));
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * (1 + (pulse - 1) * (hoverX ? hoverTransition : 0))})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            }

            ctx.fillText(info, 200, 30 + index * 25);
        });
    }

    if (secretConsoleActive) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.fillText('> ' + secretConsole, 20, canvas.height - 30);
    }

    // Draw terminal
    const terminalHeight = 300;
    const lineHeight = 20;
    const padding = 2; // Added padding
    const maxLines = Math.floor((terminalHeight - lineHeight - padding) / lineHeight);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height - terminalHeight, canvas.width, terminalHeight);

    ctx.font = '14px monospace';
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';

    let yOffset = canvas.height - terminalHeight + lineHeight;
    terminalHistory.slice(-maxLines).forEach(line => {
        ctx.fillText(line, 20, yOffset);
        yOffset += lineHeight;
    });

    // Draw current input line with the ">"
    ctx.fillText('> ' + secretConsole, 20, canvas.height - lineHeight - padding);

    time += 0.05 * warpSpeed;

    // Glitch effect
    if (glitchEffect > 0) {
        ctx.save();
        ctx.translate(Math.random() * 10 - 5, Math.random() * 10 - 5);
        ctx.fillStyle = `rgba(0, 255, 0, ${Math.random() * 0.1})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        glitchEffect -= 0.01;
    }

    // Void effect
    if (voidEffect > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.8 * voidEffect})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(255, 255, 255, ${voidEffect})`;
        ctx.fillText('THE VOID CONSUMES ALL', canvas.width / 2 - 100, canvas.height / 2);
        voidEffect -= 0.005;
    }

    // Pulse effect
    if (pulseEffect > 0) {
        const pulseIntensity = Math.sin(time * 10) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulseIntensity * pulseEffect})`;
        ctx.lineWidth = 2 + pulseIntensity * 3;
        pulseEffect -= 0.01;
    }

    if (snakeGame) {
        // Draw snake game elements on top of the dimmed wormhole
        ctx.fillStyle = 'lime';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
        });

        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * 20, food.y * 20, 20, 20);

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${snakeScore}  Level: ${snakeLevel}`, 10, 30);
    }

    requestAnimationFrame(drawWormhole);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawWormhole();

function isMouseOverEnterTheVoid(x, y) {
    return x >= 20 && x <= 170 && y >= 10 && y <= 40;
}

function isMouseOverInfo(x, y) {
    return x >= 200 && x <= 500 && y >= 10 && y <= 110;
}

function isMouseOverLinkedIn(x, y) {
    return showInfo && x >= 200 && x <= 500 && y >= 35 && y <= 60;
}

function isMouseOverX(x, y) {
    return showInfo && x >= 200 && x <= 500 && y >= 60 && y <= 85;
}

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    showInfo = isMouseOverEnterTheVoid(e.clientX, e.clientY) || isMouseOverInfo(e.clientX, e.clientY);
    hoverLinkedIn = isMouseOverLinkedIn(e.clientX, e.clientY);
    hoverX = isMouseOverX(e.clientX, e.clientY);
});

canvas.addEventListener('click', (e) => {
    if (isMouseOverEnterTheVoid(e.clientX, e.clientY)) {
        showInfo = !showInfo;
    } else if (isMouseOverLinkedIn(e.clientX, e.clientY)) {
        window.open('https://www.linkedin.com/in/will-hawkins-iv/', '_blank');
    } else if (isMouseOverX(e.clientX, e.clientY)) {
        window.open('https://x.com/willmhawkins', '_blank');
    }
});

let tabCompletionIndex = 0;
let tabCompletionOptions = [];

window.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
        secretConsole = secretConsole.slice(0, -1);
        tabCompletionOptions = [];
        tabCompletionIndex = 0;
    } else if (e.key === 'Enter') {
        terminalHistory.push(`> ${secretConsole}`);
        if (secretConsole.trim() !== '') {
            handleSecretCommand(secretConsole);
        }
        secretConsole = '';
        tabCompletionOptions = [];
        tabCompletionIndex = 0;
    } else if (e.key === 'Tab') {
        e.preventDefault();
        handleTabCompletion();
    } else if (e.key.length === 1) {
        secretConsole += e.key;
        tabCompletionOptions = [];
        tabCompletionIndex = 0;
    }
});

function handleTabCompletion() {
    if (tabCompletionOptions.length === 0) {
        const [cmd, ...args] = secretConsole.split(' ');
        if (args.length === 0) {
            // Command completion
            tabCompletionOptions = getCommandCompletions(cmd);
        } else {
            // Path/file completion
            const path = args[args.length - 1];
            tabCompletionOptions = getPathCompletions(path);
        }
    }

    if (tabCompletionOptions.length > 0) {
        const completion = tabCompletionOptions[tabCompletionIndex];
        const parts = secretConsole.split(' ');
        parts[parts.length - 1] = completion;
        secretConsole = parts.join(' ');
        tabCompletionIndex = (tabCompletionIndex + 1) % tabCompletionOptions.length;
    }
}

function getCommandCompletions(partial) {
    const commands = ['ls', 'cd', 'pwd', 'cat', 'clear', 'tree', 'echo', 'grep', 'help', 'warp', 'glitch', 'void', 'pulse', 'ai', 'snake'];
    return commands.filter(cmd => cmd.startsWith(partial));
}

function getPathCompletions(partial) {
    const dir = getPath(resolvePath(currentDirectory));
    if (!dir || dir.type !== 'directory') return [];

    const items = Object.keys(dir.contents);
    const completions = items.filter(item => item.startsWith(partial));

    // Add trailing slash for directories
    return completions.map(item => {
        if (dir.contents[item].type === 'directory') {
            return item + '/';
        }
        return item;
    });
}

function handleSecretCommand(command) {
    const args = command.trim().split(' ');
    const cmd = args[0].toLowerCase();

    switch (cmd) {
        case 'ls':
            listDirectory(currentDirectory);
            break;
        case 'cd':
            changeDirectory(args[1]);
            break;
        case 'pwd':
            terminalHistory.push(currentDirectory);
            break;
        case 'cat':
            catFile(args[1]);
            break;
        case 'clear':
            terminalHistory = [];
            break;
        case 'tree':
            treeDirectory(currentDirectory);
            break;
        case 'echo':
            terminalHistory.push(args.slice(1).join(' '));
            break;
        case 'grep':
            grepFile(args[1], args.slice(2).join(' '));
            break;
        case 'warp':
            warpCommand(args[1]);
            break;
        case 'glitch':
            glitchCommand();
            break;
        case 'void':
            voidCommand();
            break;
        case 'pulse':
            pulseCommand();
            break;
        case 'ai':
            if (args[1] === 'init') {
                initializeAI();
            } else if (args.length > 1) {
                aiChat(args.slice(1).join(' '));
            } else {
                terminalHistory.push('Usage: ai <message> or ai init');
            }
            break;
        case 'snake':
            startSnakeGame();
            break;
        case 'margo':
            terminalHistory.push('I love you');
            break;
        case 'help':
            terminalHistory.push('Available commands: ls, cd, pwd, cat, clear, tree, echo, grep, warp, glitch, void, pulse, ai, snake, help');
            break;
        case '':
            // Do nothing for empty input
            break;
        default:
            terminalHistory.push(`Command not found: ${cmd}`);
    }
}

function listDirectory(path) {
    const resolvedPath = resolvePath(path);
    const dir = getPath(resolvedPath);
    if (dir && dir.type === 'directory') {
        const contents = Object.keys(dir.contents).join('  ');
        terminalHistory.push(contents);
    } else {
        terminalHistory.push('Not a directory');
    }
}

function changeDirectory(path) {
    if (!path) {
        currentDirectory = '~';
        return;
    }

    if (path === '..') {
        if (currentDirectory === '~' || currentDirectory === '/') {
            // Already at root, can't go up
            return;
        }
        let parts = currentDirectory.split('/');
        parts.pop();
        currentDirectory = parts.length === 1 ? '~' : parts.join('/');
        return;
    }

    let newPath = resolvePath(path);
    const dir = getPath(newPath);

    if (dir && dir.type === 'directory') {
        currentDirectory = newPath === '/' ? '~' : newPath;
    } else {
        terminalHistory.push('Not a directory');
    }
}

function catFile(path) {
    const file = getPath(resolvePath(path));
    if (file && file.type === 'file') {
        terminalHistory.push(file.content);
    } else {
        terminalHistory.push('File not found');
    }
}

function getPath(path) {
    if (path === '/' || path === '~') return fileSystem['/'];
    const parts = path.split('/').filter(p => p);
    let current = fileSystem['/'];
    for (let part of parts) {
        if (current.type !== 'directory' || !current.contents[part]) {
            return null;
        }
        current = current.contents[part];
    }
    return current;
}

function resolvePath(path) {
    if (path === '~' || path === '/') return '/';
    if (path.startsWith('/')) return path;
    if (currentDirectory === '~') return `/${path}`;
    return `${currentDirectory}${currentDirectory.endsWith('/') ? '' : '/'}${path}`;
}

function treeDirectory(path, prefix = '') {
    const resolvedPath = resolvePath(path);
    const dir = getPath(resolvedPath);
    if (!dir || dir.type !== 'directory') {
        terminalHistory.push('Not a directory');
        return;
    }

    if (prefix === '') {
        terminalHistory.push(path === '~' ? '~' : resolvedPath);
    }

    Object.entries(dir.contents).forEach(([name, item], index, array) => {
        const isLast = index === array.length - 1;
        terminalHistory.push(`${prefix}${isLast ? '└── ' : '├── '}${name}`);
        if (item.type === 'directory') {
            const newPath = resolvedPath === '/' ? `/${name}` : `${resolvedPath}/${name}`;
            treeDirectory(newPath, `${prefix}${isLast ? '    ' : '│   '}`);
        }
    });
}

function grepFile(pattern, path) {
    if (!pattern || !path) {
        terminalHistory.push('grep: missing operands');
        return;
    }
    const file = getPath(resolvePath(path));
    if (file && file.type === 'file') {
        const lines = file.content.split('\n');
        const matches = lines.filter(line => line.includes(pattern));
        if (matches.length > 0) {
            matches.forEach(match => terminalHistory.push(match));
        } else {
            terminalHistory.push('grep: no matches found');
        }
    } else {
        terminalHistory.push('grep: cannot read file: No such file or directory');
    }
}

function warpCommand(speed) {
    const newSpeed = parseFloat(speed);
    if (!isNaN(newSpeed) && newSpeed > 0 && newSpeed <= 10) {
        warpSpeed = newSpeed;
        terminalHistory.push(`Warp speed set to ${warpSpeed} `);
    } else {
        terminalHistory.push('Usage: warp <speed> (1-10)');
    }
}

function glitchCommand() {
    glitchEffect = 1;
    terminalHistory.push('Initiating glitch sequence...');
}

function voidCommand() {
    voidEffect = 1;
    terminalHistory.push('Entering the void...');
}

function pulseCommand() {
    pulseEffect = 1;
    terminalHistory.push('Initiating pulse sequence...');
}

function updateSnakeGame() {
    if (!snakeGame) return;

    // Handle input
    if (keysPressed['ArrowUp'] && snakeDirection !== 'down') snakeDirection = 'up';
    if (keysPressed['ArrowDown'] && snakeDirection !== 'up') snakeDirection = 'down';
    if (keysPressed['ArrowLeft'] && snakeDirection !== 'right') snakeDirection = 'left';
    if (keysPressed['ArrowRight'] && snakeDirection !== 'left') snakeDirection = 'right';
    if (keysPressed['Escape']) {
        endSnakeGame();
        return;
    }

    // Update snake position every snakeSpeed ms
    if (Date.now() - lastSnakeUpdate >= snakeSpeed) {
        lastSnakeUpdate = Date.now();
        const head = { ...snake[0] };
        switch (snakeDirection) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            snakeScore++;
            spawnFood();
            if (snakeScore % snakeLevelThreshold === 0) {
                snakeLevel++;
                snakeSpeed = Math.max(30, snakeSpeed - 15); // Faster speed increase
            }
        } else {
            snake.pop();
        }

        if (head.x < 0 || head.x >= canvas.width / 20 ||
            head.y < 0 || head.y >= canvas.height / 20 ||
            snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
            endSnakeGame();
        }
    }
}

function endSnakeGame() {
    snakeGame = false;
    clearInterval(snakeUpdateInterval);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    terminalHistory.push(`Snake game ended. Final Score: ${snakeScore}, Level: ${snakeLevel} `);
}
