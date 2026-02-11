import { DataItemBase } from './DataItemBase.ts';
import { Trait } from './RPG';

export interface DataEquipable extends DataItemBase {
  etypeId: number;
  traits: Trait[];
  params: number[];
  price: number;
}
