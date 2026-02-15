import { GameBattler } from '@objects/GameBattler.ts';
import {
  $dataArmors,
  $dataEnemies,
  $dataItems,
  $dataSkills,
  $dataWeapons,
  $gameParty,
  $gameSwitches,
  $gameTroop
} from '@managers';
import { DataEnemy } from '@data/DataEnemy.ts';
import { ActionData, DropItemKind } from '@data/RPG';
import { CollapseType } from '@objects/GameBattlerBase.ts';
import { GameTroop } from '@objects/GameTroop.ts';
import { GameParty } from '@objects/GameParty.ts';
import { GameAction } from '@objects/GameAction.ts';


export class GameEnemy extends GameBattler {

  protected _enemyId: number;
  protected _letter: string;
  protected _plural: boolean;
  protected _screenX: number;
  protected _screenY: number;

  constructor(enemyId: number, x: number, y: number, ...args: any[]) {
    super(...arguments);
  }

  override initialize(enemyId: number, x: number, y: number, ...args: any[]) {
    super.initialize(...args);
    this.setup(enemyId, x, y);
  }

  override initMembers() {
    super.initMembers();
    this._enemyId = 0;
    this._letter = '';
    this._plural = false;
    this._screenX = 0;
    this._screenY = 0;
  }

  setup(enemyId: number, x: number, y: number) {
    this._enemyId = enemyId;
    this._screenX = x;
    this._screenY = y;
    this.recoverAll();
  }

  override isEnemy(): this is GameEnemy {
    return true;
  }

  friendsUnit(): GameTroop {
    return $gameTroop;
  }

  opponentsUnit(): GameParty {
    return $gameParty;
  }

  index(): number {
    return $gameTroop.members().indexOf(this);
  }

  isBattleMember(): boolean {
    return this.index() >= 0;
  }

  get enemyId(): number {
    return this._enemyId;
  }

  get enemy(): DataEnemy {
    return $dataEnemies[this._enemyId];
  }

  override  traitObjects() {
    return [...super.traitObjects(), this.enemy];
  }

  override paramBase(paramId: number): number {
    return this.enemy.params[paramId];
  }

  exp(): number {
    return this.enemy.exp;
  }

  gold(): number {
    return this.enemy.gold;
  }

  makeDropItems(){
    const rate = this.dropItemRate();
    return this.enemy.dropItems.reduce((r, di) => {
      if (di.kind > 0 && Math.random() * di.denominator < rate) {
        return r.concat(this.itemObject(di.kind, di.dataId));
      } else {
        return r;
      }
    }, []);
  }

  dropItemRate(): number {
    return $gameParty.hasDropItemDouble() ? 2 : 1;
  }

  itemObject(kind: DropItemKind, dataId: number) {
    if (kind === DropItemKind.ITEM) {
      return $dataItems[dataId];
    } else if (kind === DropItemKind.WEAPON) {
      return $dataWeapons[dataId];
    } else if (kind === DropItemKind.ARMOR) {
      return $dataArmors[dataId];
    } else {
      return null;
    }
  }

  isSpriteVisible(): boolean {
    return true;
  }

  get screenX(): number {
    return this._screenX;
  }

  get screenY(): number {
    return this._screenY;
  }

  get battlerName(): string {
    return this.enemy.battlerName;
  }

  get battlerHue(): number {
    return this.enemy.battlerHue;
  }

  get originalName(): string {
    return this.enemy.name;
  }

  get name(): string {
    return this.originalName + (this._plural ? this._letter : "");
  }

  isLetterEmpty(): boolean {
    return this._letter === "";
  }

  setLetter(letter: string) {
    this._letter = letter;
  }

  setPlural(plural: boolean) {
    this._plural = plural;
  }

  override performActionStart(action: GameAction) {
    super.performActionStart(action);
    this.requestEffect("whiten");
  }

  override performAction(action: GameAction) {
    super.performAction(action);
  }

  override performActionEnd() {
    super.performActionEnd();
  }

  override performDamage() {
    super.performDamage();
    SoundManager.playEnemyDamage();
    this.requestEffect("blink");
  }

  override performCollapse() {
    super.performCollapse();
    switch (this.collapseType()) {
      case CollapseType.NORMAL:
        this.requestEffect("collapse");
        SoundManager.playEnemyCollapse();
        break;
      case CollapseType.BOSS:
        this.requestEffect("bossCollapse");
        SoundManager.playBossCollapse1();
        break;
      case CollapseType.INSTANT:
        this.requestEffect("instantCollapse");
        break;
    }
  }

  transform(enemyId: number){
    const name = this.originalName;
    this._enemyId = enemyId;
    if (this.originalName !== name) {
      this._letter = "";
      this._plural = false;
    }
    this.refresh();
    if (this.numActions() > 0) {
      this.makeActions();
    }
  }

  meetsCondition(action: ActionData){
    const param1 = action.conditionParam1;
    const param2 = action.conditionParam2;
    switch (action.conditionType) {
      case 1:
        return this.meetsTurnCondition(param1, param2);
      case 2:
        return this.meetsHpCondition(param1, param2);
      case 3:
        return this.meetsMpCondition(param1, param2);
      case 4:
        return this.meetsStateCondition(param1);
      case 5:
        return this.meetsPartyLevelCondition(param1);
      case 6:
        return this.meetsSwitchCondition(param1);
      default:
        return true;
    }
  }

  meetsTurnCondition(param1: number, param2: number): boolean {
    const n = this.turnCount();
    if (param2 === 0) {
      return n === param1;
    } else {
      return n > 0 && n >= param1 && n % param2 === param1 % param2;
    }
  }

  meetsHpCondition(param1: number, param2: number) : boolean {
    return this.hpRate() >= param1 && this.hpRate() <= param2;
  }

  meetsMpCondition(param1: number, param2: number): boolean {
    return this.mpRate() >= param1 && this.mpRate() <= param2;
  }

  meetsStateCondition(param: number) : boolean {
    return this.isStateAffected(param);
  }

  meetsPartyLevelCondition(param: number) {
    return $gameParty.highestLevel() >= param;
  }

  meetsSwitchCondition(param: number) {
    return $gameSwitches.value(param);
  }

  isActionValid(action: ActionData): boolean {
    return (
      this.meetsCondition(action) && this.canUse($dataSkills[action.skillId])
    );
  }

  selectAction(actionList: ActionData[], ratingZero: number) : ActionData {
    const sum = actionList.reduce((r, a) => r + a.rating - ratingZero, 0);
    if (sum > 0) {
      let value = Math.randomInt(sum);
      for (const action of actionList) {
        value -= action.rating - ratingZero;
        if (value < 0) {
          return action;
        }
      }
    } else {
      return null;
    }
  }

  selectAllActions(actionList: ActionData[]) {
    const ratingMax = Math.max(...actionList.map(a => a.rating));
    const ratingZero = ratingMax - 3;
    actionList = actionList.filter(a => a.rating > ratingZero);
    for (let i = 0; i < this.numActions(); i++) {
      this.action(i).setEnemyAction(
        this.selectAction(actionList, ratingZero)
      );
    }
  }

  override makeActions() {
    super.makeActions();
    if (this.numActions() > 0) {
      const actionList = this.enemy.actions.filter(a =>
        this.isActionValid(a)
      );
      if (actionList.length > 0) {
        this.selectAllActions(actionList);
      }
    }
    this.setActionState("waiting");
  }
}
