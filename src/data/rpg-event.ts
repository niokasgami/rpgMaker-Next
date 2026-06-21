import { Page } from '@data/RPG/page.ts';
import { BaseData } from '@data/BaseData.ts';


export interface RpgEvent extends BaseData {
  pages: Page[];
  x: number;
  y: number;
}
