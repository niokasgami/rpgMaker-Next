import { BaseData } from '@data/BaseData.ts';
import { ActionData, DropItem, TraitData } from '@data/RPG';


export interface DataEnemy extends BaseData {
  actions: ActionData[];
  battlerHue: number;
  battlerName: string;
  dropItems: DropItem[];
  exp: number;
  traits: TraitData[];
  gold: number;
  params: number[];
}
