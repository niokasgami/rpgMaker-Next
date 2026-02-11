import { BaseData } from '@data/BaseData.ts';
import { Action, DropItem, Trait } from '@data/RPG';


export interface DataEnemy extends BaseData {
  actions: Action[];
  battlerHue: number;
  battlerName: string;
  dropItems: DropItem[];
  exp: number;
  traits: Trait[];
  gold: number;
  params: number[];
}
