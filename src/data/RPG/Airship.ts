import { Bgm } from './Bgm.ts';

export interface Airship {
  bgm: Bgm;
  characterIndex: number;
  characterName: string;
  startMapId: number;
  startX: number;
  startY: number;
}
