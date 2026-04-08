import type { Arrow, Balloon, Particle } from '@/types/game';

const GRAVITY = 0.3;
const DRAG = 0.99;
const BALLOON_COLORS = ['#FF9AA2', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#FFDAC1'];

export function createBalloons(wave: number, canvasWidth: number, canvasHeight: number): Balloon[] {
  const balloons: Balloon[] = [];
  const baseCount = 3 + Math.floor(wave / 2);
  const count = Math.min(baseCount, 12);
  const spacing = canvasWidth / (count + 1);

  for (let i = 0; i < count; i++) {
    const x = spacing * (i + 1) + (Math.random() - 0.5) * 20;
    const y = 80 + Math.random() * 100 + (wave > 3 ? Math.random() * 50 : 0);
    
    balloons.push({
      x,
      y,
      radius: 30 + Math.random() * 10,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      vx: wave > 2 ? (Math.random() - 0.5) * 2 : 0,
      scale: 1.0,
      breathPhase: Math.random() * Math.PI * 2
    });
  }

  return balloons;
}

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
    
    particle.vy += GRAVITY * 0.2;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;
    
    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

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
        createParticles(balloon.x, balloon.y, balloon.color, particles);
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

function createParticles(x: number, y: number, color: string, particles: Particle[]): void {
  const particleCount = 10;
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = 3 + Math.random() * 3;
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 30 + Math.random() * 30,
      maxLife: 60,
      color,
      radius: 4 + Math.random() * 4
    });
  }
}

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

  drawBalloons(ctx, balloons);
  drawParticles(ctx, particles);
  drawArrows(ctx, arrows);
  drawBow(ctx, width, height);

  if (aiming && startPos && currentPos) {
    drawAimLine(ctx, width, height, startPos, currentPos, combo);
  }
}

function drawBalloons(ctx: CanvasRenderingContext2D, balloons: Balloon[]): void {
  for (const balloon of balloons) {
    ctx.save();
    ctx.translate(balloon.x, balloon.y);
    ctx.scale(balloon.scale, balloon.scale);

    const gradient = ctx.createRadialGradient(
      -balloon.radius * 0.3,
      -balloon.radius * 0.3,
      0,
      0,
      0,
      balloon.radius
    );
    gradient.addColorStop(0, balloon.color + 'FF');
    gradient.addColorStop(0.7, balloon.color + 'CC');
    gradient.addColorStop(1, balloon.color + '88');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, balloon.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-balloon.radius * 0.3, -balloon.radius * 0.3, balloon.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const particle of particles) {
    const alpha = particle.life / particle.maxLife;
    ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawArrows(ctx: CanvasRenderingContext2D, arrows: Arrow[]): void {
  for (const arrow of arrows) {
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(arrow.rotation);

    const gradient = ctx.createLinearGradient(-20, 0, 20, 0);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(1, '#CCCCCC');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-15, -4);
    ctx.lineTo(-15, 4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}

function drawBow(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const bowX = width / 2;
  const bowY = height - 100;

  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(bowX - 30, bowY - 20);
  ctx.quadraticCurveTo(bowX, bowY + 20, bowX + 30, bowY - 20);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bowX - 30, bowY - 20);
  ctx.lineTo(bowX + 30, bowY - 20);
  ctx.stroke();
}

function drawAimLine(
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

  const lineLength = 100 + power * 150;
  const endX = bowX + Math.cos(angle) * lineLength;
  const endY = bowY + Math.sin(angle) * lineLength;

  const color = combo >= 5 ? '#FF6B35' : 'rgba(255, 255, 255, 0.6)';
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);
  ctx.beginPath();
  ctx.moveTo(bowX, bowY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(endX, endY, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(power * 100)}%`, startPos.x, startPos.y + 30);
}
