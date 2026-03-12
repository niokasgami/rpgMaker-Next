import { $dataSystem, $gameParty, $gamePlayer } from '@managers';
import { GameFollower } from '@objects/GameFollower.ts';


export class GameFollowers {

  private _visible: boolean;
  private _gathering: boolean;
  private _data: GameFollower[];

  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this._visible = $dataSystem.optFollowers;
    this._gathering = false;
    this._data = [];
    this.setup();
  }

  setup() {
    this._data = [];
    for (let i = 1; i < $gameParty.maxBattleMembers(); i++) {
      this._data.push(new GameFollower(i));
    }
  }

  isVisible(): boolean {
    return this._visible;
  }

  show() {
    this._visible = true;
  }

  hide(){
    this._visible = false;
  }

  data(): GameFollower[]{
    return this._data.clone();
  }

  reserveData(): GameFollower[] {
    return this._data.clone().reverse();
  }

  follower(index: number): GameFollower {
    return this._data[index];
  }

  refresh(){
    for (const follower of this._data) {
      follower.refresh();
    }
  }

  update() {
    if (this.areGathering()) {
      if (!this.areMoving()) {
        this.updateMove();
      }
      if (this.areGathered()) {
        this._gathering = false;
      }
    }
    for (const follower of this._data) {
      follower.update();
    }
  }

  updateMove() {
    for (let i = this._data.length - 1; i >= 0; i--) {
      const precedingCharacter = i > 0 ? this._data[i - 1] : $gamePlayer;
      this._data[i].chaseCharacter(precedingCharacter);
    }
  }

  jumpAll(){
    if ($gamePlayer.isJumping()) {
      for (const follower of this._data) {
        const sx = $gamePlayer.deltaXFrom(follower.x);
        const sy = $gamePlayer.deltaYFrom(follower.y);
        follower.jump(sx, sy);
      }
    }
  }

  synchronize(x: number, y: number, d: number) {
    for (const follower of this._data) {
      follower.locate(x, y);
      follower.setDirection(d);
    }
  }

  gather(){
    this._gathering = true;
  }

  areGathering(): boolean {
    return this._gathering;
  }

  visibleFollowers(): GameFollower[] {
    return this._data.filter(follower => follower.isVisible());
  }

  areMoving(): boolean {
    return this.visibleFollowers().some(follower => follower.isMoving());
  }

  areGathered(): boolean {
    return this.visibleFollowers().every(follower => follower.isGathered());
  }

  isSomeoneCollided(x: number,y: number): boolean {
    return this.visibleFollowers().some(follower => follower.pos(x, y));
  }
}
