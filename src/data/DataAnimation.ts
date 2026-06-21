import { FlashTiming, Rotation, SoundTiming } from './RPG';

export interface DataAnimation {
  id: number;
  displayType: number;
  effectName: string;
  flashTimings: FlashTiming[];
  name: string;
  offsetX: number;
  offsetY: number;
  rotation: Rotation;
  scale: number;
  soundTimings: SoundTiming[];
  speed: number;
}

/** MV-format animation (legacy). */
export interface DataAnimationMV {
  id: number;
  animation1Hue: number;
  animation2Hue: number;
  animation1Name: string;
  animation2Name: string;
  frames: number[][];
}
