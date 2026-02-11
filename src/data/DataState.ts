import { BaseData } from '@data/BaseData.ts';
import { Trait } from '@data/RPG';


export interface DataState extends BaseData {
  autoRemovalTiming: number;
  chanceByDamage: number;
  iconIndex: number;
  maxTurns: number;
  message1: string;
  message2: string;
  message3: string;
  message4: string;
  minTurns: number;
  motion: number;
  overlay: number;
  priority: number;
  releaseByDamage: boolean;
  removeAtBattleEnd: boolean;
  removeByDamage: boolean;
  removeByRestriction: boolean;
  removeByWalking: boolean;
  restriction: number;
  stepsToRemove: number;
  traits: Trait[];
  messageType: number;
}
