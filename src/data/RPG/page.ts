import { EventConditions } from '@data/RPG/event-conditions.ts';
import { Image } from '@data/RPG/image.ts';
import { PageList } from '@data/RPG/page-list.ts';
import { MoveRoute } from '@data/RPG/move-route.ts';
import { MoveType } from '@data/RPG/move-type.ts';

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
