import { $gameMap, ImageManager } from '@managers';
import { Engine } from '@core';


export enum Direction {
  NONE = 0,
  DOWN = 2,
  LEFT = 4,
  RIGHT = 6,
  UP = 8,
}

export enum PriorityType {
  BELLOW = 0,
  SAME = 1,
  ABOVE = 2,
}

export abstract class GameCharacterBase {

  protected _x: number;
  protected _y: number;
  protected _realX: number;
  protected _realY: number;
  protected _moveSpeed: number;
  protected _moveFrequency: number;
  protected _opacity: number;
  protected _blendMode: number; // TODO : pixijs use union strting
  protected _direction: Direction;
  protected _pattern: number;
  protected _priorityType: PriorityType;
  protected _tileId: number;
  protected _characterName: string;
  protected _characterIndex: number;
  protected _isObjectCharacter: boolean;
  protected _walkAnime: boolean;
  protected _stepAnime: boolean;
  protected _directionFix: boolean;
  protected _through: boolean;
  protected _transparent: boolean;
  protected _bushDepth: number;
  protected _animationId: number;
  protected _balloonId: number;
  protected _animationPlaying: boolean;
  protected _balloonPlaying: boolean;
  protected _animationCount: number;
  protected _stopCount: number;
  protected _jumpCount: number;
  protected _jumpPeak: number;
  protected _movementSuccess: boolean;


  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  constructor(...args: any[]) {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this.initMembers();
  }

  protected initMembers() {
    this._x = 0;
    this._y = 0;
    this._realX = 0;
    this._realY = 0;
    this._moveSpeed = 4;
    this._moveFrequency = 6;
    this._opacity = 255;
    this._blendMode = 0;
    this._direction = 2;
    this._pattern = 1;
    this._priorityType = PriorityType.SAME;
    this._tileId = 0;
    this._characterName = '';
    this._characterIndex = 0;
    this._isObjectCharacter = false;
    this._walkAnime = true;
    this._stepAnime = false;
    this._directionFix = false;
    this._through = false;
    this._transparent = false;
    this._bushDepth = 0;
    this._animationId = 0;
    this._balloonId = 0;
    this._animationPlaying = false;
    this._balloonPlaying = false;
    this._animationCount = 0;
    this._stopCount = 0;
    this._jumpCount = 0;
    this._jumpPeak = 0;
    this._movementSuccess = true;
  }

  pos(x: number, y: number): boolean {
    return this._x === x && this._y === y;
  }

  posNt(x: number, y: number): boolean {
    // No through
    return this.pos(x, y) && !this.isThrough();
  }

  get moveSpeed(): number {
    return this._moveSpeed;
  }

  set moveSpeed(value: number) {
    this._moveSpeed = value;
  }

  get moveFrequency(): number {
    return this._moveFrequency;
  }

  set moveFrequency(value: number) {
    this._moveFrequency = value;
  }

  get opacity() {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }

  get blendMode(): number {
    return this._blendMode;
  }

  set blendMode(value: number) {
    this._blendMode = value;
  }


  isNormalPriority(): boolean {
    return this._priorityType === PriorityType.SAME;
  }

  setPriorityType(value: PriorityType) {
    this._priorityType = value;
  }

  isMoving(): boolean {
    return this._realX !== this._x || this._realY !== this._y;
  }

  isJumping(): boolean {
    return this._jumpCount > 0;
  }

  jumpHeight(): number {
    return (
      (this._jumpPeak * this._jumpPeak -
        Math.pow(Math.abs(this._jumpCount - this._jumpPeak), 2)) /
      2
    );
  }

  isStopping(): boolean {
    return !this.isMoving() && !this.isJumping();
  }

  checkStop(threshold: number): boolean {
    return this._stopCount > threshold;
  }

  resetStopCount() {
    this._stopCount = 0;
  }

  realMoveSpeed(): number {
    return this._moveSpeed + (this.isDashing() ? 1 : 0);
  }

  distancePerFrame(): number {
    return Math.pow(2, this.realMoveSpeed()) / 256;
  }

  isDashing(): boolean {
    return false;
  }

  isDebugThrough(): boolean {
    return false;
  }

  straighten() {
    if (this.hasWalkAnime() || this.hasStepAnime()) {
      this._pattern = 1;
    }
    this._animationCount = 0;
  }

  reverseDir(d: number): number {
    return 10 - d;
  }

  canPass(x: number, y: number, d: number): boolean {
    const x2 = $gameMap.roundXWithDirection(x, d);
    const y2 = $gameMap.roundYWithDirection(y, d);
    if (!$gameMap.isValid(x2, y2)) {
      return false;
    }
    if (this.isThrough() || this.isDebugThrough()) {
      return true;
    }
    if (!this.isMapPassable(x, y, d)) {
      return false;
    }
    if (this.isCollidedWithCharacters(x2, y2)) {
      return false;
    }
    return true;
  }

  canPassDiagonally(x: number, y: number, horz: number, vert: number): boolean {
    const x2 = $gameMap.roundXWithDirection(x, horz);
    const y2 = $gameMap.roundYWithDirection(y, vert);
    if (this.canPass(x, y, vert) && this.canPass(x, y2, horz)) {
      return true;
    }
    if (this.canPass(x, y, horz) && this.canPass(x2, y, vert)) {
      return true;
    }
    return false;
  }

  isMapPassable(x: number, y: number, d: number): boolean {
    const x2 = $gameMap.roundXWithDirection(x, d);
    const y2 = $gameMap.roundYWithDirection(y, d);
    const d2 = this.reverseDir(d);
    return $gameMap.isPassable(x, y, d) && $gameMap.isPassable(x2, y2, d2);
  }

  isCollidedWithCharacters(x: number, y: number): boolean {
    return this.isCollidedWithEvents(x, y) || this.isCollidedWithVehicles(x, y);
  }

  isCollidedWithEvents(x: number, y: number): boolean {
    const events = $gameMap.eventsXyNt(x, y);
    return events.some(event => event.isNormalPriority());
  }

  isCollidedWithVehicles(x: number, y: number): boolean {
    return $gameMap.boat().posNt(x, y) || $gameMap.ship().posNt(x, y);
  }

  setPosition(x: number, y: number) {
    this._x = Math.round(x);
    this._y = Math.round(y);
    this._realX = x;
    this._realY = y;
  }

  copyPosition(character: GameCharacterBase) {
    this._x = character._x;
    this._y = character._y;
    this._realX = character._realX;
    this._realY = character._realY;
    this._direction = character._direction;
  }

  locate(x: number, y: number) {
    this.setPosition(x, y);
    this.straighten();
    this.refreshBushDepth();
  }

  get direction(): Direction {
    return this._direction;
  }

  setDirection(d: Direction) {
    if (!this.isDirectionFixed() && d) {
      this._direction = d;
    }
    this.resetStopCount();
  }

  isTile(): boolean {
    return this._tileId > 0 && this._priorityType === PriorityType.BELLOW;
  }

  isObjectCharacter(): boolean {
    return this._isObjectCharacter;
  }

  shiftY(): number {
    return this.isObjectCharacter() ? 0 : 6;
  }

  scrolledX(): number {
    return $gameMap.adjustX(this._realX);
  }

  scrolledY(): number {
    return $gameMap.adjustY(this._realY);
  }

  screenX(): number {
    const tw = $gameMap.tileWidth();
    return Math.floor(this.scrolledX() * tw + tw / 2);
  }

  screenY() {
    const th = $gameMap.tileHeight();
    return Math.floor(
      this.scrolledY() * th + th - this.shiftY() - this.jumpHeight()
    );
  }

  screenZ(): number {
    return this._priorityType * 2 + 1;
  }

  isNearTheScreen(): boolean {
    const gw = Engine.width;
    const gh = Engine.height;
    const tw = $gameMap.tileWidth();
    const th = $gameMap.tileHeight();
    const px = this.scrolledX() * tw + tw / 2 - gw / 2;
    const py = this.scrolledY() * th + th / 2 - gh / 2;
    return px >= -gw && px <= gw && py >= -gh && py <= gh;
  }

  update(sceneActive?: boolean) {
    if (this.isStopping()) {
      this.updateStop();
    }
    if (this.isJumping()) {
      this.updateJump();
    } else if (this.isMoving()) {
      this.updateMove();
    }
    this.updateAnimation();
  }

  updateStop() {
    this._stopCount++;
  }

  updateJump() {
    this._jumpCount--;
    this._realX =
      (this._realX * this._jumpCount + this._x) / (this._jumpCount + 1.0);
    this._realY =
      (this._realY * this._jumpCount + this._y) / (this._jumpCount + 1.0);
    this.refreshBushDepth();
    if (this._jumpCount === 0) {
      this._realX = this._x = $gameMap.roundX(this._x);
      this._realY = this._y = $gameMap.roundY(this._y);
    }
  }

  updateMove() {
    if (this._x < this._realX) {
      this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
    }
    if (this._x > this._realX) {
      this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
    }
    if (this._y < this._realY) {
      this._realY = Math.max(this._realY - this.distancePerFrame(), this._y);
    }
    if (this._y > this._realY) {
      this._realY = Math.min(this._realY + this.distancePerFrame(), this._y);
    }
    if (!this.isMoving()) {
      this.refreshBushDepth();
    }
  }

  updateAnimation() {
    this.updateAnimationCount();
    if (this._animationCount >= this.animationWait()) {
      this.updatePattern();
      this._animationCount = 0;
    }
  }

  animationWait(): number {
    return (9 - this.realMoveSpeed()) * 3;
  }

  updateAnimationCount() {
    if (this.isMoving() && this.hasWalkAnime()) {
      this._animationCount += 1.5;
    } else if (this.hasStepAnime() || !this.isOriginalPattern()) {
      this._animationCount++;
    }
  }

  updatePattern() {
    if (!this.hasStepAnime() && this._stopCount > 0) {
      this.resetPattern();
    } else {
      this._pattern = (this._pattern + 1) % this.maxPattern();
    }
  }

  maxPattern(): number {
    return 4;
  }

  get pattern(): number {
    return this._pattern < 3 ? this._pattern : 1;
  }

  set pattern(pattern: number) {
    this._pattern = pattern;
  }

  isOriginalPattern(): boolean {
    return this.pattern === 0;
  }

  resetPattern() {
    this.pattern = 0;
  }

  refreshBushDepth() {
    if (
      this.isNormalPriority() &&
      !this.isObjectCharacter() &&
      this.isOnBush() &&
      !this.isJumping()
    ) {
      if (!this.isMoving()) {
        this._bushDepth = $gameMap.bushDepth();
      }
    } else {
      this._bushDepth = 0;
    }
  }

  isOnLadder(): boolean {
    return $gameMap.isLadder(this._x, this._y);
  }

  isOnBush(): boolean {
    return $gameMap.isBush(this._x, this._y);
  }

  terrainTag(): number {
    return $gameMap.terrainTag(this._x, this._y);
  }

  regionId(): number {
    return $gameMap.regionId(this._x, this._y);
  }

  increaseSteps() {
    if (this.isOnLadder()) {
      this.setDirection(Direction.UP);
    }
    this.resetStopCount();
    this.refreshBushDepth();
  }

  get tileId(): number {
    return this._tileId;
  }

  get characterName(): string {
    return this._characterName;
  }

  get characterIndex(): number {
    return this._characterIndex;
  }

  setImage(characterName: string, characterIndex: number) {
    this._tileId = 0;
    this._characterName = characterName;
    this._characterIndex = characterIndex;
    this._isObjectCharacter = ImageManager.isObjectCharacter(characterName);
  }

  setTileImage(tileId: number) {
    this._tileId = tileId;
    this._characterName = '';
    this._characterIndex = 0;
    this._isObjectCharacter = true;
  }

  checkEventTriggerTouchFront(d: Direction) {
    const x2 = $gameMap.roundXWithDirection(this._x, d);
    const y2 = $gameMap.roundYWithDirection(this._y, d);
    this.checkEventTriggerTouch(x2, y2);
  }

  abstract checkEventTriggerTouch(_x: number, _y: number): void;

  isMovementSucceeded(): boolean {
    return this._movementSuccess;
  }

  setMovementSuccess(success: boolean) {
    this._movementSuccess = success;
  }

  moveStraight(d: Direction) {
    this.setMovementSuccess(this.canPass(this._x, this._y, d));
    if (this.isMovementSucceeded()) {
      this.setDirection(d);
      this._x = $gameMap.roundXWithDirection(this._x, d);
      this._y = $gameMap.roundYWithDirection(this._y, d);
      this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
      this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
      this.increaseSteps();
    } else {
      this.setDirection(d);
      this.checkEventTriggerTouchFront(d);
    }
  }

  moveDiagonally(horz: number, vert: number) {
    this.setMovementSuccess(
      this.canPassDiagonally(this._x, this._y, horz, vert)
    );
    if (this.isMovementSucceeded()) {
      this._x = $gameMap.roundXWithDirection(this._x, horz);
      this._y = $gameMap.roundYWithDirection(this._y, vert);
      this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(horz));
      this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(vert));
      this.increaseSteps();
    }
    if (this._direction === this.reverseDir(horz)) {
      this.setDirection(horz);
    }
    if (this._direction === this.reverseDir(vert)) {
      this.setDirection(vert);
    }
  }

  jump(xPlus: number, yPlus: number) {
    if (Math.abs(xPlus) > Math.abs(yPlus)) {
      if (xPlus !== 0) {
        this.setDirection(xPlus < 0 ? 4 : 6);
      }
    } else {
      if (yPlus !== 0) {
        this.setDirection(yPlus < 0 ? 8 : 2);
      }
    }
    this._x += xPlus;
    this._y += yPlus;
    const distance = Math.round(Math.sqrt(xPlus * xPlus + yPlus * yPlus));
    this._jumpPeak = 10 + distance - this._moveSpeed;
    this._jumpCount = this._jumpPeak * 2;
    this.resetStopCount();
    this.straighten();
  }

  hasWalkAnime(): boolean {
    return this._walkAnime;
  }

  setWalkAnime(walkAnime: boolean) {
    this._walkAnime = walkAnime;
  }

  hasStepAnime(): boolean {
    return this._stepAnime;
  }

  setStepAnime(stepAnime: boolean) {
    this._stepAnime = stepAnime;
  }

  isDirectionFixed(): boolean {
    return this._directionFix;
  }

  setDirectionFix(directionFix: boolean) {
    this._directionFix = directionFix;
  }

  isThrough(): boolean {
    return this._through;
  }

  setThrough(through: boolean) {
    this._through = through;
  }

  isTransparent(): boolean {
    return this._transparent;
  }

  bushDepth(): number {
    return this._bushDepth;
  }

  setTransparent(transparent: boolean) {
    this._transparent = transparent;
  }

  startAnimation() {
    this._balloonPlaying = true;
  }

  isAnimationPlaying() {
    return this._animationPlaying;
  }

  isBallonPlaying(): boolean {
    return this._balloonPlaying;
  }

  endAnimation() {
    this._balloonPlaying = false;
  }

  endBallon() {
    this._balloonPlaying = false;
  }
}
