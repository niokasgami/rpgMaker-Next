import { DataItemBase } from '@data/DataItemBase.ts';
import { ItemDamage, ItemEffect } from '@data/RPG';
import { HitType, OccasionType, ScopeType } from '@data/RPG/Enum.ts';
import { DataUsableItem } from '@data/DataUsableItem.ts';


export interface DataItem extends DataUsableItem {
  iTypeId: number;
  consumable: boolean;
}
