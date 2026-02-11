import { AudioObject } from './AudioObject.ts';

export interface Vehicule {
  bgm: AudioObject;
  characterIndex: number;
  characterName: string;
  startMapId: number;
  startX: number;
  startY: number;
}
