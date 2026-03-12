import { AudioObject } from './AudioObject.ts';

export interface Vehicle {
  bgm: AudioObject;
  characterIndex: number;
  characterName: string;
  startMapId: number;
  startX: number;
  startY: number;
}
