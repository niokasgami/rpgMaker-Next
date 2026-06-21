import { HitType, ItemDamage, ItemEffect, OccasionType, ScopeType } from '@data/RPG';
import { DataItemBase } from '@data/DataItemBase.ts';

export interface DataUsableItem extends DataItemBase {
  animationId: number;
  damage: ItemDamage;
  effects: ItemEffect[];
  hitType: HitType;
  occasion: OccasionType;
  scope: ScopeType;
  speed: number;
  successRate: number;
  tpGain: number;
}
