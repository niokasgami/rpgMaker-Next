import { HitType } from '@data/RPG/hit-type.ts';

export interface ItemDamage {
  critical: boolean;
  elementId: number;
  formula: string;
  type: HitType;
  variance: number;
}
