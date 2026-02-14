import { ItemDamage, ItemEffect } from '@data/RPG';
import { HitType, OccasionType, ScopeType } from '@data/RPG/Enum.ts';
import { DataItemBase } from '@data/DataItemBase.ts';

export interface DataUsableItem extends DataItemBase {
  animationId: number;
  damage: ItemDamage;
  effects: ItemEffect[];
  hitType: HitType;
  occasion: OccasionType;
  repeats: number;
  scope: ScopeType;
  speed: number;
  successRate: number;
  tpGain: number;
}
