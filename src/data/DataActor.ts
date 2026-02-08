import { BaseData } from "./BaseData.ts";
import { Trait } from './RPG';

export interface DataActor extends BaseData {
  battlerName: string;
  characterIndex: number;
  characterName: string;
  classId: number;
  equips: number[];
  faceIndex: number;
  faceName: string;
  traits: Trait[];
  initialLevel: number;
  maxLevel: number;
  nickname: string;
  profile: string;
}
