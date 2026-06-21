import { CommonEventTrigger, PageList } from '@data/RPG';


export interface DataCommonEvent {
  id: number;
  list: PageList[];
  name: string;
  switchId: number;
  trigger: CommonEventTrigger;
}
