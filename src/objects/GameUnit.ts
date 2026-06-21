import { GameBattler } from '@objects/GameBattler.ts';


export abstract class GameUnit<T extends GameBattler>  {


  protected _inBattle: boolean;

  constructor() {
    this.initialize(...arguments);
  }


  initialize(...args: any[]) {
    this._inBattle = false;
  }

  inBattle(): boolean {
    return this._inBattle;
  }

  members(): T[] {
    return [] as T[];
  }

  aliveMembers(): T[] {
    return this.members().filter(member => member.isAlive());
  }

  deadMembers(): T[] {
    return this.members().filter(member => member.isDead());
  }

  movableMembers(): T[] {
    return this.members().filter(member => member.canMove());
  }

  clearActions(){
    for (const member of this.members()) {
      member.clearActions();
    }
  }

  agility(): number {
    const members = this.members();
    const sum = members.reduce((r, member) => r + member.agi, 0);
    return Math.max(1, sum / Math.max(1, members.length));
  }

  tgrSum(): number {
    return this.aliveMembers().reduce((r, member) => r + member.tgr, 0);
  }
  randomTarget(): T {
    let tgrRand = Math.random() * this.tgrSum();
    let target = null;
    for (const member of this.aliveMembers()) {
      tgrRand -= member.tgr;
      if (tgrRand <= 0 && !target) {
        target = member;
      }
    }
    return target;
  }

  randomDeadTarget() : T{
    const members = this.deadMembers();
    return members.length ? members[Math.randomInt(members.length)] : null;
  }

  smoothTarget(index: number): T {
    const member = this.members()[Math.max(0, index)];
    return member && member.isAlive() ? member : this.aliveMembers()[0];
  }

  smoothDeadTarget(index: number): T {
    const member = this.members()[Math.max(0, index)];
    return member && member.isDead() ? member : this.deadMembers()[0];
  }

  clearResults(){
    for (const member of this.members()) {
      member.clearResult();
    }
  }

  onBattleStart(advantageous: boolean){
    for (const member of this.members()) {
      member.onBattleStart(advantageous);
    }
    this._inBattle = true;
  }

  onBattleEnd(){
    this._inBattle = false;
    for (const member of this.members()) {
      member.onBattleEnd();
    }
  }

  makeActions(){
    for (const member of this.members()) {
      member.makeActions();
    }
  }

  select(activeMember: T){
    for (const member of this.members()) {
      if (member === activeMember) {
        member.select();
      } else {
        member.deselect();
      }
    }
  }

  isAllDead(): boolean {
    return this.aliveMembers().length === 0;
  }

  substituteBattler(target: T) : T {
    for (const member of this.members()) {
      if (member.isSubstitute() && member !== target) {
        return member;
      }
    }
    return null;
  }

  tpbBaseSpeed(): number {
    const members = this.members();
    return Math.max(...members.map(member => member.tpbBaseSpeed()));
  }

  tpbReferenceTime(): number {
    return BattleManager.isActiveTpb() ? 240 : 60;
  }

  updateTpb(){
    for (const member of this.members()) {
      member.updateTpb();
    }
  }
}
