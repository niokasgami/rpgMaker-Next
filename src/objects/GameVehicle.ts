import { GameCharacter } from '@objects/GameCharacter.ts';
import { AudioObject, Vehicle } from '@data';
import { $dataSystem, $gameMap, $gamePlayer, $gameSystem } from '@managers';


export type VehicleType = 'walk' | 'boat' | 'ship' | 'airship' | '' | 0 | 1 | 2;

export class GameVehicle extends GameCharacter {

  protected _type: VehicleType;
  protected _mapId: number;
  protected _altitude: number;
  protected _driving: boolean;
  protected _bgm: AudioObject;

  constructor(type: VehicleType, ...args: any[]) {
    super(...arguments);
  }

  override initialize(type: VehicleType, ...args: any[]) {
    super.initialize(...args);
    this._type = type;
    this.resetDirection();
    this.initMoveSpeed();
    this.loadSystemSettings();
  }

  override initMembers() {
    super.initMembers();
    this._type = '';
    this._mapId = 0;
    this._altitude = 0;
    this._driving = false;
    this._bgm = null;
  }

  isBoat(): boolean {
    return this._type === 'boat';
  }

  isShip(): boolean {
    return this._type === 'ship';
  }

  isAirship(): boolean {
    return this._type === 'airship';
  }

  resetDirection() {
    this.setDirection(4);
  }

  initMoveSpeed() {
    if (this.isBoat()) {
      this.moveSpeed = 4;
    } else if (this.isShip()) {
      this.moveSpeed = 5;
    } else if (this.isAirship()) {
      this.moveSpeed = 6;
    }
  }

  vehicle(): Vehicle {
    if (this.isBoat()) {
      return $dataSystem.boat;
    } else if (this.isShip()) {
      return $dataSystem.ship;
    } else if (this.isAirship()) {
      return $dataSystem.airship;
    } else {
      return null;
    }
  }

  loadSystemSettings() {
    const vehicle = this.vehicle();
    this._mapId = vehicle.startMapId;
    this.setPosition(vehicle.startX, vehicle.startY);
    this.setImage(vehicle.characterName, vehicle.characterIndex);
  }

  refresh() {
    if (this._driving) {
      this._mapId = $gameMap.mapId();
      this.syncWithPlayer();
    } else if (this._mapId === $gameMap.mapId()) {
      this.locate(this.x, this.y);
    }
    if (this.isAirship()) {
      this.setPriorityType(this._driving ? 2 : 0);
    } else {
      this.setPriorityType(1);
    }
    this.setWalkAnime(this._driving);
    this.setStepAnime(this._driving);
    this.setTransparent(this._mapId !== $gameMap.mapId());
  }

  setLocation(mapId: number, x: number, y: number) {
    this._mapId = mapId;
    this.setPosition(x, y);
    this.refresh();
  }

  override pos(x: number, y: number): boolean {
    if (this._mapId === $gameMap.mapId()) {
      return super.pos(x, y);
    } else {
      return false;
    }
  }

  override isMapPassable(x: number, y: number, d: number): boolean {
    const x2 = $gameMap.roundXWithDirection(x, d);
    const y2 = $gameMap.roundYWithDirection(y, d);
    if (this.isBoat()) {
      return $gameMap.isBoatPassable(x2, y2);
    } else if (this.isShip()) {
      return $gameMap.isShipPassable(x2, y2);
    } else return this.isAirship();
  }

  getOn(){
    this._driving = true;
    this.setWalkAnime(true);
    this.setStepAnime(true);
    $gameSystem.saveWalkingBgm();
    this.playBgm();
  }

  getOff(){
    this._driving = false;
    this.setWalkAnime(false);
    this.setStepAnime(false);
    this.resetDirection();
    $gameSystem.replayWalkingBgm();
  }

  setBgm(bgm: AudioObject) {
    this._bgm = bgm;
  }

  playBgm() {
    AudioManager.playBgm(this._bgm || this.vehicle().bgm);
  }

  syncWithPlayer() {
    this.copyPosition($gamePlayer);
    this.refreshBushDepth();
  }

  override screenY(): number {
    return super.screenY() - this._altitude;
  }

  shadowX(): number {
    return this.screenX();
  }

  shadowY(): number {
    return this.screenY() + this._altitude;
  }

  shadowOpacity(): number {
    return (255 * this._altitude) / this.maxAltitude();
  }

  canMove(): boolean {
    if (this.isAirship()) {
      return this.isHighest();
    } else {
      return true;
    }
  }

  override update() {
    super.update();
    if (this.isAirship()) {
      this.updateAirship();
    }
  }

  updateAirship() {
    this.updateAirshipAltitude();
    this.setStepAnime(this.isHighest());
    this.setPriorityType(this.isLowest() ? 0 : 2);
  }

  updateAirshipAltitude() {
    if (this._driving && !this.isHighest()) {
      this._altitude++;
    }
    if (!this._driving && !this.isLowest()) {
      this._altitude--;
    }
  }

  maxAltitude(): number {
    return 48;
  }

  isLowest(): boolean {
    return this._altitude <= 0;
  }

  isHighest(): boolean {
    return this._altitude >= this.maxAltitude();
  }

  isTakeoffOk(): boolean {
    return $gamePlayer.areFollowersGathered();
  }

  isLandOk(x: number,y: number, d: number): boolean {
    if (this.isAirship()) {
      if (!$gameMap.isAirshipLandOk(x, y)) {
        return false;
      }
      if ($gameMap.eventsXy(x, y).length > 0) {
        return false;
      }
    } else {
      const x2 = $gameMap.roundXWithDirection(x, d);
      const y2 = $gameMap.roundYWithDirection(y, d);
      if (!$gameMap.isValid(x2, y2)) {
        return false;
      }
      if (!$gameMap.isPassable(x2, y2, this.reverseDir(d))) {
        return false;
      }
      if (this.isCollidedWithCharacters(x2, y2)) {
        return false;
      }
    }
    return true;
  }

  checkEventTriggerTouch(_x: number, _y: number) {
    /// NOTHING
  }
}
