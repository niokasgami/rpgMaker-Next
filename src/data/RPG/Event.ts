 import {BaseData} from "../BaseData";
 import { Page } from './Page.ts';

 export interface RpgEvent extends BaseData {
    pages: Page[];
    x: number;
    y: number;
  }
