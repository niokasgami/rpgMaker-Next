import { $gameMap } from '@managers';


export class GameSelfSwitches {

  protected _data: Record<string, boolean>;
  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this.clear();
  }

  clear() {
    this._data = {};
  }

  value(key: string): boolean {
    return !!this._data[key];
  }

  setValue(key: string, value: boolean) {
    if (value) {
      this._data[key] = true;
    } else {
      delete this._data[key];
    }
    this.onChange();
  }

  onChange() {
    $gameMap.requestRefresh();
  }
}
