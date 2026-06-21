import { Learning, TraitData } from '@data/RPG';
import { BaseData } from '@data/BaseData.ts';


export interface DataClass extends BaseData {
  expParams: number[];
  traits: TraitData[];
  learnings: Learning[];
  /** params[paramId][level] */
  params: number[][];
}
