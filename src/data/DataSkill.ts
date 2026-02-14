import { DataItemBase } from '@data/DataItemBase.ts';
import { DataUsableItem } from '@data/DataUsableItem.ts';


export interface DataSkill extends DataUsableItem {
  message1: string;
  message2: string;
  mpCost: number;
  stypeId: number;
  tpCost: number;
  requiredWtypeId1: number;
  requiredWtypeId2: number;
  messageType: number;
}
