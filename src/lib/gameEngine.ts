import type { Arrow, Balloon, Particle, ParticleShape } from '@/types/game';

const GRAVITY = 0.3;
const DRAG = 0.99;

// Vibrant rainbow palette for balloons (no purple per design guidelines)
const BALLOON_COLORS = [
  '#FF3355', // bright red
  '#FF7A00', // orange
  '#FFC300', // golden yellow
  '#22D36B', // emerald
  '#00BCD4', // cyan
  '#1E90FF', // blue
  '#FF4FA3', // hot pink
  '#FF5E3A', // coral
];

// Bright confetti palette
const CONFETTI_COLORS = [
  '#FF3355',
  '#FF7A00',
  '#FFC300',
  '#FFD700',
  '#22D36B',
  '#00E5FF',
  '#1E90FF',
  '#FF4FA3',
  '#FFFFFF',
  '#FFE066',
];

// Drifting clouds (module-level so they persist between frames)
interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

const CLOUDS: Cloud[] = [
  { x: 80, y: 70, size: 55, speed: 0.15, opacity: 0.95 },
  { x: 380, y: 130, size: 75, speed: 0.22, opacity: 0.9 },
  { x: 620, y: 50, size: 45, speed: 0.1, opacity: 0.85 },
  { x: 200, y: 180, size: 60, speed: 0.18, opacity: 0.88 },
  { x: 500, y: 90, size: 50, speed: 0.25, opacity: 0.92 },
  { x: 100, y: 220, size: 40, speed: 0.12, opacity: 0.75 },
];

// Small pre-generated star positions used as sky sparkles
const STAR_SPECKS: Array<{ x: number; y: number; size: number; twinkle: number }> = Array.from({ length: 18 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.35,
  size: 0.8 + Math.random() * 1.4,
  twinkle: Math.random() * Math.PI * 2,
}));

// ==================== Creation ====================

export function createBalloons(wave: number, canvasWidth: number, canvasHeight: number): Balloon[] {
  const balloons: Balloon[] = [];
  const baseCount = 3 + Math.floor(wave / 2);
  const count = Math.min(baseCount, 12);
  const spacing = canvasWidth / (count + 1);

  for (let i = 0; i < count; i++) {
    const x = spacing * (i + 1) + (Math.random() - 0.5) * 24;
    const y = 130 + Math.random() * 130 + (wave > 3 ? Math.random() * 60 : 0);

    balloons.push({
      x,
      y,
      radius: 34 + Math.random() * 12,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      vx: wave > 2 ? (Math.random() - 0.5) * 2 : 0,
      scale: 1.0,
      breathPhase: Math.random() * Math.PI * 2,
    });
  }

  return balloons;
}

// ==================== Updates ====================

export function updateArrows(arrows: Arrow[], canvasWidth: number, canvasHeight: number): void {
  for (let i = arrows.length - 1; i >= 0; i--) {
    const arrow = arrows[i];

    arrow.vy += GRAVITY;
    arrow.vx *= DRAG;
    arrow.vy *= DRAG;

    arrow.x += arrow.vx;
    arrow.y += arrow.vy;

    arrow.rotation = Math.atan2(arrow.vy, arrow.vx);

    if (arrow.y > canvasHeight + 50 || arrow.x < -50 || arrow.x > canvasWidth + 50) {
      arrows.splice(i, 1);
    }
  }
}

export function updateBalloons(balloons: Balloon[], canvasWidth?: number): void {
  const width = canvasWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 800);
  for (const balloon of balloons) {
    balloon.breathPhase += 0.02;
    balloon.scale = 1.0 + Math.sin(balloon.breathPhase) * 0.05;

    if (balloon.vx !== 0) {
      balloon.x += balloon.vx;

      if (balloon.x < balloon.radius || balloon.x > width - balloon.radius) {
        balloon.vx *= -1;
      }
    }
  }
}

export function updateParticles(particles: Particle[]): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];

    const g = particle.gravity ?? 0.2;
    particle.vy += GRAVITY * g;
    particle.vx *= 0.99;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.rotationSpeed;
    particle.life--;

    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// ==================== Collisions ====================

export function checkCollisions(
  arrows: Arrow[],
  balloons: Balloon[],
  particles: Particle[]
): { poppedBalloons: number; hitArrows: number } {
  let poppedBalloons = 0;
  let hitArrows = 0;

  for (let i = arrows.length - 1; i >= 0; i--) {
    const arrow = arrows[i];
    let arrowHit = false;

    for (let j = balloons.length - 1; j >= 0; j--) {
      const balloon = balloons[j];
      const dx = arrow.x - balloon.x;
      const dy = arrow.y - balloon.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < balloon.radius) {
        createConfettiBurst(balloon.x, balloon.y, balloon.color, particles);
        createScorePopup(balloon.x, balloon.y, particles);
        balloons.splice(j, 1);
        poppedBalloons++;
        arrowHit = true;

        const speed = Math.sqrt(arrow.vx * arrow.vx + arrow.vy * arrow.vy);
        if (speed < 5) {
          arrows.splice(i, 1);
          break;
        }
      }
    }

    if (arrowHit) {
      hitArrows++;
    }
  }

  return { poppedBalloons, hitArrows };
}

function createConfettiBurst(x: number, y: number, mainColor: string, particles: Particle[]): void {
  // Bright expanding shockwave ring
  particles.push({
    x, y,
    vx: 0, vy: 0,
    life: 18, maxLife: 18,
    color: mainColor,
    radius: 10,
    rotation: 0, rotationSpeed: 0,
    shape: 'ring',
    size: 10,
    gravity: 0,
  });

  // Secondary inner ring (white)
  particles.push({
    x, y,
    vx: 0, vy: 0,
    life: 14, maxLife: 14,
    color: '#FFFFFF',
    radius: 6,
    rotation: 0, rotationSpeed: 0,
    shape: 'ring',
    size: 6,
    gravity: 0,
  });

  // Confetti shower
  const count = 42;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const roll = Math.random();
    let shape: ParticleShape;
    if (roll < 0.5) shape = 'rect';
    else if (roll < 0.82) shape = 'circle';
    else shape = 'star';

    particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      life: 70 + Math.random() * 50,
      maxLife: 120,
      color,
      radius: 3 + Math.random() * 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      shape,
      size: shape === 'rect' ? 5 + Math.random() * 8 : 4 + Math.random() * 5,
      gravity: 0.6 + Math.random() * 0.4,
    });
  }

  // Larger white sparkles
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color: '#FFFFFF',
      radius: 5 + Math.random() * 3,
      rotation: 0, rotationSpeed: 0,
      shape: 'circle',
      size: 5,
      gravity: 0.2,
    });
  }

  // Gold star bursts
  for (let i = 0; i < 4; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 50 + Math.random() * 20,
      maxLife: 70,
      color: '#FFD700',
      radius: 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      shape: 'star',
      size: 9 + Math.random() * 3,
      gravity: 0.5,
    });
  }
}

function createScorePopup(x: number, y: number, particles: Particle[]): void {
  particles.push({
    x,
    y: y - 10,
    vx: 0,
    vy: -2,
    life: 60,
    maxLife: 60,
    color: '#FFD700',
    radius: 0,
    rotation: 0,
    rotationSpeed: 0,
    shape: 'text',
    size: 26,
    text: '+100',
    gravity: 0,
  });
}

// ==================== Drawing ====================

export function drawGame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  arrows: Arrow[],
  balloons: Balloon[],
  particles: Particle[],
  aiming: boolean,
  startPos: { x: number; y: number } | null,
  currentPos: { x: number; y: number } | null,
  combo: number
): void {
  ctx.clearRect(0, 0, width, height);

  const time = performance.now();

  drawSky(ctx, width, height);
  drawStars(ctx, width, height, time);
  drawSun(ctx, width, height, time);
  drawClouds(ctx, width, height, time);
  drawDistantMountains(ctx, width, height);
  drawGround(ctx, width, height);
  drawGrassBlades(ctx, width, height);

  drawBalloons(ctx, balloons);
  drawParticles(ctx, particles);
  drawArrows(ctx, arrows);

  // Pullback vector for bow string flex
  let pullDx = 0;
  let pullDy = 0;
  if (aiming && startPos && currentPos) {
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 15) {
      const clamp = Math.min(distance, 140);
      pullDx = (dx / distance) * clamp * 0.3;
      pullDy = (dy / distance) * clamp * 0.3;
    }
  }

  drawBow(ctx, width, height, pullDx, pullDy, aiming);

  if (aiming && startPos && currentPos) {
    drawAimTrajectory(ctx, width, height, startPos, currentPos, combo);
  }
}

function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Richer multi-stop atmospheric gradient overlay
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(29, 78, 216, 0.35)');   // deep indigo-blue top
  grad.addColorStop(0.35, 'rgba(56, 189, 248, 0.12)');
  grad.addColorStop(0.65, 'rgba(251, 146, 60, 0.10)');
  grad.addColorStop(1, 'rgba(253, 186, 116, 0.22)'); // golden bottom
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
  ctx.save();
  for (const s of STAR_SPECKS) {
    const x = s.x * width;
    const y = s.y * height;
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.003 + s.twinkle));
    ctx.globalAlpha = twinkle * 0.6;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSun(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
  const sunX = width - 90;
  const sunY = 100;
  const pulse = Math.sin(time * 0.0012) * 3;

  // Outer soft glow
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 120 + pulse);
  glow.addColorStop(0, 'rgba(255, 225, 140, 0.55)');
  glow.addColorStop(0.45, 'rgba(255, 180, 80, 0.18)');
  glow.addColorStop(1, 'rgba(255, 180, 80, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 120 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // Rotating sun rays
  ctx.save();
  ctx.translate(sunX, sunY);
  ctx.rotate(time * 0.00015);
  ctx.strokeStyle = 'rgba(255, 220, 150, 0.55)';
  ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const inner = 40 + pulse;
    const outer = 58 + (i % 2 === 0 ? 10 : 4) + pulse;
    ctx.lineWidth = i % 2 === 0 ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.restore();

  // Sun core
  const core = ctx.createRadialGradient(sunX - 10, sunY - 10, 0, sunX, sunY, 36);
  core.addColorStop(0, '#FFFDF0');
  core.addColorStop(0.5, '#FFE066');
  core.addColorStop(1, '#FFA94D');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
  ctx.fill();

  // Inner bright rim highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sunX - 6, sunY - 6, 22, -Math.PI, -Math.PI * 0.3);
  ctx.stroke();
}

function drawClouds(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
  for (const cloud of CLOUDS) {
    const xOffset = (time * 0.01 * cloud.speed) % (width + 300);
    const x = ((cloud.x + xOffset) % (width + 300)) - 150;

    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 8;

    // Cloud base gradient for subtle volume
    const r = cloud.size * 0.5;
    const cloudGrad = ctx.createLinearGradient(x, cloud.y - r, x, cloud.y + r);
    cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${cloud.opacity})`);
    cloudGrad.addColorStop(1, `rgba(226, 232, 240, ${cloud.opacity * 0.9})`);
    ctx.fillStyle = cloudGrad;

    ctx.beginPath();
    ctx.arc(x, cloud.y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.8, cloud.y - r * 0.4, r * 0.8, 0, Math.PI * 2);
    ctx.arc(x + r * 1.5, cloud.y, r * 0.85, 0, Math.PI * 2);
    ctx.arc(x + r * 2.2, cloud.y - r * 0.2, r * 0.7, 0, Math.PI * 2);
    ctx.arc(x + r * 0.4, cloud.y + r * 0.3, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Bright top highlight
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(x + r * 0.8, cloud.y - r * 0.55, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawDistantMountains(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Far mountains (blue-purple haze)
  const baseY = height - 110;
  ctx.save();
  const farGrad = ctx.createLinearGradient(0, baseY - 60, 0, baseY + 20);
  farGrad.addColorStop(0, 'rgba(71, 85, 105, 0.45)');
  farGrad.addColorStop(1, 'rgba(51, 65, 85, 0.55)');
  ctx.fillStyle = farGrad;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  const points = 7;
  for (let i = 0; i <= points; i++) {
    const x = (width / points) * i;
    const offset = (i % 2 === 0) ? 50 : 25;
    ctx.lineTo(x, baseY - offset);
  }
  ctx.lineTo(width, baseY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Mid mountains (darker with snow tips)
  const midY = height - 85;
  const midGrad = ctx.createLinearGradient(0, midY - 40, 0, midY + 20);
  midGrad.addColorStop(0, 'rgba(30, 41, 59, 0.55)');
  midGrad.addColorStop(1, 'rgba(15, 23, 42, 0.6)');
  ctx.fillStyle = midGrad;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  const midPoints = 9;
  const peakYs: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= midPoints; i++) {
    const x = (width / midPoints) * i;
    const offset = 20 + (i % 3 === 0 ? 25 : 8);
    const y = midY - offset;
    peakYs.push({ x, y });
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, midY);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Snow caps on peaks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  for (const peak of peakYs) {
    if (peak.y < midY - 30) {
      ctx.beginPath();
      ctx.moveTo(peak.x - 10, peak.y + 8);
      ctx.lineTo(peak.x, peak.y);
      ctx.lineTo(peak.x + 10, peak.y + 8);
      ctx.quadraticCurveTo(peak.x + 4, peak.y + 6, peak.x, peak.y + 10);
      ctx.quadraticCurveTo(peak.x - 4, peak.y + 6, peak.x - 10, peak.y + 8);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawGround(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const hillY = height - 70;

  // Rolling green hill with depth
  const grad = ctx.createLinearGradient(0, hillY - 20, 0, height);
  grad.addColorStop(0, 'rgba(34, 197, 94, 0.85)');
  grad.addColorStop(0.5, 'rgba(22, 163, 74, 0.95)');
  grad.addColorStop(1, 'rgba(5, 95, 47, 1)');
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, hillY + 10);
  for (let x = 0; x <= width; x += 30) {
    const y = hillY + Math.sin(x * 0.018) * 12 + Math.sin(x * 0.04) * 4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Bright rim highlight along hill top
  ctx.strokeStyle = 'rgba(134, 239, 172, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 30) {
    const y = hillY + Math.sin(x * 0.018) * 12 + Math.sin(x * 0.04) * 4;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawGrassBlades(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const hillY = height - 70;
  ctx.save();
  ctx.strokeStyle = 'rgba(21, 128, 61, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Deterministic sparse blades across hill surface
  for (let x = 10; x < width; x += 18) {
    const baseY = hillY + Math.sin(x * 0.018) * 12 + Math.sin(x * 0.04) * 4;
    const bladeH = 5 + ((x * 7) % 5);
    const lean = ((x * 13) % 5 - 2) * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + lean, baseY - bladeH);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBalloons(ctx: CanvasRenderingContext2D, balloons: Balloon[]): void {
  for (const balloon of balloons) {
    ctx.save();
    ctx.translate(balloon.x, balloon.y);
    ctx.scale(balloon.scale, balloon.scale);

    const r = balloon.radius;
    const dark = darkenColor(balloon.color, 0.6);
    const darker = darkenColor(balloon.color, 0.4);

    // Colored glow aura
    ctx.shadowColor = balloon.color;
    ctx.shadowBlur = 22;

    // Balloon body (teardrop, taller than wide)
    const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.45, 0, 0, 0, r * 1.2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.18, lightenColor(balloon.color, 0.25));
    grad.addColorStop(0.5, balloon.color);
    grad.addColorStop(1, darker);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.92, r * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Subtle outer rim
    ctx.strokeStyle = darker;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.92, r * 1.1, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Knot at the bottom
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-r * 0.14, r * 1.06);
    ctx.lineTo(r * 0.14, r * 1.06);
    ctx.lineTo(0, r * 1.28);
    ctx.closePath();
    ctx.fill();

    // Knot highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(-r * 0.1, r * 1.08);
    ctx.lineTo(-r * 0.02, r * 1.08);
    ctx.lineTo(-r * 0.05, r * 1.18);
    ctx.closePath();
    ctx.fill();

    // Primary glossy highlight (elongated)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.42, r * 0.22, r * 0.36, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Secondary small highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(-r * 0.5, -r * 0.05, r * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // Tiny bottom shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.ellipse(r * 0.15, r * 0.55, r * 0.22, r * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ribbon string (curvier)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, r * 1.28);
    ctx.bezierCurveTo(
      r * 0.4, r * 1.5,
      -r * 0.3, r * 1.8,
      r * 0.1, r * 2.15
    );
    ctx.stroke();

    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));

    if (p.shape === 'ring') {
      const progress = 1 - alpha;
      const radius = p.size + progress * 70;
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 5 * alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (p.shape === 'text') {
      const rise = 1 - alpha;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${p.size}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      const scale = 1 + rise * 0.4;
      ctx.translate(p.x, p.y);
      ctx.scale(scale, scale);

      // Gold stroke + fill
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 3;
      ctx.strokeText(p.text ?? '', 0, 0);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text ?? '', 0, 0);
      ctx.restore();
      continue;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;

    if (p.shape === 'rect') {
      // Confetti strip with subtle 3D shading
      ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.55);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.15);
    } else if (p.shape === 'circle') {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'star') {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      drawStar(ctx, 0, 0, 5, p.size * 0.6, p.size * 0.3);
      ctx.fill();
    }

    ctx.restore();
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
): void {
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.closePath();
}

function drawArrows(ctx: CanvasRenderingContext2D, arrows: Arrow[]): void {
  for (const arrow of arrows) {
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.rotation);

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    // Shaft (wooden)
    const shaftGrad = ctx.createLinearGradient(-20, -2, -20, 2);
    shaftGrad.addColorStop(0, '#B8742E');
    shaftGrad.addColorStop(0.5, '#E6B37F');
    shaftGrad.addColorStop(1, '#8B5A2B');
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(-18, -2, 32, 4);

    // Shaft binding rings
    ctx.fillStyle = '#3E2209';
    ctx.fillRect(-4, -2.2, 1.5, 4.4);
    ctx.fillRect(4, -2.2, 1.5, 4.4);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Arrowhead (barbed triangular, metallic)
    const headGrad = ctx.createLinearGradient(12, -6, 22, 6);
    headGrad.addColorStop(0, '#F1F5F9');
    headGrad.addColorStop(0.5, '#FFFFFF');
    headGrad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(14, -6);
    ctx.lineTo(16, 0);
    ctx.lineTo(14, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Head highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, -4);
    ctx.lineTo(22, 0);
    ctx.stroke();

    // Fletching feathers (upper + lower with shadows)
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-24, -6);
    ctx.quadraticCurveTo(-16, -4, -10, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#C2410C';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#FF8F5C';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-24, 6);
    ctx.quadraticCurveTo(-16, 4, -10, 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#C2410C';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Nock
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(-19, -2, 2.5, 4);

    ctx.restore();
  }
}

function drawBow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pullDx: number,
  pullDy: number,
  aiming: boolean
): void {
  const bowX = width / 2;
  const bowY = height - 100;

  ctx.save();

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;

  // Main wooden bow arc - thicker, richer gradient
  const bowGrad = ctx.createLinearGradient(bowX - 50, bowY, bowX + 50, bowY);
  bowGrad.addColorStop(0, '#3E1F08');
  bowGrad.addColorStop(0.35, '#9A5A1F');
  bowGrad.addColorStop(0.5, '#D18B4C');
  bowGrad.addColorStop(0.65, '#9A5A1F');
  bowGrad.addColorStop(1, '#3E1F08');
  ctx.strokeStyle = bowGrad;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bowX - 42, bowY - 32);
  ctx.quadraticCurveTo(bowX, bowY + 34, bowX + 42, bowY - 32);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Inner wood highlight
  ctx.strokeStyle = 'rgba(255, 210, 150, 0.65)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(bowX - 38, bowY - 28);
  ctx.quadraticCurveTo(bowX, bowY + 24, bowX + 38, bowY - 28);
  ctx.stroke();

  // Thin dark outline for definition
  ctx.strokeStyle = 'rgba(30, 15, 4, 0.4)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(bowX - 42, bowY - 32);
  ctx.quadraticCurveTo(bowX, bowY + 34, bowX + 42, bowY - 32);
  ctx.stroke();

  // Bow tip caps (metal)
  const tipGrad = ctx.createRadialGradient(bowX - 42, bowY - 32, 0, bowX - 42, bowY - 32, 5);
  tipGrad.addColorStop(0, '#FFFFFF');
  tipGrad.addColorStop(1, '#64748B');
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.arc(bowX - 42, bowY - 32, 4, 0, Math.PI * 2);
  ctx.fill();

  const tipGrad2 = ctx.createRadialGradient(bowX + 42, bowY - 32, 0, bowX + 42, bowY - 32, 5);
  tipGrad2.addColorStop(0, '#FFFFFF');
  tipGrad2.addColorStop(1, '#64748B');
  ctx.fillStyle = tipGrad2;
  ctx.beginPath();
  ctx.arc(bowX + 42, bowY - 32, 4, 0, Math.PI * 2);
  ctx.fill();

  // Bowstring (flexes with pullback)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 1.6;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.moveTo(bowX - 42, bowY - 32);
  ctx.lineTo(bowX + pullDx, bowY + pullDy);
  ctx.lineTo(bowX + 42, bowY - 32);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Loaded arrow hint when aiming (small arrow visual on the string)
  if (aiming) {
    ctx.save();
    ctx.translate(bowX + pullDx * 0.6, bowY + pullDy * 0.6);
    const angle = Math.atan2(-pullDy, -pullDx);
    ctx.rotate(angle);
    // small arrowhead pointing out
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(3, -3);
    ctx.lineTo(3, 3);
    ctx.closePath();
    ctx.fill();
    // shaft
    ctx.fillStyle = '#B8742E';
    ctx.fillRect(-18, -1, 21, 2);
    ctx.restore();
  }

  // Center grip (leather wrap)
  const gripGrad = ctx.createLinearGradient(bowX - 6, bowY, bowX + 6, bowY);
  gripGrad.addColorStop(0, '#1C1008');
  gripGrad.addColorStop(0.5, '#4A2E15');
  gripGrad.addColorStop(1, '#1C1008');
  ctx.fillStyle = gripGrad;
  ctx.fillRect(bowX - 6, bowY - 14, 12, 28);

  // Grip binding lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 0.8;
  for (let i = -12; i <= 12; i += 4) {
    ctx.beginPath();
    ctx.moveTo(bowX - 6, bowY + i);
    ctx.lineTo(bowX + 6, bowY + i);
    ctx.stroke();
  }

  // Grip sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(bowX - 5, bowY - 13, 2, 26);

  // Arrow rest (small notch on bow)
  ctx.fillStyle = '#2C1810';
  ctx.fillRect(bowX + 6, bowY - 2, 4, 4);

  ctx.restore();
}

function drawAimTrajectory(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  startPos: { x: number; y: number },
  currentPos: { x: number; y: number },
  combo: number
): void {
  const dx = currentPos.x - startPos.x;
  const dy = currentPos.y - startPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 15) return;

  const bowX = width / 2;
  const bowY = height - 100;
  const angle = Math.atan2(-dy, -dx);
  const power = Math.min(distance / 250, 1.0);

  const baseSpeed = 10 + power * 20;
  const simVx = Math.cos(angle) * baseSpeed;
  const simVy = Math.sin(angle) * baseSpeed;

  const color = combo >= 5 ? '#FF3355' : combo >= 3 ? '#FFD700' : '#FFFFFF';

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;

  const dotCount = 16;
  let px = bowX;
  let py = bowY;
  let vx = simVx;
  let vy = simVy;

  for (let i = 0; i < dotCount; i++) {
    for (let s = 0; s < 3; s++) {
      vy += GRAVITY;
      vx *= DRAG;
      vy *= DRAG;
      px += vx;
      py += vy;
    }

    const t = i / dotCount;
    ctx.globalAlpha = (1 - t) * 0.9;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 5 - t * 3, 0, Math.PI * 2);
    ctx.fill();

    if (py > height || px < 0 || px > width) break;
  }

  ctx.restore();

  // Power ring around starting finger position
  ctx.save();
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 6;

  // Background ring (dim)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(startPos.x, startPos.y, 24, 0, Math.PI * 2);
  ctx.stroke();

  // Filled power progress
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(startPos.x, startPos.y, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * power);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(`${Math.floor(power * 100)}%`, startPos.x, startPos.y + 42);
  ctx.restore();
}

// ==================== Helpers ====================

function darkenColor(hex: string, factor: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}

function lightenColor(hex: string, factor: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))}, ${Math.min(255, Math.floor(g + (255 - g) * factor))}, ${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
}
