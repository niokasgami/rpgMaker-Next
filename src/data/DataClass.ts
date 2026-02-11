import { BaseData } from '@data/BaseData.ts';
import { Learning, Trait } from '@data/RPG';


export interface DataClass extends BaseData {
  expParams: number[];
  traits: Trait[];
  learnings: Learning[];
  params: number[][];
}
