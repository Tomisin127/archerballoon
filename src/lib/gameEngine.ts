import type { Arrow, Balloon, Particle, ParticleShape } from '@/types/game';

const GRAVITY = 0.3;
const DRAG = 0.99;

// Vibrant rainbow palette for balloons (no purple per design guidelines)
const BALLOON_COLORS = [
  '#FF4757', // bright red
  '#FF6B35', // coral
  '#FFA502', // orange
  '#FFDD59', // yellow
  '#2ED573', // green
  '#48DBFB', // cyan
  '#1E90FF', // blue
  '#FF6B9D', // hot pink
];

// Bright confetti palette
const CONFETTI_COLORS = [
  '#FF4757',
  '#FF6B35',
  '#FFA502',
  '#FFDD59',
  '#2ED573',
  '#48DBFB',
  '#1E90FF',
  '#FF6B9D',
  '#FFFFFF',
  '#FFD700', // gold
];

// Drifting clouds (module-level so they persist between frames)
interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  puffs: number;
}

const CLOUDS: Cloud[] = [
  { x: 80, y: 70, size: 55, speed: 0.15, puffs: 3 },
  { x: 380, y: 130, size: 75, speed: 0.22, puffs: 4 },
  { x: 620, y: 50, size: 45, speed: 0.1, puffs: 3 },
  { x: 200, y: 180, size: 60, speed: 0.18, puffs: 3 },
  { x: 500, y: 90, size: 50, speed: 0.25, puffs: 3 },
];

// ==================== Creation ====================

export function createBalloons(wave: number, canvasWidth: number, canvasHeight: number): Balloon[] {
  const balloons: Balloon[] = [];
  const baseCount = 3 + Math.floor(wave / 2);
  const count = Math.min(baseCount, 12);
  const spacing = canvasWidth / (count + 1);

  for (let i = 0; i < count; i++) {
    const x = spacing * (i + 1) + (Math.random() - 0.5) * 20;
    const y = 120 + Math.random() * 120 + (wave > 3 ? Math.random() * 60 : 0);

    balloons.push({
      x,
      y,
      radius: 28 + Math.random() * 12,
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

export function updateBalloons(balloons: Balloon[]): void {
  for (const balloon of balloons) {
    balloon.breathPhase += 0.02;
    balloon.scale = 1.0 + Math.sin(balloon.breathPhase) * 0.05;

    if (balloon.vx !== 0) {
      balloon.x += balloon.vx;

      if (balloon.x < balloon.radius || balloon.x > window.innerWidth - balloon.radius) {
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
    x,
    y,
    vx: 0,
    vy: 0,
    life: 16,
    maxLife: 16,
    color: mainColor,
    radius: 10,
    rotation: 0,
    rotationSpeed: 0,
    shape: 'ring',
    size: 10,
    gravity: 0,
  });

  // Confetti shower
  const count = 38;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const roll = Math.random();
    let shape: ParticleShape;
    if (roll < 0.55) shape = 'rect';
    else if (roll < 0.85) shape = 'circle';
    else shape = 'star';

    particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5, // bias upward for shower effect
      life: 70 + Math.random() * 50,
      maxLife: 120,
      color,
      radius: 3 + Math.random() * 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.35,
      shape,
      size: shape === 'rect' ? 5 + Math.random() * 7 : 4 + Math.random() * 5,
      gravity: 0.6 + Math.random() * 0.4,
    });
  }

  // A few larger sparkle circles
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color: '#FFFFFF',
      radius: 5 + Math.random() * 3,
      rotation: 0,
      rotationSpeed: 0,
      shape: 'circle',
      size: 5,
      gravity: 0.2,
    });
  }
}

function createScorePopup(x: number, y: number, particles: Particle[]): void {
  particles.push({
    x,
    y: y - 10,
    vx: 0,
    vy: -2,
    life: 55,
    maxLife: 55,
    color: '#FFD700',
    radius: 0,
    rotation: 0,
    rotationSpeed: 0,
    shape: 'text',
    size: 22,
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
  drawSun(ctx, width, height, time);
  drawClouds(ctx, width, height, time);
  drawGround(ctx, width, height);

  drawBalloons(ctx, balloons);
  drawParticles(ctx, particles);
  drawArrows(ctx, arrows);

  // Compute pullback vector for bow string flex
  let pullDx = 0;
  let pullDy = 0;
  if (aiming && startPos && currentPos) {
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 15) {
      const clamp = Math.min(distance, 120);
      pullDx = (dx / distance) * clamp * 0.25;
      pullDy = (dy / distance) * clamp * 0.25;
    }
  }

  drawBow(ctx, width, height, pullDx, pullDy);

  if (aiming && startPos && currentPos) {
    drawAimTrajectory(ctx, width, height, startPos, currentPos, combo);
  }
}

function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Soft gradient overlay on top of the page background for added atmosphere.
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(30, 58, 138, 0.25)'); // deep blue top
  grad.addColorStop(0.5, 'rgba(251, 146, 60, 0.08)'); // warm middle
  grad.addColorStop(1, 'rgba(253, 186, 116, 0.18)'); // golden bottom
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawSun(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
  const sunX = width - 80;
  const sunY = 90;
  const pulse = Math.sin(time * 0.001) * 3;

  // Outer glow
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 90 + pulse);
  glow.addColorStop(0, 'rgba(255, 220, 120, 0.6)');
  glow.addColorStop(0.5, 'rgba(255, 180, 80, 0.2)');
  glow.addColorStop(1, 'rgba(255, 180, 80, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 90 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // Sun core
  const core = ctx.createRadialGradient(sunX - 8, sunY - 8, 0, sunX, sunY, 32);
  core.addColorStop(0, '#FFFBE0');
  core.addColorStop(0.5, '#FFE066');
  core.addColorStop(1, '#FFB347');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
  ctx.fill();
}

function drawClouds(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
  for (const cloud of CLOUDS) {
    const xOffset = (time * 0.01 * cloud.speed) % (width + 300);
    const x = ((cloud.x + xOffset) % (width + 300)) - 150;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

    // Multiple puffs to form a cloud
    ctx.beginPath();
    const r = cloud.size * 0.5;
    ctx.arc(x, cloud.y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.8, cloud.y - r * 0.4, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x + r * 1.5, cloud.y, r * 0.85, 0, Math.PI * 2);
    ctx.arc(x + r * 2.2, cloud.y - r * 0.2, r * 0.7, 0, Math.PI * 2);
    ctx.arc(x + r * 0.4, cloud.y + r * 0.3, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawGround(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Subtle rolling hill silhouette at the bottom for depth
  const hillY = height - 60;
  const grad = ctx.createLinearGradient(0, hillY, 0, height);
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
  grad.addColorStop(1, 'rgba(6, 95, 70, 0.55)');
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, hillY + 10);
  for (let x = 0; x <= width; x += 40) {
    const y = hillY + Math.sin(x * 0.02) * 10;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
}

function drawBalloons(ctx: CanvasRenderingContext2D, balloons: Balloon[]): void {
  for (const balloon of balloons) {
    ctx.save();
    ctx.translate(balloon.x, balloon.y);
    ctx.scale(balloon.scale, balloon.scale);

    const r = balloon.radius;
    const dark = darkenColor(balloon.color, 0.65);

    // Drop shadow glow (colored)
    ctx.shadowColor = balloon.color;
    ctx.shadowBlur = 18;

    // Balloon body (slightly teardrop - taller than wide)
    const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 0, 0, 0, r * 1.15);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    grad.addColorStop(0.25, balloon.color);
    grad.addColorStop(1, dark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.92, r * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Knot at the bottom
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(-r * 0.12, r * 1.08);
    ctx.lineTo(r * 0.12, r * 1.08);
    ctx.lineTo(0, r * 1.24);
    ctx.closePath();
    ctx.fill();

    // Main glossy highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.22, r * 0.32, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Small secondary highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-r * 0.5, -r * 0.08, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // String
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, r * 1.24);
    ctx.quadraticCurveTo(r * 0.25, r * 1.6, -r * 0.1, r * 2.0);
    ctx.stroke();

    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));

    if (p.shape === 'ring') {
      // Expanding shockwave ring
      const progress = 1 - alpha;
      const radius = p.size + progress * 60;
      ctx.save();
      ctx.globalAlpha = alpha * 0.8;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 4 * alpha;
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
      ctx.font = `bold ${p.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = p.color;
      const scale = 1 + rise * 0.3;
      ctx.translate(p.x, p.y);
      ctx.scale(scale, scale);
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
      // Confetti strip
      ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.55);
    } else if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'star') {
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

    // Shaft
    const shaftGrad = ctx.createLinearGradient(-18, 0, 14, 0);
    shaftGrad.addColorStop(0, '#8B5A2B');
    shaftGrad.addColorStop(0.5, '#D2B48C');
    shaftGrad.addColorStop(1, '#8B5A2B');
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(-16, -1.6, 30, 3.2);

    // Arrowhead (metallic)
    const headGrad = ctx.createLinearGradient(12, -5, 20, 5);
    headGrad.addColorStop(0, '#E8E8E8');
    headGrad.addColorStop(0.5, '#FFFFFF');
    headGrad.addColorStop(1, '#A0A0A0');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(12, -5);
    ctx.lineTo(14, 0);
    ctx.lineTo(12, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Fletching (two feathers - orange)
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-22, -5);
    ctx.lineTo(-10, -2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#E55A2B';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-22, 5);
    ctx.lineTo(-10, 2);
    ctx.closePath();
    ctx.fill();

    // Nock
    ctx.fillStyle = '#4a2c1a';
    ctx.fillRect(-17, -1.8, 2, 3.6);

    ctx.restore();
  }
}

function drawBow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pullDx: number,
  pullDy: number
): void {
  const bowX = width / 2;
  const bowY = height - 100;

  ctx.save();

  // Shadow under bow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;

  // Wooden bow arc - main
  const bowGrad = ctx.createLinearGradient(bowX - 40, bowY, bowX + 40, bowY);
  bowGrad.addColorStop(0, '#5c3317');
  bowGrad.addColorStop(0.5, '#a0522d');
  bowGrad.addColorStop(1, '#5c3317');
  ctx.strokeStyle = bowGrad;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bowX - 38, bowY - 28);
  ctx.quadraticCurveTo(bowX, bowY + 30, bowX + 38, bowY - 28);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Highlight on bow
  ctx.strokeStyle = 'rgba(255, 200, 140, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bowX - 34, bowY - 25);
  ctx.quadraticCurveTo(bowX, bowY + 22, bowX + 34, bowY - 25);
  ctx.stroke();

  // Bow tips
  ctx.fillStyle = '#3e2209';
  ctx.beginPath();
  ctx.arc(bowX - 38, bowY - 28, 3, 0, Math.PI * 2);
  ctx.arc(bowX + 38, bowY - 28, 3, 0, Math.PI * 2);
  ctx.fill();

  // Bowstring (flexes with pullback)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bowX - 38, bowY - 28);
  ctx.lineTo(bowX + pullDx, bowY + pullDy);
  ctx.lineTo(bowX + 38, bowY - 28);
  ctx.stroke();

  // Grip (center wrap)
  ctx.fillStyle = '#2c1810';
  ctx.fillRect(bowX - 5, bowY - 12, 10, 24);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(bowX - 5, bowY - 12, 2, 24);

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

  const color = combo >= 5 ? '#FF6B35' : combo >= 3 ? '#FFDD59' : '#FFFFFF';

  // Dotted trajectory preview using simulated gravity
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;

  const dotCount = 14;
  let px = bowX;
  let py = bowY;
  let vx = simVx;
  let vy = simVy;

  for (let i = 0; i < dotCount; i++) {
    // Simulate a few physics steps per dot for nice spacing
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

  // Power indicator at drag position
  ctx.save();
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 6;

  // Power ring around starting finger position
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(startPos.x, startPos.y, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * power);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(`${Math.floor(power * 100)}%`, startPos.x, startPos.y + 40);
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
