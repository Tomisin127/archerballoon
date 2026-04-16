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

export type ParticleShape = 'rect' | 'circle' | 'star' | 'text' | 'ring';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  shape: ParticleShape;
  size: number;
  text?: string;
  gravity?: number;
}
