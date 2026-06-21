import { BattleCondition, PageList } from '@data/RPG';


export interface TroopMember {
  enemyId: number;
  x: number;
  y: number;
  hidden: boolean;
}

export interface TroopPage {
  conditions: BattleCondition;
  list: PageList[];
  span: number;
}

export interface DataTroop {
  id: number;
  name: string;
  members: TroopMember[];
  pages: TroopPage[];
  span: number;
}

