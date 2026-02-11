import { DataItem } from '@data/DataItem.ts';

export interface DataItemConsumable extends DataItem {
  price: number;
  iTypeId : number;
  consumable: boolean;
}
