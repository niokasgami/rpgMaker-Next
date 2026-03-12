import { Direction, GameCharacterBase } from '@objects/GameCharacterBase.ts';
import { MoveRoute, PageList } from '@data';
import { $gameMap, $gamePlayer, $gameSwitches } from '@managers';


export enum Route {
  END = 0,
  MOVE_DOWN = 1,
  MOVE_LEFT = 2,
  MOVE_RIGHT = 3,
  MOVE_UP = 4,
  MOVE_LOWER_L = 5,
  MOVE_LOWER_R = 6,
  MOVE_UPPER_L = 7,
  MOVE_UPPER_R = 8,
  MOVE_RANDOM = 9,
  MOVE_TOWARD = 10,
  MOVE_AWAY = 11,
  MOVE_FORWARD = 12,
  MOVE_BACKWARD = 13,
  JUMP = 14,
  WAIT = 15,
  TURN_DOWN = 16,
  TURN_LEFT = 17,
  TURN_RIGHT = 18,
  TURN_UP = 19,
  TURN_90D_R = 20,
  TURN_90D_L = 21,
  TURN_180D = 22,
  TURN_90D_R_L = 23,
  TURN_RANDOM = 24,
  TURN_TOWARD = 25,
  TURN_AWAY = 26,
  SWITCH_ON = 27,
  SWITCH_OFF = 28,
  CHANGE_SPEED = 29,
  CHANGE_FREQ = 30,
  WALK_ANIME_ON = 31,
  WALK_ANIME_OFF = 32,
  STEP_ANIME_ON = 33,
  STEP_ANIME_OFF = 34,
  DIR_FIX_ON = 35,
  DIR_FIX_OFF = 36,
  THROUGH_ON = 37,
  THROUGH_OFF = 38,
  TRANSPARENT_ON = 39,
  TRANSPARENT_OFF = 40,
  CHANGE_IMAGE = 41,
  CHANGE_OPACITY = 42,
  CHANGE_BLEND_MODE = 43,
  PLAY_SE = 44,
  SCRIPT = 45,
}

interface StartRoute {
  parent: StartRoute;
  x: number;
  y: number;
  g: number;
  f: number;
}

/**
 * The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.
 */
export abstract class GameCharacter extends GameCharacterBase {




  protected _moveRouteForcing: boolean;
  protected _moveRoute: MoveRoute;
  protected _moveRouteIndex: number;
  protected _originalMoveRoute: MoveRoute;
  protected _originalMoveRouteIndex: number;
  protected _waitCount: number;



  override initMembers() {
    super.initMembers();
    this._moveRouteForcing = false;
    this._moveRoute = null;
    this._moveRouteIndex = 0;
    this._originalMoveRoute = null;
    this._originalMoveRouteIndex = 0;
    this._waitCount = 0;
  }

  memorizeMoveRoute() {
    this._originalMoveRoute = this._moveRoute;
    this._originalMoveRouteIndex = this._moveRouteIndex;
  }

  restoreMoveRoute() {
    this._moveRoute = this._originalMoveRoute;
    this._moveRouteIndex = this._originalMoveRouteIndex;
    this._originalMoveRoute = null;
  }

  isMoveRouteForcing(): boolean {
    return this._moveRouteForcing;
  }

  setMoveRoute(moveRoute: MoveRoute) {
    if (this._moveRouteForcing) {
      this._originalMoveRoute = moveRoute;
      this._originalMoveRouteIndex = 0;
    } else {
      this._moveRoute = moveRoute;
      this._moveRouteIndex = 0;
    }
  }

  forceMoveRoute(moveRoute: MoveRoute) {
    if (!this._originalMoveRoute) {
      this.memorizeMoveRoute();
    }
    this._moveRoute = moveRoute;
    this._moveRouteIndex = 0;
    this._moveRouteForcing = true;
    this._waitCount = 0;
  }

  override updateStop(){
    super.updateStop();
    if (!this._moveRouteForcing) return;
    this.updateRoutineMove();
  }

  updateRoutineMove() {
    if (this._waitCount > 0) {
      this._waitCount--;
    } else {
      this.setMovementSuccess(true);
      const command = this._moveRoute.list[this._moveRouteIndex];
      if (command) {
        this.processMoveCommand(command);
        this.advanceMoveRouteIndex();
      }
    }
  }

  processMoveCommand(command : PageList) {
    const params = command.parameters;
    switch (command.code) {
      case Route.END:
        this.processRouteEnd();
        break;
      case Route.MOVE_DOWN:
        this.moveStraight(Direction.DOWN);
        break;
      case Route.MOVE_LEFT:
        this.moveStraight(Direction.LEFT);
        break;
      case Route.MOVE_RIGHT:
        this.moveStraight(Direction.RIGHT);
        break;
      case Route.MOVE_UP:
        this.moveStraight(Direction.UP);
        break;
      case Route.MOVE_LOWER_L:
        this.moveDiagonally(Direction.LEFT, Direction.DOWN);
        break;
      case Route.MOVE_LOWER_R:
        this.moveDiagonally(Direction.RIGHT, Direction.DOWN);
        break;
      case Route.MOVE_UPPER_L:
        this.moveDiagonally(Direction.LEFT, Direction.UP);
        break;
      case Route.MOVE_UPPER_R:
        this.moveDiagonally(Direction.RIGHT, Direction.UP);
        break;
      case Route.MOVE_RANDOM:
        this.moveRandom();
        break;
      case Route.MOVE_TOWARD:
        this.moveTowardPlayer();
        break;
      case Route.MOVE_AWAY:
        this.moveAwayFromPlayer();
        break;
      case Route.MOVE_FORWARD:
        this.moveForward();
        break;
      case Route.MOVE_BACKWARD:
        this.moveBackward();
        break;
      case Route.JUMP:
        this.jump(params[0] as number, params[1] as number);
        break;
      case Route.WAIT:
        this._waitCount = params[0] as number - 1;
        break;
      case Route.TURN_DOWN:
        this.setDirection(Direction.DOWN);
        break;
      case Route.TURN_LEFT:
        this.setDirection(Direction.LEFT);
        break;
      case Route.TURN_RIGHT:
        this.setDirection(Direction.RIGHT);
        break;
      case Route.TURN_UP:
        this.setDirection(Direction.UP);
        break;
      case Route.TURN_90D_R:
        this.turnRight90();
        break;
      case Route.TURN_90D_L:
        this.turnLeft90();
        break;
      case Route.TURN_180D:
        this.turn180();
        break;
      case Route.TURN_90D_R_L:
        this.turnRightOrLeft90();
        break;
      case Route.TURN_RANDOM:
        this.turnRandom();
        break;
      case Route.TURN_TOWARD:
        this.turnTowardPlayer();
        break;
      case Route.TURN_AWAY:
        this.turnAwayFromPlayer();
        break;
      case Route.SWITCH_ON:
        $gameSwitches.setValue(params[0] as number, true);
        break;
      case Route.SWITCH_OFF:
        $gameSwitches.setValue(params[0] as number, false);
        break;
      case Route.CHANGE_SPEED:
        this.moveSpeed = params[0] as number;
        break;
      case Route.CHANGE_FREQ:
        this.moveFrequency = params[0] as number;
        break;
      case Route.WALK_ANIME_ON:
        this.setWalkAnime(true);
        break;
      case Route.WALK_ANIME_OFF:
        this.setWalkAnime(false);
        break;
      case Route.STEP_ANIME_ON:
        this.setStepAnime(true);
        break;
      case Route.STEP_ANIME_OFF:
        this.setStepAnime(false);
        break;
      case Route.DIR_FIX_ON:
        this.setDirectionFix(true);
        break;
      case Route.DIR_FIX_OFF:
        this.setDirectionFix(false);
        break;
      case Route.THROUGH_ON:
        this.setThrough(true);
        break;
      case Route.THROUGH_OFF:
        this.setThrough(false);
        break;
      case Route.TRANSPARENT_ON:
        this.setTransparent(true);
        break;
      case Route.TRANSPARENT_OFF:
        this.setTransparent(false);
        break;
      case Route.CHANGE_IMAGE:
        this.setImage(params[0] as string, params[1] as number);
        break;
      case Route.CHANGE_OPACITY:
        this.opacity = params[0] as number;
        break;
      case Route.CHANGE_BLEND_MODE:
        this.blendMode = params[0] as number;
        break;
      case Route.PLAY_SE:
        AudioManager.playSe(params[0]);
        break;
      case Route.SCRIPT:
        eval(params[0] as string);
        break;
    }
  }

  deltaXFrom(x: number): number {
    return $gameMap.deltaX(this.x, x);
  }

  deltaYFrom(y: number): number {
    return $gameMap.deltaY(this.y, y);
  }

  moveRandom(){
    const d = 2 + Math.randomInt(4) * 2;
    if (this.canPass(this.x, this.y, d)) {
      this.moveStraight(d);
    }
  }

  moveTowardCharacter(character: GameCharacter) {
    const sx = this.deltaXFrom(character.x);
    const sy = this.deltaYFrom(character.y);
    if (Math.abs(sx) > Math.abs(sy)) {
      this.moveStraight(sx > 0 ? 4 : 6);
      if (!this.isMovementSucceeded() && sy !== 0) {
        this.moveStraight(sy > 0 ? 8 : 2);
      }
    } else if (sy !== 0) {
      this.moveStraight(sy > 0 ? 8 : 2);
      if (!this.isMovementSucceeded() && sx !== 0) {
        this.moveStraight(sx > 0 ? 4 : 6);
      }
    }
  }

  moveAwayFromCharacter(character: GameCharacter) {
    const sx = this.deltaXFrom(character.x);
    const sy = this.deltaYFrom(character.y);
    if (Math.abs(sx) > Math.abs(sy)) {
      this.moveStraight(sx > 0 ? 6 : 4);
      if (!this.isMovementSucceeded() && sy !== 0) {
        this.moveStraight(sy > 0 ? 2 : 8);
      }
    } else if (sy !== 0) {
      this.moveStraight(sy > 0 ? 2 : 8);
      if (!this.isMovementSucceeded() && sx !== 0) {
        this.moveStraight(sx > 0 ? 6 : 4);
      }
    }
  }

  turnTowardCharacter(character: GameCharacter) {
    const sx = this.deltaXFrom(character.x);
    const sy = this.deltaYFrom(character.y);
    if (Math.abs(sx) > Math.abs(sy)) {
      this.setDirection(sx > 0 ? 4 : 6);
    } else if (sy !== 0) {
      this.setDirection(sy > 0 ? 8 : 2);
    }
  }

  turnAwayFromCharacter(character: GameCharacter) {
    const sx = this.deltaXFrom(character.x);
    const sy = this.deltaYFrom(character.y);
    if (Math.abs(sx) > Math.abs(sy)) {
      this.setDirection(sx > 0 ? 6 : 4);
    } else if (sy !== 0) {
      this.setDirection(sy > 0 ? 2 : 8);
    }
  }

  turnTowardPlayer() {
    this.turnTowardCharacter($gamePlayer);
  }

  turnAwayFromPlayer() {
    this.turnAwayFromCharacter($gamePlayer);
  }

  moveTowardPlayer() {
    this.moveTowardCharacter($gamePlayer);
  }

  moveAwayFromPlayer() {
    this.moveAwayFromCharacter($gamePlayer);
  }

  moveForward() {
    this.moveStraight(this.direction);
  }

  moveBackward() {
    const lastDirectionFix = this.isDirectionFixed();
    this.setDirectionFix(true);
    this.moveStraight(this.reverseDir(this.direction));
    this.setDirectionFix(lastDirectionFix);
  }

  processRouteEnd(){
    if (this._moveRoute.repeat) {
      this._moveRouteIndex = -1;
    } else if (this._moveRouteForcing) {
      this._moveRouteForcing = false;
      this.restoreMoveRoute();
      this.setMovementSuccess(false);
    }
  }

  advanceMoveRouteIndex(){
    const moveRoute = this._moveRoute;
    if (moveRoute && (this.isMovementSucceeded() || moveRoute.skippable)) {
      let numCommands = moveRoute.list.length - 1;
      this._moveRouteIndex++;
      if (moveRoute.repeat && this._moveRouteIndex >= numCommands) {
        this._moveRouteIndex = 0;
      }
    }
  }

  turnRight90() {
    switch (this.direction) {
      case Direction.DOWN:  this.setDirection(Direction.LEFT);  break;
      case Direction.LEFT:  this.setDirection(Direction.UP);    break;
      case Direction.RIGHT: this.setDirection(Direction.DOWN);  break;
      case Direction.UP:    this.setDirection(Direction.RIGHT); break;
    }
  }

  turnLeft90() {
    switch (this.direction) {
      case Direction.DOWN:  this.setDirection(Direction.RIGHT); break;
      case Direction.LEFT:  this.setDirection(Direction.DOWN);  break;
      case Direction.RIGHT: this.setDirection(Direction.UP);    break;
      case Direction.UP:    this.setDirection(Direction.LEFT);  break;
    }
  }

  turn180(){
    this.setDirection(this.reverseDir(this.direction));
  }

  turnRightOrLeft90(){
    switch (Math.randomInt(2)) {
      case 0:
        this.turnRight90();
        break;
      case 1:
        this.turnLeft90();
        break;
    }
  }

  turnRandom(){
    this.setDirection(2 + Math.randomInt(4) * 2);
  }

  swap(character: GameCharacter) {
    const newX = character.x;
    const newY = character.y;
    character.locate(this.x, this.y);
    this.locate(newX, newY);
  }


  findDirectionTo(goalX: number, goalY: number): number {
    const searchLimit = this.searchLimit();
    const mapWidth = $gameMap.width();
    const nodeList: StartRoute[] = [];
    const openList: number[] = [];
    const closedList: number[] = [];
    const start = {} as StartRoute
    let best = start;

    if (this.x === goalX && this.y === goalY) {
      return 0;
    }

    start.parent = null;
    start.x = this.x;
    start.y = this.y;
    start.g = 0;
    start.f = $gameMap.distance(start.x, start.y, goalX, goalY);
    nodeList.push(start);
    openList.push(start.y * mapWidth + start.x);

    while (nodeList.length > 0) {
      let bestIndex = 0;
      for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i].f < nodeList[bestIndex].f) {
          bestIndex = i;
        }
      }

      const current = nodeList[bestIndex];
      const x1 = current.x;
      const y1 = current.y;
      const pos1 = y1 * mapWidth + x1;
      const g1 = current.g;

      nodeList.splice(bestIndex, 1);
      openList.splice(openList.indexOf(pos1), 1);
      closedList.push(pos1);

      if (current.x === goalX && current.y === goalY) {
        best = current;
        break;
      }

      if (g1 >= searchLimit) {
        continue;
      }

      for (let j = 0; j < 4; j++) {
        const direction = 2 + j * 2;
        const x2 = $gameMap.roundXWithDirection(x1, direction);
        const y2 = $gameMap.roundYWithDirection(y1, direction);
        const pos2 = y2 * mapWidth + x2;

        if (closedList.includes(pos2)) {
          continue;
        }
        if (!this.canPass(x1, y1, direction)) {
          continue;
        }

        const g2 = g1 + 1;
        const index2 = openList.indexOf(pos2);

        if (index2 < 0 || g2 < nodeList[index2].g) {
          let neighbor = {} as StartRoute;
          if (index2 >= 0) {
            neighbor = nodeList[index2];
          } else {
            nodeList.push(neighbor);
            openList.push(pos2);
          }
          neighbor.parent = current;
          neighbor.x = x2;
          neighbor.y = y2;
          neighbor.g = g2;
          neighbor.f = g2 + $gameMap.distance(x2, y2, goalX, goalY);
          if (!best || neighbor.f - neighbor.g < best.f - best.g) {
            best = neighbor;
          }
        }
      }
    }

    let node = best;
    while (node.parent && node.parent !== start) {
      node = node.parent;
    }

    const deltaX1 = $gameMap.deltaX(node.x, start.x);
    const deltaY1 = $gameMap.deltaY(node.y, start.y);
    if (deltaY1 > 0) {
      return 2;
    } else if (deltaX1 < 0) {
      return 4;
    } else if (deltaX1 > 0) {
      return 6;
    } else if (deltaY1 < 0) {
      return 8;
    }

    const deltaX2 = this.deltaXFrom(goalX);
    const deltaY2 = this.deltaYFrom(goalY);
    if (Math.abs(deltaX2) > Math.abs(deltaY2)) {
      return deltaX2 > 0 ? 4 : 6;
    } else if (deltaY2 !== 0) {
      return deltaY2 > 0 ? 8 : 2;
    }

    return 0;
  }

  searchLimit(): number {
    return 12;
  }
}
