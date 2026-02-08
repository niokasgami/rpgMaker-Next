import { BaseData } from './BaseData.ts';

export interface DataItemBase  extends BaseData {
  description: string;
  price: number;
  iconIndex: number;
}
