import { EventConditions } from './EventConditions.ts';
import { Image } from './Image.ts';
import { PageList } from './PageList.ts';
import { MoveRoute } from './MoveRoute.ts';

export interface Page {
  conditions: EventConditions;
  directionFix: boolean;
  image: Image;
  list: PageList[];
  moveFrequency: number;
  moveRoute: MoveRoute;
  moveSpeed: number;
  moveType: MoveType;
  priorityType: number;
  stepAnime: boolean;
  through: boolean;
  trigger: number;
  walkAnime: boolean;
}


export enum MoveType {
  FIX = 0,
  RANDOM = 1,
  APPROACH = 2,
  CUSTOM = 3,
}
