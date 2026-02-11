import { BaseData } from '@data/BaseData.ts';
import { PageList } from '@data/RPG';
import { CommonEventTrigger } from '@data/RPG/Enum.ts';



export interface DataCommonEvent {
  id: number;
  list: PageList[]
  name: string;
  switchId: number;
  trigger: CommonEventTrigger;
}
