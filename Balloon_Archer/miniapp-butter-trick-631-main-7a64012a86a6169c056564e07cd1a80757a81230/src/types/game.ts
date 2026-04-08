export interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  active: boolean;
}

export interface Balloon {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  scale: number;
  breathPhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  radius: number;
}
