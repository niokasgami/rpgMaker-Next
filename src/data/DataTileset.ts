import { BaseData } from '@data/BaseData.ts';


export interface DataTileset extends BaseData {
  flags: number[];
  mode: number;
  tilesetNames: string[];
}
