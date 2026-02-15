import { GameBattlerBase } from '@objects/GameBattlerBase.ts';
import { IContractualClass } from '@core/interfaces';
import { $dataStates, $dataSystem, $gameParty, $gameTroop, DataManager } from '@managers';
import { DataUsableItem } from '@data/DataUsableItem.ts';
import { DataItem } from '@data/DataItem.ts';
import { DataSkill } from '@data/DataSkill.ts';
import { GameAction } from '@objects/GameAction.ts';
import { GameParty } from '@objects/GameParty.ts';
import { GameTroop } from '@objects/GameTroop.ts';
import { GameUnit } from '@objects/GameUnit.ts';
import { GameActor } from '@objects/GameActor.ts';
import { GameActionResult } from '@objects/GameActionResult.ts';
import { GameEnemy } from '@objects/GameEnemy.ts';


type EffectType = "whiten" | "blink" | "collapse" | "bossCollapse" | "instantCollapse" | "";

type MotionType = "guard" | "spell" | "skill" | "item" | "thrust" | "swing" | "missile" |
  "damage" | "evade" | "victory" | "escape" | "";

type TpbState = "charging" | "casting" | "acting" | "ready" | "charged" | "";

type ActionState = "undecided" | "inputting" | "waiting" | "acting" | "done" | "";

export type BattleUnit = GameParty | GameTroop;

export abstract class GameBattler extends GameBattlerBase implements IContractualClass {


  protected _actions: GameAction[];
  protected _speed: number;
  protected  _result: GameActionResult;
  protected _actionState: string;
  protected _lastTargetIndex: number;
  protected _damagePopup: boolean
  protected _effectType : EffectType;
  protected _motionType : MotionType;
  protected _weaponImageId: number;
  protected _motionRefresh: boolean;
  protected _selected: boolean;
  protected _tpbState: TpbState;
  protected _tpbChargeTime : number;
  protected _tpbCastTime: number;
  protected _tpbIdleTime:  number;
  protected _tpbTurnCount: number;
  protected _tpbTurnEnd: boolean;

  override initMembers() {
    super.initMembers();

    this._actions = [];
    this._speed = 0;
    this._result = new GameActionResult();
    this._actionState = "";
    this._lastTargetIndex = 0;
    this._damagePopup = false;
    this._effectType = null;
    this._motionType = null;
    this._weaponImageId = 0;
    this._motionRefresh = false;
    this._selected = false;
    this._tpbState = "";
    this._tpbChargeTime = 0;
    this._tpbCastTime = 0;
    this._tpbIdleTime = 0;
    this._tpbTurnCount = 0;
    this._tpbTurnEnd = false;
  }


  abstract friendsUnit():  BattleUnit;

  abstract opponentsUnit(): BattleUnit;

  clearDamagePopup() {
    this._damagePopup = false;
  }

  clearWeaponAnimation(){
    this._weaponImageId = 0;
  }

  clearEffect() {
    this._effectType = null;
  }

  clearMotion() {
    this._motionType = null;
    this._motionRefresh = false;
  }

  requestEffect(effectType: EffectType) {
    this._effectType = effectType;
  }

  requestMotion(motionType: MotionType) {
    this._motionType = motionType;
  }

  requestMotionRefresh(){
    this._motionRefresh = true;
  }

  cancelMotionRefresh(){
    this._motionRefresh = false;
  }

  select(){
    this._selected = true;
  }

  deselect(){
    this._selected = false;
  }

  isDamagePopupRequested(): boolean {
    return this._damagePopup;
  }

  isEffectRequested(): boolean {
    return !!this._effectType;
  }

  isMotionRequested(): boolean {
    return !!this._motionType;
  }

  isWeaponAnimationRequested(): boolean {
    return this._weaponImageId > 0;
  }

  isMotionRefreshRequested(): boolean {
    return this._motionRefresh;
  }

  isSelected(): boolean {
    return this._selected;
  }

  effectType(): EffectType {
    return this._effectType;
  }

  motionType(): MotionType {
    return this._motionType;
  }

  weaponImageId(): number {
    return this._weaponImageId;
  }

  startDamagePopup(){
    this._damagePopup = true;
  }

  shouldPopupDamage(): boolean {
    const result = this._result;
    return (
      result.missed ||
      result.evaded ||
      result.hpAffected ||
      result.mpDamage !== 0
    );
  }

  startWeaponAnimation(weaponImageId: number) {
    this._weaponImageId = weaponImageId
  }

  action(index: number) : GameAction {
    return this._actions[index];
  }

  setAction(index: number, action : GameAction) {
    this._actions[index] = action;
  }

  numActions(): number {
    return this._actions.length;
  }

  clearActions() {
    this._actions = [];
  }

  result(): GameActionResult {
    return this._result;
  }

  clearResult(){
    this._result.clear();
  }

  clearTpbChargeTime(){
    this._tpbState = "charging";
    this._tpbChargeTime = 0;
  }

  applyTpbPenalty(){
    this._tpbState = "charging";
    this._tpbChargeTime -= 1;
  }

  initTpbChargeTime(advantageous: boolean) {
    const speed = this.tpbRelativeSpeed();
    this._tpbState = "charging";
    this._tpbChargeTime = advantageous ? 1 : speed * Math.random() * 0.5;
    if (this.isRestricted()) {
      this._tpbChargeTime = 0;
    }
  }

  tpbChargeTime(): number {
    return this._tpbChargeTime;
  }

  startTpbCasting(){
    this._tpbState = "casting";
    this._tpbCastTime = 0;
  }

  startTpbAction(){
    this._tpbState = "acting";
  }

  isTpbCharged(): boolean {
    return this._tpbState === "charged";
  }

  isTpbReady(): boolean {
    return this._tpbState === "ready";
  }

  isTpbTimeout(): boolean {
    return this._tpbIdleTime >= 1;
  }

  updateTpb(){
    if (this.canMove()) {
      this.updateTpbChargeTime();
      this.updateTpbCastTime();
      this.updateTpbAutoBattle();
    }
    if (this.isAlive()) {
      this.updateTpbIdleTime();
    }
  }

  updateTpbChargeTime(){
    if (this._tpbState === "charging") {
      this._tpbChargeTime += this.tpbAcceleration();
      if (this._tpbChargeTime >= 1) {
        this._tpbChargeTime = 1;
        this.onTpbCharged();
      }
    }
  }

  updateTpbCastTime(){
    if (this._tpbState === "casting") {
      this._tpbCastTime += this.tpbAcceleration();
      if (this._tpbCastTime >= this.tpbRequiredCastTime()) {
        this._tpbCastTime = this.tpbRequiredCastTime();
        this._tpbState = "ready";
      }
    }
  }

  updateTpbAutoBattle(){
    if (this.isTpbCharged() && !this.isTpbTurnEnd() && this.isAutoBattle()) {
      this.makeTpbActions();
    }
  }

  updateTpbIdleTime(){
    if (!this.canMove() || this.isTpbCharged()) {
      this._tpbIdleTime += this.tpbAcceleration();
    }
  }

  tpbAcceleration(): number {
    const speed = this.tpbRelativeSpeed();
    const referenceTime = $gameParty.tpbReferenceTime();
    return speed / referenceTime;
  }

  tpbRelativeSpeed(): number {
    return this.tpbSpeed() / $gameParty.tpbBaseSpeed();
  }

  tpbSpeed(): number {
    return Math.sqrt(this.agi) + 1;
  }

  tpbBaseSpeed(): number {
    const baseAgility = this.paramBasePlus(6);
    return Math.sqrt(baseAgility) + 1;
  }

  tpbRequiredCastTime(): number {
    const actions = this._actions.filter(action => action.isValid());
    const items = actions.map(action => action.item());
    const delay = items.reduce((r, item) => r + Math.max(0, -item.speed), 0);
    return Math.sqrt(delay) / this.tpbSpeed();
  }

  onTpbCharged()  {
    if (!this.shouldDelayTpbCharge()) {
      this.finishTpbCharge();
    }
  }

  shouldDelayTpbCharge(): boolean {
    return !BattleManager.isActiveTpb() && $gameParty.canInput();
  }

  finishTpbCharge() {
    this._tpbState = "charged";
    this._tpbTurnEnd = true;
    this._tpbIdleTime = 0;
  }

  isTpbTurnEnd(): boolean {
    return this._tpbTurnEnd;
  }

  initTpbTurn(){
    this._tpbTurnEnd = false;
    this._tpbTurnCount = 0;
    this._tpbIdleTime = 0;
  }

  startTpbTurn(){
    this._tpbTurnEnd = false;
    this._tpbTurnCount++;
    this._tpbIdleTime = 0;
    if (this.numActions() === 0) {
      this.makeTpbActions();
    }
  }

  makeTpbActions() {
    this.makeActions();
    if (this.canInput()) {
      this.setActionState("undecided");
    } else {
      this.startTpbCasting();
      this.setActionState("waiting");
    }
  }

  onTpbTimeout(){
    this.onAllActionsEnd();
    this._tpbTurnEnd = true;
    this._tpbIdleTime = 0;
  }

  turnCount(): number {
    if (BattleManager.isTpb()) {
      return this._tpbTurnCount;
    } else {
      return $gameTroop.turnCount() + 1;
    }
  }

  override canInput(): boolean {
    if (BattleManager.isTpb() && !this.isTpbCharged()) {
      return false;
    }
    return super.canInput();
  }

  override refresh() {
    super.refresh();
    if (this.hp === 0) {
      this.addState(this.deathStateId());
    } else {
      this.removeState(this.deathStateId());
    }
  }

  addState(stateId: number) {
    if (this.isStateAddable(stateId)) {
      if (!this.isStateAffected(stateId)) {
        this.addNewState(stateId);
        this.refresh();
      }
      this.resetStateCounts(stateId);
      this._result.pushAddedState(stateId);
    }
  }

  isStateAddable(stateId: number): boolean {
    return (
      this.isAlive() &&
      $dataStates[stateId] &&
      !this.isStateResist(stateId) &&
      !this.isStateRestrict(stateId)
    );
  }

  isStateRestrict(stateId: number): boolean {
    return $dataStates[stateId].removeByRestriction && this.isRestricted();
  }

  override onRestrict() {
    super.onRestrict();
    this.clearTpbChargeTime();
    this.clearActions();
    for (const state of this.states()) {
      if (state.removeByRestriction) {
        this.removeState(state.id);
      }
    }
  }

  removeState(stateId: number) {
    if (this.isStateAffected(stateId)) {
      if (stateId === this.deathStateId()) {
        this.revive();
      }
      this.eraseState(stateId);
      this.refresh();
      this._result.pushRemovedState(stateId);
    }
  }

  escape() {
    if ($gameParty.inBattle()) {
      this.hide();
    }
    this.clearActions();
    this.clearStates();
    SoundManager.playEscape();
  }

  addBuff(paramId: number, turns: number) {
    if (this.isAlive()) {
      this.increaseBuff(paramId);
      if (this.isBuffAffected(paramId)) {
        this.overwriteBuffTurns(paramId, turns);
      }
      this._result.pushAddedBuff(paramId);
      this.refresh();
    }
  }

  addDebuff(paramId: number, turns: number){
    if (this.isAlive()) {
      this.decreaseBuff(paramId);
      if (this.isDebuffAffected(paramId)) {
        this.overwriteBuffTurns(paramId, turns);
      }
      this._result.pushAddedDebuff(paramId);
      this.refresh();
    }
  }

  removeBuff(paramId : number) {
    if (this.isAlive() && this.isBuffOrDebuffAffected(paramId)) {
      this.eraseBuff(paramId);
      this._result.pushRemovedBuff(paramId);
      this.refresh();
    }
  }

  removeBattleStates() {
    for (const state of this.states()) {
      if (state.removeAtBattleEnd) {
        this.removeState(state.id);
      }
    }
  }

  removeAllBuffs(){
    for (let i = 0; i < this.buffLength(); i++) {
      this.removeBuff(i);
    }
  }

  removeStatesAuto(timing: number) {
    for (const state of this.states()) {
      if (
        this.isStateExpired(state.id) &&
        state.autoRemovalTiming === timing
      ) {
        this.removeState(state.id);
      }
    }
  }

  removeBuffsAuto(){
    for (let i = 0; i < this.buffLength(); i++) {
      if (this.isBuffExpired(i)) {
        this.removeBuff(i);
      }
    }
  }

  removeStatesByDamage() {
    for (const state of this.states()) {
      if (
        state.removeByDamage &&
        Math.randomInt(100) < state.chanceByDamage
      ) {
        this.removeState(state.id);
      }
    }
  }

  makeActionTimes(){
    const actionPlusSet = this.actionPlusSet();
    return actionPlusSet.reduce((r, p) => (Math.random() < p ? r + 1 : r), 1);
  }

  makeActions(){
    this.clearActions();
    if (this.canMove()) {
      const actionTimes = this.makeActionTimes();
      this._actions = [];
      for (let i = 0; i < actionTimes; i++) {
        this._actions.push(new GameAction(this));
      }
    }
  }

  speed(): number {
    return this._speed;
  }

  makeSpeed(){
    this._speed = Math.min(...this._actions.map(action => action.speed())) || 0;
  }

  currentAction(){
    return this._actions[0];
  }

  removeCurrentAction(){
    this._actions.shift();
  }

  setLastTarget(target: GameBattler){
    this._lastTargetIndex = target ? (target as GameEnemy).index() : 0;
  }

  forceAction(skillId: number, targetIndex: number){
    this.clearActions();
    const action = new GameAction(this, true);
    action.setSkill(skillId);
    if (targetIndex === -2) {
      action.setTarget(this._lastTargetIndex);
    } else if (targetIndex === -1) {
      action.decideRandomTarget();
    } else {
      action.setTarget(targetIndex);
    }
    if (action.item()) {
      this._actions.push(action);
    }
  }

  useItem(item: DataUsableItem){
    if (DataManager.isSkill(item)) {
      this.paySkillCost(item as DataSkill);
    } else if (DataManager.isItem(item)) {
      this.consumeItem(item as DataItem);
    }
  }

  consumeItem(item: DataItem){
    $gameParty.consumeItem(item)
  }

  gainHp(value: number){
    this._result.hpDamage = -value;
    this._result.hpAffected = true;
    this.setHp(this.hp + value);
  }

  gainMp(value: number){
    this._result.mpDamage = -value;
    this.setMp(this.mp + value);
  }

  gainTp(value: number){
    this._result.tpDamage = -value;
    this.setTp(this.tp + value);
  }

  gainSilentTp(value : number){
    this.setTp(this.tp + value);
  }

  initTp(){
    this.setTp(Math.randomInt(25));
  }

  clearTp(){
    this.setTp(0);
  }

  chargeTpByDamage(damageRate: number){
    const value = Math.floor(50 * damageRate * this.tcr);
    this.gainSilentTp(value);
  }

  regenerateHp(){
    const minRecover = -this.maxSlipDamage();
    const value = Math.max(Math.floor(this.mhp * this.hrg), minRecover);
    if (value !== 0) {
      this.gainHp(value);
    }
  }

  maxSlipDamage(){
    return $dataSystem.optSlipDeath ? this.hp : Math.max(this.hp - 1, 0);
  }

  regenerateMp(){
    const value = Math.floor(this.mmp * this.mrg);
    if (value !== 0) {
      this.gainMp(value);
    }
  }

  regenerateTp(){
    const value = Math.floor(100 * this.trg);
    this.gainSilentTp(value);
  }

  regenerateAll(){
    if (this.isAlive()) {
      this.regenerateHp();
      this.regenerateMp();
      this.regenerateTp();
    }
  }

  onBattleStart(advantageous?: boolean){
    this.setActionState("undecided");
    this.clearMotion();
    this.initTpbChargeTime(advantageous);
    this.initTpbTurn();
    if (!this.isPreserveTp()) {
      this.initTp();
    }
  }

  onAllActionsEnd(){
    this.clearResult();
    this.removeStatesAuto(1);
    this.removeBuffsAuto();
  }

  onTurnEnd(){
    this.clearResult();
    this.regenerateAll();
    this.updateStateTurns();
    this.updateBuffTurns();
    this.removeStatesAuto(2);
  }

  onBattleEnd(){
    this.clearResult();
    this.removeBattleStates();
    this.removeAllBuffs();
    this.clearActions();
    if (!this.isPreserveTp()) {
      this.clearTp();
    }
    this.appear();
  }

  onDamage(value: number){
    this.removeStatesByDamage();
    this.chargeTpByDamage(value / this.mhp);
  }

  setActionState(actionState: ActionState){
    this._actionState = actionState;
    this.requestMotionRefresh();
  }

  isUndecided(): boolean {
    return this._actionState === "undecided";
  }

  isInputting(): boolean {
    return this._actionState === "inputting";
  }

  isWaiting(): boolean {
    return this._actionState === "waiting";
  }

  isActing(): boolean {
    return this._actionState === "acting";
  }

  isChanting(): boolean {
    if (this.isWaiting()) {
      return this._actions.some(action => action.isMagicSkill());
    }
    return false;
  }

  isGuardWaiting(): boolean {
    if (this.isWaiting()) {
      return this._actions.some(action => action.isGuard());
    }
    return false;
  }

  performActionStart(action: GameAction){
    if (!action.isGuard()) {
      this.setActionState("acting");
    }
  }

  performAction(_action: GameAction) {

  }

  /// mark as abstract?
  performActionEnd(){}

  performDamage(){}


  performMiss(){
    SoundManager.playMiss();
  }

  performRecovery(){
    SoundManager.playRecovery();
  }

  performEvasion(){
    SoundManager.playEvasion();
  }

  performMagicEvasion(){
    SoundManager.playMagicEvasion();
  }

  performCounter(){
    SoundManager.playEvasion();
  }

  performReflection(){
    SoundManager.playReflection();
  }

  performSubstitute(_target: GameBattler){

  }

  performCollapse(){

  }
}
