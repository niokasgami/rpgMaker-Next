import { DataItemBase } from '@data/DataItemBase.ts';
import { ItemDamage, ItemEffect } from '@data/RPG';


export interface DataSkill extends DataItemBase {
  animationId: number;
  damage: ItemDamage;
  effects: ItemEffect[];
  hitType: number;
  message1: string;
  message2: string;
  mpCost: number;
  occasion: number;
  repeats: number;
  requiredWtypeId1: number;
  requiredWtypeId2: number;
  scope: number;
  speed: number;
  stypeId: number;
  successRate: number;
  tpCost: number;
  tpGain: number;
  messageType: number;
}
