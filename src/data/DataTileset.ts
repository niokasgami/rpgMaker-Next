import { BaseData } from '@data/BaseData.ts';
import { TilesetType } from '@data/RPG';


export interface DataTileset extends BaseData {
  flags: number[];
  mode: TilesetType;
  tilesetNames: string[];
}
