import { DataItemBase } from '@data/DataItemBase.ts';
import { ItemDamage, ItemEffect } from '@data/RPG';
import { HitType, OccasionType, ScopeType } from '@data/RPG/Enum.ts';


export interface DataItem extends DataItemBase {
  animationId: number;
  consumable: boolean;
  damage: ItemDamage;
  effects: ItemEffect[];
  hitType: HitType;
  iTypeId : number;
  price: number;
  occasion: OccasionType;
  repeats: number;
  scope: ScopeType;
  speed: number;
  successRate: number;
  tpGain: number;
}
