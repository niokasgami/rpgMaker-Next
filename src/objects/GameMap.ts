import { GameCommonEvent } from '@objects/GameCommonEvent.ts';
import { GameInterpreter } from '@objects/GameInterpreter.ts';
import { GameEvent } from '@objects/GameEvent.ts';
import { GameVehicle, VehicleType } from '@objects/GameVehicle.ts';
import { $dataCommonEvents, $dataMap, $dataSystem, $dataTilesets, ImageManager } from '@managers';
import { CommonEventTrigger, DataTileset, Encounter, TilesetType } from '@data';
import { Engine } from '@core';


export class GameMap {


  private _interpreter: GameInterpreter;
  private _mapId: number;
  private _tilesetId: number;
  private _events: GameEvent[];
  private _commonEvents: GameCommonEvent[];
  private _vehicles: GameVehicle[];
  private _displayX : number;
  private _displayY : number;
  private _nameDisplay: boolean;
  private _scrollDirection: number;
  private _scrollRest: number;
  private _scrollSpeed: number;
  private _parallaxName: string;
  private _parallaxZero: boolean;
  private _parallaxLoopX: boolean;
  private _parallaxLoopY: boolean;
  private _parallaxSx: number;
  private _parallaxSy: number;
  private _parallaxX: number;
  private _parallaxY: number;
  private _battleback1Name: string;
  private _battleback2Name: string;

  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this._interpreter = new GameInterpreter();
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

  setup(mapId: number) {
    if (!$dataMap) {
      throw new Error("The map data is not available");
    }
    this._mapId = mapId;
    this._tilesetId = $dataMap.tilesetId;
    this._displayX = 0;
    this._displayY = 0;
    this.refereshVehicles();
    this.setupEvents();
    this.setupScroll();
    this.setupParallax();
    this.setupBattleback();
    this._needsRefresh = false;
  }

  isEventRunning(): boolean {
    return this._interpreter.isRunning() || this.isAnyEventStarting();
  }

  get tileWidth(): number {
    if ("tileSize" in $dataSystem) {
      return $dataSystem.tileSize;
    } else {
      return 48;
    }
  }

  get tileHeight(): number {
    if ("tileSize" in $dataSystem) {
      return $dataSystem.tileSize;
    } else {
      return 48;
    }
  }

  get bushDepth(): number {
    return this.tileHeight / 4;
  }

  get mapId(): number {
    return this._mapId;
  }

  get tilesetId(): number {
    return this._tilesetId;
  }

  get displayX(): number {
    return this._displayX;
  }

  get displayY(): number {
    return this._displayY;
  }

  get parallaxName(): string {
    return this._parallaxName;
  }

  get battleback1Name(): string {
    return this._battleback1Name;
  }

  get battleback2Name(): string {
    return this._battleback2Name;
  }

  requestFresh() {
    this._needsRefresh = true;
  }

  isNameDisplayEnabled(): boolean {
    return this._nameDisplay;
  }

  disableNameDisplay(){
    this._nameDisplay = false;
  }

  enableNameDisplay(){
    this._nameDisplay = true;
  }

  createVehicles() {
    this._vehicles = [];
    this._vehicles[0] = new GameVehicle("boat");
    this._vehicles[1] = new GameVehicle("ship");
    this._vehicles[2] = new GameVehicle("airship");
  }

  refreshVehicles() {
    for (const vehicle of this._vehicles) {
      vehicle.refresh();
    }
  }

  get vehicles(): GameVehicle[] {
    return this._vehicles;
  }

  vehicle(type: VehicleType): GameVehicle {
    if (type === 0 || type === "boat") {
      return this.boat();
    } else if (type === 1 || type === "ship") {
      return this.ship();
    } else if (type === 2 || type === "airship") {
      return this.airship();
    } else {
      return null;
    }
  }

  get boat(): GameVehicle {
    return this._vehicles[0];
  }

  get ship(): GameVehicle {
    return this._vehicles[1];
  }

  get airship(): GameVehicle {
    return this._vehicles[2];
  }

  setupEvents(){
    this._events = [];
    this._commonEvents = [];
    for (const event of $dataMap.events.filter(event => !!event)) {
      this._events[event.id] = new GameEvent(this._mapId, event.id);
    }
    for (const commonEvent of this.parallelCommonEvents()) {
      this._commonEvents.push(new GameCommonEvent(commonEvent.id));
    }
    this.refreshTileEvents();
  }

  events(): GameEvent[] {
    return this._events.filter(event => !!event);
  }

  event(eventId: number): GameEvent {
    return this._events[eventId];
  }

  eraseEvent(eventId: number) {
    this._events[eventId].erase();
  }

  autorunCommonEvents() {
    return $dataCommonEvents.filter(
      commonEvent => commonEvent && commonEvent.trigger === CommonEventTrigger.AUTORUN
    );
  }

  parallelCommonEvents() {
    return $dataCommonEvents.filter(
      commonEvent => commonEvent && commonEvent.trigger === CommonEventTrigger.PARALLEL
    );
  }

  setupScroll(){
    this._scrollDirection = 2;
    this._scrollRest = 0;
    this._scrollSpeed = 4;
  }

  setupParallax(){
    this._parallaxName = $dataMap.parallaxName || "";
    this._parallaxZero = ImageManager.isZeroParallax(this._parallaxName);
    this._parallaxLoopX = $dataMap.parallaxLoopX;
    this._parallaxLoopY = $dataMap.parallaxLoopY;
    this._parallaxSx = $dataMap.parallaxSx;
    this._parallaxSy = $dataMap.parallaxSy;
    this._parallaxX = 0;
    this._parallaxY = 0;
  }

  setupBattleback(){
    if ($dataMap.specifyBattleback) {
      this._battleback1Name = $dataMap.battleback1Name;
      this._battleback2Name = $dataMap.battleback2Name;
    } else {
      this._battleback1Name = null;
      this._battleback2Name = null;
    }
  }

  setDisplayPos(x: number, y: number) {
    if (this.isLoopHorizontal()) {
      this._displayX = x.mod(this.width());
      this._parallaxX = x;
    } else {
      const endX = this.width() - this.screenTileX();
      this._displayX = endX < 0 ? endX / 2 : x.clamp(0, endX);
      this._parallaxX = this._displayX;
    }
    if (this.isLoopVertical()) {
      this._displayY = y.mod(this.height());
      this._parallaxY = y;
    } else {
      const endY = this.height() - this.screenTileY();
      this._displayY = endY < 0 ? endY / 2 : y.clamp(0, endY);
      this._parallaxY = this._displayY;
    }
  }

  get parallaxOx(): number {
    if (this._parallaxZero) {
      return this._parallaxX * this.tileWidth;
    } else if (this._parallaxLoopX) {
      return (this._parallaxX * this.tileWidth) / 2;
    } else {
      return 0;
    }
  }

  get parallaxOy(): number {
    if (this._parallaxZero) {
      return this._parallaxY * this.tileHeight;
    } else if (this._parallaxLoopY) {
      return (this._parallaxY * this.tileHeight) / 2;
    } else {
      return 0;
    }
  }

  get tileset(): DataTileset {
    return $dataTilesets[this._tilesetId];
  }

  get tilesetFlags(): number[] {
    if(this.tileset){
      return this.tileset.flags;
    } else {
      return [] as number[];
    }
  }

  get displayName(): string {
    return $dataMap.displayName;
  }

  get width(): number {
    return $dataMap.width;
  }

  get height(): number {
    return $dataMap.height;
  }

  get data(): number[] {
    return $dataMap.data;
  }

  // TODO : map out scrollType
  isLoopHorizontal(): boolean {
    return $dataMap.scrollType === 2 || $dataMap.scrollType === 3;
  }

  isLoopVertical(): boolean {
    return $dataMap.scrollType === 1 || $dataMap.scrollType === 3;
  }

  isDashDisabled(): boolean {
    return $dataMap.disableDashing;
  }

  get encounterList(): Encounter[] {
    return $dataMap.encounterList;
  }

  get encounterStep(): number {
    return $dataMap.encounterStep;
  }

  isOverworld(): boolean {
    return this.tileset && this.tileset.mode === TilesetType.OVERWORLD;
  }

  screenTileX(): number {
    return Math.round((Engine.width / this.tileWidth) * 16) / 16;
  }

  screenTileY(): number {
    return Math.round((Engine.height / this.tileHeight) * 16) / 16;
  }

  adjustX(x: number): number {
    if (
      this.isLoopHorizontal() &&
      x < this._displayX - (this.width - this.screenTileX()) / 2
    ) {
      return x - this._displayX + $dataMap.width;
    } else {
      return x - this._displayX;
    }
  }

  adjustY(y: number): number {
    if (
      this.isLoopVertical() &&
      y < this._displayY - (this.height - this.screenTileY()) / 2
    ) {
      return y - this._displayY + $dataMap.height;
    } else {
      return y - this._displayY;
    }
  }

  roundX(x: number): number {
    return this.isLoopHorizontal() ? x.mod(this.width) : x;
  }

  roundY(y: number): number {
    return this.isLoopVertical() ? y.mod(this.height) : y;
  }
}
