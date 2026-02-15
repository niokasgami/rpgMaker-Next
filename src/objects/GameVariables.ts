import { $dataSystem, $gameMap } from '@managers';


export class GameVariables {

  protected _data: (string | number)[];
  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this.clear();
  }

  clear(){
    this._data = [];
  }
  
  value(variableId: number) : string | number {
    return this._data[variableId] || 0;
  }

  setValue(variableId: number, value: string | number) {
    if (variableId > 0 && variableId < $dataSystem.variables.length) {
      if (typeof value === "number") {
        value = Math.floor(value);
      }
      this._data[variableId] = value;
      this.onChange();
    }
  }

  onChange(){
    $gameMap.requestRefresh();
  }
}
