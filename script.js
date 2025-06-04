const canvas = document.getElementById('wormhole-canvas');
const ctx = canvas.getContext('2d');

let time = 0;
let mouseX = 0;
let mouseY = 0;

let warpSpeed = 1;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawWormhole() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillStyle = 'white';

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
