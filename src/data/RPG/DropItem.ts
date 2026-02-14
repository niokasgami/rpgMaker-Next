

export enum DropItemKind {
  NONE = 0,
  ITEM = 1,
  WEAPON = 2,
  ARMOR = 3
}
  export interface DropItem {
    kind: DropItemKind;
    dataId: number;
    denominator: number;
  }
