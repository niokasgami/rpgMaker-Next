import { BaseData } from '@data/BaseData.ts';
import { Action, DropItem, TraitData } from '@data/RPG';


export interface DataEnemy extends BaseData {
  actions: Action[];
  battlerHue: number;
  battlerName: string;
  dropItems: DropItem[];
  exp: number;
  traits: TraitData[];
  gold: number;
  params: number[];
}
