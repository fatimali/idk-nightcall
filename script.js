const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioCtx, analyser, dataArray;
let time = 0;

const dots = [];
const dotCount = 1000;

for (let i = 0; i < dotCount; i++) {
  dots.push({
    baseX: Math.random() * canvas.width,
    baseY: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    angle: Math.random() * Math.PI * 2,
    radiusOffset: Math.random() * 80 + 20,
    speed: Math.random() * 0.002 + 0.0015,
    colorHue: Math.random() * 360
  });
}

function setupAudio() {
  const audio = document.getElementById("audio");

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 128;

  dataArray = new Uint8Array(analyser.frequencyBinCount);

  audio.play();
  animate();
}

function drawDots(bass, mid) {
  // Motion blur effect
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  dots.forEach(dot => {
    const spinFactor = Math.sin(time * 0.002 + dot.baseX * 0.001) * 0.5;
    const x = dot.baseX + Math.cos(dot.angle + time * 0.005 + spinFactor) * dot.radiusOffset;
    const y = dot.baseY + Math.sin(dot.angle * 1.2 + time * 0.005) * dot.radiusOffset * 0.6;

    const size = dot.r + bass * 5;
    const hue = (dot.colorHue + time * 0.4 + bass * 200) % 360;
    const glow = 25 + mid * 60;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
    ctx.shadowBlur = glow;
    ctx.fillStyle = `hsl(${hue}, 100%, ${50 + bass * 50}%)`;
    ctx.fill();

    dot.angle += dot.speed;
  });
}

function liquifyEffect(strength) {
  ctx.save();
  const offset = Math.sin(time * 0.02) * strength;
  ctx.setTransform(1, 0, 0.04 * offset, 1, 0, 0);
  ctx.drawImage(canvas, 0, 0);
  ctx.restore();
}

function zoomAndSpin(bass) {
  ctx.save();

  const zoom = 1 + Math.sin(time * 0.005 + bass * 5) * 0.015;
  const angle = Math.sin(time * 0.001 + bass * 3) * 0.01;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);
  ctx.scale(zoom, zoom);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  ctx.drawImage(canvas, 0, 0);
  ctx.restore();
}

function animate() {
  time++;

  analyser.getByteFrequencyData(dataArray);
  const bass = dataArray[1] / 255;
  const mid = dataArray[32] / 255;

  drawDots(bass, mid);
  liquifyEffect(bass * 6);
  zoomAndSpin(bass);

  requestAnimationFrame(animate);
}

document.getElementById("audio").addEventListener("play", setupAudio);
