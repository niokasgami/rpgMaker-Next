import { BaseData } from '@data/BaseData.ts';


export enum TilesetType {
  OVERWORLD = 0,
  AREA = 0
}
export interface DataTileset extends BaseData {
  flags: number[];
  mode: TilesetType;
  tilesetNames: string[];
}
