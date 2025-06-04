const canvas = document.getElementById('wormhole-canvas');
const ctx = canvas.getContext('2d');

let time = 0;
let mouseX = 0;
let mouseY = 0;

let warpSpeed = 1;

function resizeCanvas() {
    // Get device pixel ratio for high-DPI displays
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size in CSS pixels
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    // Set actual canvas size in device pixels
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    // Scale the drawing context so everything draws at the correct size
    ctx.scale(dpr, dpr);

    // Enable anti-aliasing and smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
}

function drawWormhole() {
    const dpr = window.devicePixelRatio || 1;

    // Use CSS pixel dimensions for calculations
    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillStyle = 'white';

    // Use smaller step size for smoother curves
    const stepSize = 2; // Reduced from 5 to 2 for higher resolution

    for (let i = 0; i < 15; i++) {
        ctx.beginPath();

        for (let x = 0; x < width; x += stepSize) {
            let baseY = height / 2 +
                Math.sin(x * 0.01 + i * 0.2 + time * 0.1) *
                (20 + i * 10) *
                (1 - x / width);

            let dx = x - mouseX;
            let dy = baseY - mouseY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            let effect = 50 / (1 + distance * 0.1);
            let y = baseY + effect * (baseY > mouseY ? 1 : -1);

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        // Set line width based on DPI for consistent appearance
        ctx.lineWidth = 1 / dpr;
        ctx.stroke();
    }

    time += 0.05 * warpSpeed;

    requestAnimationFrame(drawWormhole);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawWormhole();

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
