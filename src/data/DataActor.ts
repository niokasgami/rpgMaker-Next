import { BaseData } from "./BaseData.ts";
import { TraitData } from './RPG';


export interface DataActor extends BaseData {
  battlerName: string;
  characterIndex: number;
  characterName: string;
  classId: number;
  equips: number[];
  faceIndex: number;
  faceName: string;
  traits: TraitData[];
  initialLevel: number;
  maxLevel: number;
  nickname: string;
  profile: string;
}
