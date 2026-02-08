import { PageList } from './PageList.ts';

export interface MoveRoute {
    list: PageList[];
    repeat: boolean;
    skippable: boolean;
    wait: boolean;
  }
