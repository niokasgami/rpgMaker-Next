import { ActionConditionType } from '@data/RPG/action-condition-type.ts';

export interface ActionData {
  conditionParam1: number;
  conditionParam2: number;
  conditionType: ActionConditionType;
  rating: number;
  skillId: number;
}
