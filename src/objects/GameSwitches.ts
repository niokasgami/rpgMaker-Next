import { $dataSystem, $gameMap } from '@managers';


export class GameSwitches {

  protected _data: boolean[];

  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this.clear();
  }

  clear() {
    this._data = [];
  }

  value(switchId: number): boolean {
    return !!this._data[switchId];
  }

  setValue(switchId: number, value: boolean) {
    if (switchId > 0 && switchId < $dataSystem.switches.length) {
      this._data[switchId] = value;
      this.onChange();
    }
  }

  onChange() {
    $gameMap.requestRefresh();
  }
}
