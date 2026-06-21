import { AudioObject } from '@data/RPG/audio-object.ts';

export interface Vehicle {
  bgm: AudioObject;
  characterIndex: number;
  characterName: string;
  startMapId: number;
  startX: number;
  startY: number;
}
