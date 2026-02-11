import { BaseData } from './BaseData.ts';

export interface DataItemBase  extends BaseData {
  description: string;
  iconIndex: number;
}
