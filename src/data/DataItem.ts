import { DataUsableItem } from '@data/DataUsableItem.ts';
import { ItemType } from '@data/RPG';


export interface DataItem extends DataUsableItem {
  itypeId: ItemType;
  consumable: boolean;
}
