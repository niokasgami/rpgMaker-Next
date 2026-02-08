 import {BaseData} from "../BaseData";
 import { Page } from './Page.ts';

  interface Event extends BaseData {
    pages: Page[];
    x: number;
    y: number;
  }
