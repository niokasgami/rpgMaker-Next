import { BattleCondition, PageList } from '@data/RPG';


export interface DataTroop {
  id: number;
  members : {
    enemyId: number;
    x: number;
    y: number;
    hidden: boolean;
  }[];
  name: string;
  pages: {
    conditions: BattleCondition;
    list: PageList[];
    span: number;
  }[];
  span: number;
}
