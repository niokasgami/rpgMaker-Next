import { DropItemKind } from '@data/RPG/drop-item-kind.ts';

export interface DropItem {
  kind: DropItemKind;
  dataId: number;
  denominator: number;
}
