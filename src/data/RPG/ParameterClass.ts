import { ParameterList } from './ParameterList.ts';

export interface ParameterClass {
    name?: string;
    volume?: number;
    pitch?: number;
    pan?: number;
    list?: ParameterList[];
    repeat?: boolean;
    skippable?: boolean;
    wait?: boolean;
    code?: number;
    parameters?: Array<number | string>;
    indent?: null;
  }
