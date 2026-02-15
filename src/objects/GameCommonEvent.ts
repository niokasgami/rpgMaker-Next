import { DataCommonEvent } from '@data/DataCommonEvent.ts';
import { $dataCommonEvents, $gameSwitches } from '@managers';
import { PageList } from '@data/RPG';


export class GameCommonEvent {

  protected _commonEventId: number;
  protected _interpreter: GameInterpreter;
  constructor(commonEventId: number, ...args: any[]) {
    this.initialize(commonEventId, ...args);
  }

  initialize(commonEventId: number, ...args: any[]) {
    this._commonEventId = commonEventId;
    this.refresh();
  }

  event(): DataCommonEvent {
    return $dataCommonEvents[this._commonEventId];
  }

  list(): PageList[] {
    return this.event().list;
  }

  refresh(){
    if (this.isActive()) {
      if (!this._interpreter) {
        this._interpreter = new GameInterpreter();
      }
    } else {
      this._interpreter = null;
    }
  }

  isActive(): boolean {
    const event = this.event();
    return event.trigger === 2 && $gameSwitches.value(event.switchId);
  }

  update(){
    if (this._interpreter) {
      if (!this._interpreter.isRunning()) {
        this._interpreter.setup(this.list());
      }
      this._interpreter.update();
    }
  }
}
