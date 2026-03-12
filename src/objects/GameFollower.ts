import { GameCharacter } from '@objects/GameCharacter.ts';
import { $dataSystem, $gameParty, $gamePlayer } from '@managers';
import { GameActor } from '@objects/GameActor.ts';


export class GameFollower  extends GameCharacter {


  protected _memberIndex: number;

  constructor(memberIndex: number) {
    super(...arguments);
  }

  override initialize(memberIndex: number, ...args: any[]): void {
    super.initialize(...args);
    this._memberIndex = memberIndex;
    this.setTransparent($dataSystem.optTransparent);
    this.setThrough(true);
  }

  refresh(){
    const characterName = this.isVisible() ? this.actor().characterName : "";
    const characterIndex = this.isVisible() ? this.actor().characterIndex : 0;
    this.setImage(characterName, characterIndex);
  }

  actor(): GameActor {
    return $gameParty.battleMembers()[this._memberIndex];
  }

  isVisible(): boolean {
    return this.actor() && $gamePlayer.followers().isVisible();
  }

  isGathered(): boolean {
    return !this.isMoving() && this.pos($gamePlayer.x, $gamePlayer.y);
  }

  override update() {
    super.update();
    this.moveSpeed = $gamePlayer.realMoveSpeed();
    this.opacity = $gamePlayer.opacity();
    this.blendMode = $gamePlayer.blendMode();
    this.setWalkAnime($gamePlayer.hasWalkAnime());
    this.setStepAnime($gamePlayer.hasStepAnime());
    this.setDirectionFix($gamePlayer.isDirectionFixed());
    this.setTransparent($gamePlayer.isTransparent());
  }

  chaseCharacter(character: GameCharacter){
    const sx = this.deltaXFrom(character.x);
    const sy = this.deltaYFrom(character.y);
    if (sx !== 0 && sy !== 0) {
      this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
    } else if (sx !== 0) {
      this.moveStraight(sx > 0 ? 4 : 6);
    } else if (sy !== 0) {
      this.moveStraight(sy > 0 ? 8 : 2);
    }
    this.moveSpeed = $gamePlayer.realMoveSpeed();
  }

  checkEventTriggerTouch(_x: number, _y: number) {
    // NOT NEEDED but gotta implement the abstract member
  }
}


