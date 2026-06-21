import { PageList } from '@data/RPG/page-list.ts';

export interface MoveRoute {
  list: PageList[];
  repeat: boolean;
  skippable: boolean;
  wait: boolean;
}
