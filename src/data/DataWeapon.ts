import { DataEquipable } from '@data/DataEquipable.ts';

export interface DataWeapon extends DataEquipable {
  wtypeId: number;
  animationId: number;
}
