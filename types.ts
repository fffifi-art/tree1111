export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleConfig {
  count: number;
  radius: number;
  height: number;
  color: string;
}

export interface OrnamentConfig {
  count: number;
  type: 'sphere' | 'box';
  color: string;
  scale: number;
}