import { AudioObject, Encounter } from '@data/RPG';
import { RpgEvent } from '@data/rpg-event.ts';


export interface DataMap {
  autoplayBgm: boolean;
  autoplayBgs: boolean;
  battleback1Name: string;
  battleback2Name: string;
  bgm: AudioObject;
  bgs: AudioObject;
  disableDashing: boolean;
  displayName: string;
  encounterList: Encounter[];
  encounterStep: number;
  height: number;
  note: string;
  parallaxLoopX: boolean;
  parallaxLoopY: boolean;
  parallaxName: string;
  parallaxShow: boolean;
  parallaxSx: number;
  parallaxSy: number;
  scrollType: number;
  specifyBattleback: boolean;
  tilesetId: number;
  width: number;
  data: number[];
  events: RpgEvent[];
}
