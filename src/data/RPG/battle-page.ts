import { BattleCondition } from '@data/RPG/battle-condition.ts';

import { PageList } from '@data/RPG/page-list.ts';

export interface BattlePage {
  conditions: BattleCondition;
  list: PageList[];
  span: number;
}
