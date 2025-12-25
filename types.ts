
export enum GestureType {
  NONE = 'NONE',
  TREE = 'TREE',      // Closed hand / Fist
  TEXT = 'TEXT'       // Open hand / Spread
}

export interface ParticleState {
  currentGesture: GestureType;
  isMuted: boolean;
  isCameraOn: boolean;
}
