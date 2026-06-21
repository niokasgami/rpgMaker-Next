import { GameCharacter } from '@objects/GameCharacter.ts';
import { EventTrigger, MoveRoute, MoveType, Page, PageList, RpgEvent } from '@data';
import { Direction } from '@objects/GameCharacterBase.ts';
import {
  $dataItems,
  $dataMap,
  $gameActors,
  $gameMap,
  $gameParty,
  $gamePlayer,
  $gameSelfSwitches,
  $gameSwitches,
  $gameVariables
} from '@managers';
import { GameInterpreter } from '@objects/GameInterpreter.ts';


export class GameEvent extends GameCharacter {


  protected _mapId: number;
  protected _eventId: number;
  protected _moveType: MoveType;
  protected _trigger: EventTrigger;
  protected _starting: boolean;
  protected _erased: boolean;
  protected _pageIndex: number;
  protected _originalPattern: number;
  protected _originalDirection: Direction;
  protected _prelockDirection: Direction;
  protected _locked: boolean;
  protected _interpreter: GameInterpreter;

  constructor(mapId: number, eventId: number) {
    super(...arguments);
  }

  override initialize(mapId: number, eventId: number, ...arg: any[]) {
    super.initialize(...arg);
    this._mapId = mapId;
    this._eventId = eventId;
    this.locate(this.event.x, this.event.y);
    this.refresh();
  }

  override initMembers() {
    super.initMembers();
    this._moveType = MoveType.Fix;
    this._trigger = 0;
    this._starting = false;
    this._erased = false;
    this._pageIndex = -2;
    this._originalPattern = 1;
    this._originalDirection = Direction.DOWN;
    this._prelockDirection = Direction.NONE;
    this._locked = false;
  }

  get eventId(): number {
    return this._eventId;
  }

  get event(): RpgEvent {
    return $dataMap.events[this._eventId];
  }

  get page(): Page {
    return this.event.pages[this._pageIndex];
  }

  get list(): PageList[] {
    return this.page.list;
  }

  override isCollidedWithCharacters(x: number, y: number): boolean {
    return (
      super.isCollidedWithCharacters(x, y) ||
      this.isCollidedWithPlayerCharacters(x, y)
    );
  }

  override isCollidedWithEvents(x: number, y: number): boolean {
    const events = $gameMap.eventsXyNt(x, y);
    return events.length > 0;
  }

  isCollidedWithPlayerCharacters(x: number, y: number): boolean {
    return this.isNormalPriority() && $gamePlayer.isCollided(x, y);
  }

  lock() {
    if (this._locked) return;
    this._prelockDirection = this.direction;
    this.turnTowardPlayer();
    this._locked = true;
  }

  unlock() {
    if (!this._locked) return;
    this._locked = false;
    this.setDirection(this._prelockDirection);
  }

  override updateStop() {
    if (this._locked) this.resetStopCount();
    super.updateStop();
    if (!this.isMoveRouteForcing()) this.updateSelfMovement();
  }

  updateSelfMovement() {
    if (!this._locked
      && this.isNearTheScreen()
      && this.checkStop(this.stopCountThreshold())
    ) {
      switch (this._moveType) {
        case MoveType.RANDOM :
          this.moveTypeRandom();
          break;
        case MoveType.APPROACH :
          this.moveTypeTowardPlayer();
          break;
        case MoveType.CUSTOM:
          this.moveTypeCustom();
          break;
      }
    }
  }

  stopCountThreshold(): number {
    return 30 * (5 - this.moveFrequency);
  }

  moveTypeRandom() {
    switch (Math.randomInt(6)) {
      case 0:
      case 1:
        this.moveRandom();
        break;
      case 2:
      case 3:
      case 4:
        this.moveForward();
        break;
      case 5:
        this.resetStopCount();
        break;
    }
  }

  moveTypeTowardPlayer() {
    if (this.isNearThePlayer()) {
      switch (Math.randomInt(6)) {
        case 0:
        case 1:
        case 2:
        case 3:
          this.moveTowardPlayer();
          break;
        case 4:
          this.moveRandom();
          break;
        case 5:
          this.moveForward();
          break;
      }
    } else {
      this.moveRandom();
    }
  }

  isNearThePlayer(): boolean {
    const sx = Math.abs(this.deltaXFrom($gamePlayer.x));
    const sy = Math.abs(this.deltaYFrom($gamePlayer.y));
    return sx + sy < 20;
  }

  moveTypeCustom() {
    this.updateRoutineMove();
  }

  isStarting(): boolean {
    return this._starting;
  }


  clearStartingFlag() {
    this._starting = false;
  }

  isTriggerIn(triggers: EventTrigger[]) {
    return triggers.includes(this._trigger);
  }

  start() {
    const list = this.list;
    if (list && list.length > 1) {
      this._starting = true;
      if (this.isTriggerIn([0, 1, 2])) {
        this.lock();
      }
    }
  }

  erase() {
    this._erased = true;
    this.refresh();
  }

  refresh() {
    const newPageIndex = this._erased ? -1 : this.findProperPageIndex();
    if (this._pageIndex !== newPageIndex) {
      this._pageIndex = newPageIndex;
      this.setupPage();
    }
  }

  findProperPageIndex(): number {
    const pages = this.event.pages;
    for (let i = pages.length - 1; i >= 0; i--) {
      const page = pages[i];
      if (this.meetsConditions(page)) {
        return i;
      }
    }
    return -1;
  }

  meetsConditions(page: Page): boolean {
    const c = page.conditions;
    if (c.switch1Valid) {
      if (!$gameSwitches.value(c.switch1Id)) {
        return false;
      }
    }
    if (c.switch2Valid) {
      if (!$gameSwitches.value(c.switch2Id)) {
        return false;
      }
    }
    if (c.variableValid) {
      if (($gameVariables.value(c.variableId) as number) < c.variableValue) {
        return false;
      }
    }
    if (c.selfSwitchValid) {
      const key = [this._mapId, this._eventId, c.selfSwitchCh];
      // @ts-ignore
      if ($gameSelfSwitches.value(key) !== true) {
        return false;
      }
    }
    if (c.itemValid) {
      const item = $dataItems[c.itemId];
      if (!$gameParty.hasItem(item)) {
        return false;
      }
    }
    if (c.actorValid) {
      const actor = $gameActors.actor(c.actorId);
      if (!$gameParty.members().includes(actor)) {
        return false;
      }
    }
    return true;
  }

  setupPage() {
    if (this._pageIndex >= 0) {
      this.setupPageSettings();
    } else {
      this.clearPageSettings();
    }
    this.refreshBushDepth();
    this.clearStartingFlag();
    this.checkEventTriggerAuto();
  }

  clearPageSettings() {
    this.setImage('', 0);
    this._moveType = 0;
    this._trigger = null;
    this._interpreter = null;
    this.setThrough(true);
  }

  setupPageSettings() {
    const page = this.page;
    const image = page.image;
    if (image.tileId > 0) {
      this.setTileImage(image.tileId);
    } else {
      this.setImage(image.characterName, image.characterIndex);
    }
    if (this._originalDirection !== image.direction) {
      this._originalDirection = image.direction;
      this._prelockDirection = 0;
      this.setDirectionFix(false);
      this.setDirection(image.direction);
    }
    if (this._originalPattern !== image.pattern) {
      this._originalPattern = image.pattern;
      this.pattern = image.pattern;
    }
    this.moveSpeed = page.moveSpeed;
    this.moveFrequency = page.moveFrequency;
    this.setPriorityType(page.priorityType);
    this.setWalkAnime(page.walkAnime);
    this.setStepAnime(page.stepAnime);
    this.setDirectionFix(page.directionFix);
    this.setThrough(page.through);
    this.setMoveRoute(page.moveRoute);
    this._moveType = page.moveType;
    this._trigger = page.trigger;
    if (this._trigger === 4) {
      this._interpreter = new GameInterpreter();
    } else {
      this._interpreter = null;
    }
  }

  override isOriginalPattern(): boolean {
    return this.pattern === this._originalPattern;
  }

  override resetPattern() {
    this.pattern = this._originalPattern;
  }

  override checkEventTriggerTouch(x: number, y: number) {
    if ($gameMap.isEventRunning()) return;
    if (this._trigger !== 2) return;
    if (!$gamePlayer.pos(x, y)) return;
    if (this.isJumping()) return;
    if (!this.isNormalPriority()) return;
    this.start();
  }

  checkEventTriggerAuto() {
    if (this._trigger === EventTrigger.AUTORUN) {
      this.start();
    }
  }

  override update() {
    super.update();
    this.checkEventTriggerAuto();
    this.updateParallel();
  }

  updateParallel() {
    if (!this._interpreter) return;
    if (!this._interpreter.isRunning()) {
      this._interpreter.setup(this.list(), this._eventId);
    }
    this._interpreter.update();
  }

  override locate(x: number, y: number) {
    super.locate(x, y);
    this._prelockDirection = Direction.NONE;
  }

  override forceMoveRoute(moveRoute: MoveRoute) {
    super.forceMoveRoute(moveRoute);
    this._prelockDirection = Direction.NONE;
  }
}
