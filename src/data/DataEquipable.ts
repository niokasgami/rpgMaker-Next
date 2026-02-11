import { DataItemBase } from './DataItemBase.ts';
import { TraitData } from './RPG';

export interface DataEquipable extends DataItemBase {
  etypeId: number;
  traits: TraitData[];
  params: number[];
  price: number;
}
