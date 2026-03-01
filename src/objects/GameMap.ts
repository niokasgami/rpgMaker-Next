import { GameCommonEvent } from '@objects/GameCommonEvent.ts';


export class GameMap {


  protected _interpreter: GameInterpreter;
  protected _mapId: number;
  protected _tilesetId: number;
  protected _events: GameEvent[];
  protected _commonEvents: GameCommonEvent[];
  protected _vehicules: GameVehicule;
  protected _displayX: number;
  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args) {
    this._interpreter = new Game_Interpreter();
    this._mapId = 0;
    this._tilesetId = 0;
    this._events = [];
    this._commonEvents = [];
    this._vehicles = [];
    this._displayX = 0;
    this._displayY = 0;
    this._nameDisplay = true;
    this._scrollDirection = 2;
    this._scrollRest = 0;
    this._scrollSpeed = 4;
    this._parallaxName = "";
    this._parallaxZero = false;
    this._parallaxLoopX = false;
    this._parallaxLoopY = false;
    this._parallaxSx = 0;
    this._parallaxSy = 0;
    this._parallaxX = 0;
    this._parallaxY = 0;
    this._battleback1Name = null;
    this._battleback2Name = null;
    this.createVehicles();
  }
}
