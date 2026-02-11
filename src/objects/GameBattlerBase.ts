import { IContractualClass } from '../core/interfaces';
import { $dataStates, $gameParty } from '@managers';
import { DataState } from '@data/DataState.ts';
import { TraitData } from '@data/RPG';
import { DataSkill } from '@data/DataSkill.ts';
import { DataItem } from '@data/DataItem.ts';



export enum Traits {
  ELEMENT_RATE = 11,
  DEBUFF_RATE = 12,
  STATE_RATE = 13,
  STATE_RESIST = 14,
  PARAM = 21,
  XPARAM = 22,
  SPARAM = 23,
  ATTACK_ELEMENT = 31,
  ATTACK_STATE = 32,
  ATTACK_SPEED = 33,
  ATTACK_TIMES = 34,
  ATTACK_SKILL = 35,
  STYPE_ADD = 41,
  STYPE_SEAL = 42,
  SKILL_ADD = 43,
  SKILL_SEAL = 44,
  EQUIP_WTYPE = 51,
  EQUIP_ATYPE = 52,
  EQUIP_LOCK = 53,
  EQUIP_SEAL = 54,
  SLOT_TYPE = 55,
  ACTION_PLUS = 61,
  SPECIAL_FLAG = 62,
  COLLAPSE_TYPE = 63,
  PARTY_ABILITY = 64,
}

export enum FlagId {
  AUTO_BATTLE = 0,
  GUARD = 1,
  SUBSTITUTE = 2,
  PRESERVE_TP = 3,
}

export enum IconStart {
  BUFF = 32,
  DEBUFF = 48,
}

export class GameBattlerBase implements IContractualClass {

  protected _hp: number;
  protected _mp: number;
  protected _tp: number;
  protected _hidden: boolean;
  protected _paramPlus: number[];
  protected _states: number[];
  protected _stateTurns: Map<number, number>;
  protected _buffs: number[];
  protected _buffTurns: number[];

  /**
   * The unit current HP
   */
  get hp(): number {
    return this._hp;
  }

  /**
   * The unit current MP
   */
  get mp(): number {
    return this._mp;
  }

  /**
   * The unit current TP
   */
  get tp(): number {
    return this._tp;
  }

  /**
   * the unit max HP
   */
  get mhp(): number {
    return this.param(0);
  }

  /**
   * the unit max MP
   */
  get mmp() {
    return this.param(1);
  }

  /**
   * The unit attack power
   */
  get atk(): number {
    return this.param(2);
  }

  /**
   * The unit defense power
   */
  get def(): number {
    return this.param(3);
  }

  /**
   * the unit magic attack power
   */
  get mat(): number {
    return this.param(4);
  }

  /**
   * the unit magic defense power
   */
  get mdf(): number {
    return this.param(5);
  }

  /**
   * the unit agility
   */
  get agi(): number {
    return this.param(6);
  }

  /**
   * the unit luck
   */
  get luk(): number {
    return this.param(7);
  }

  /**
   * the unit hit rate
   */
  get hit(): number {
    return this.xparam(0);
  }

  /**
   * the unit evasion rate
   */
  get eva(): number {
    return this.xparam(1);
  }

  /**
   * the unit critical rate
   */
  get cri(): number {
    return this.xparam(2);
  }

  /**
   * the unit critical evasion rate
   */
  get cev(): number {
    return this.xparam(3);
  }

  /**
   * the unit magic evasion rate
   */
  get mev(): number {
    return this.xparam(4);
  }

  /**
   * the unit magic reflection rate
   */
  get mrf(): number {
    return this.xparam(5);
  }

  /**
   * the unit counter rate
   */
  get cnt(): number {
    return this.xparam(6);
  }

  /**
   * the unit hp regeneration rate
   */
  get hrg(): number {
    return this.xparam(7);
  }

  /**
   * the unit mp regeneration rate
   */
  get mrg(): number {
    return this.xparam(8);
  }

  /**
   * the unit tp regeneration rate
   */
  get trg(): number {
    return this.xparam(9);
  }

  /**
   * the unit target rate
   */
  get tgr(): number {
    return this.sparam(0);
  }

  /**
   * the unit guard effect rate
   */
  get grd(): number {
    return this.sparam(1);
  }

  /**
   * the unit recovery effect rate
   */
  get rec(): number {
    return this.sparam(2);
  }

  /**
   * the unit pharmacology
   */
  get pha(): number {
    return this.sparam(3);
  }

  /**
   * the unit mp cost rate
   */
  get mcr(): number {
    return this.sparam(4);
  }

  /**
   * the unit tp charge rate
   */
  get tcr(): number {
    return this.sparam(5);
  }

  /**
   * the unit physical damage rate
   */
  get pdr(): number {
    return this.sparam(6);
  }

  /**
   * the unit magical damage rate
   */
  get mdr(): number {
    return this.sparam(7);
  }

  /**
   * the unit floor damage rate
   */
  get fdr(): number {
    return this.sparam(8);
  }

  /**
   * the unit experience rate
   */
  get exr(): number {
    return this.sparam(9);
  }

  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this.initMembers();
  }

  /**
   * Initialize member variables
   */
  initMembers() {
    this._hp = 1;
    this._mp = 0;
    this._tp = 0;
    this._hidden = false;
    this.clearParamPlus();
    this.clearStates();
    this.clearBuffs();
  }

  clearParamPlus() {
    this._paramPlus = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  clearStates() {
    this._states = [];
    this._stateTurns = new Map<number, number>();
  }

  eraseState(stateId: number) {
    this._states.remove(stateId);
  }

  isStateAffected(stateId: number): boolean {
    return this._states.includes(stateId);
  }

  isDeathStateAffected(): boolean {
    return this._states.includes(this.deathStateId());
  }

  deathStateId(): number {
    return 1;
  }

  resetStateCounts(stateId: number) {
    const state = $dataStates[stateId];
    const variance = 1 + Math.max(state.maxTurns - state.minTurns, 0);
    this._stateTurns.set(stateId, state.minTurns + Math.randomInt(variance));
  }

  isStateExpired(stateId: number): boolean {
    return this._stateTurns.get(stateId) === 0;
  }

  updateStateTurns(): void {
    for (const stateId of this._states) {
      const turns = this._stateTurns.get(stateId);
      if (turns !== undefined && turns > 0) {
        this._stateTurns.set(stateId, turns - 1);
      }
    }
  }

  clearBuffs() {
    this._buffs = [0, 0, 0, 0, 0, 0, 0, 0];
    this._buffTurns = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  eraseBuffs(paramId: number) {
    this._buffs[paramId] = 0;
    this._buffTurns[paramId] = 0;
  }

  buffLength(): number {
    return this._buffs.length;
  }

  buff(paramId: number): number {
    return this._buffs[paramId];
  }

  isBuffAffected(paramId: number): boolean {
    return this._buffs[paramId] === 0;
  }

  isBuffOrDebuffAffected(paramId: number): boolean {
    return this._buffs[paramId] !== 0;
  }

  isMaxBuffAffected(paramId: number): boolean {
    return this._buffs[paramId] === 2;
  }

  isMaxDebuffAffected(paramId: number): boolean {
    return this._buffs[paramId] === -2;
  }

  increaseBuff(paramId: number) {
    if (!this.isMaxBuffAffected(paramId)) {
      this._buffs[paramId]++;
    }
  }

  decreaseBuff(paramId: number) {
    if (!this.isMaxDebuffAffected(paramId)) {
      this._buffs[paramId]--;
    }
  }

  overwriteBuffTurns(paramId: number, turns: number) {
    if (this._buffTurns[paramId] < turns) {
      this._buffTurns[paramId] = turns;
    }
  }

  isBuffExpired(paramId: number): boolean {
    return this._buffTurns[paramId] === 0;
  }

  updateBuffTurns() {
    for (let i = 0; i < this._buffTurns.length; i++) {
      if (this._buffTurns[i] > 0) {
        this._buffTurns[i]--;
      }
    }
  }

  die() {
    this._hp = 0;
    this.clearStates();
    this.clearBuffs();
  }

  revive() {
    if (this._hp === 0) {
      this._hp = 1;
    }
  }

  states(): DataState[] {
    return this._states.map(id => $dataStates[id]);
  }

  stateIcons(): number[] {
    return this.states()
      .map(state => state.iconIndex)
      .filter(iconIndex => iconIndex > 0);
  }

  buffIcons(): number[] {
    const icons = [];
    for (let i = 0; i < this._buffs.length; i++) {
      if (this._buffs[i] !== 0) {
        icons.push(this.buffIconIndex(this._buffs[i], i));
      }
    }
    return icons;
  }

  buffIconIndex(buffLevel: number, paramId: number): number {
    if (buffLevel > 0) {
      return IconStart.BUFF + (buffLevel - 1) * 8 + paramId;
    } else if (buffLevel < 0) {
      return (
        IconStart.DEBUFF + (-buffLevel - 1) * 8 + paramId
      );
    } else {
      return 0;
    }
  }

  allIcons(): number[] {
    return this.stateIcons().concat(this.buffIcons());
  }

  traitObjects(): DataState[] {
    return this.states();
  }

  /**
   * return all the traits as an array.
   */
  allTraits(): TraitData[] {
    return this.traitObjects().flatMap(obj => obj.traits);
  }

  traits(code: number): TraitData[] {
    return this.allTraits().filter(trait => trait.code === code);
  }

  traitsWithId(code: number, id: number): TraitData[] {
    return this.allTraits().filter(
      trait => trait.code === code && trait.dataId === id
    );
  }

  traitsPi(code: number, id: number): number {
    return this.traitsWithId(code, id).reduce((r, trait) => r * trait.value, 1);
  }

  traitsSum(code: number, id: number): number {
    return this.traitsWithId(code, id).reduce((r, trait) => r + trait.value, 0);
  }

  traitsSumAll(code: number): number {
    return this.traits(code).reduce((r, trait) => r + trait.value, 0);
  }

  traitsSet(code: number): number[] {
    // TODO: Test if Set deduplication is needed
    // - Can multiple equipment grant same trait dataId?
    // - Do stacked states create duplicate trait entries?
    // If duplicates never occur, simplify to: this.traits(code).map(t => t.dataId)
    return [...new Set(this.traits(code).map(trait => trait.dataId))];
  }

  paramBase(_paramId: number): number {
    return 0;
  }

  paramPlus(paramId: number): number {
    return this._paramPlus[paramId];
  }

  paramBasePlus(paramId: number): number {
    return Math.max(0, this.paramBase(paramId) + this.paramPlus(paramId));
  }

  paramMin(paramId: number): number {
    if (paramId === 0) {
      return 1; // MHP
    } else {
      return 0;
    }
  }

  paramMax(): number {
    return Infinity;
  }

  paramRate(paramId: number): number {
    return this.traitsPi(Traits.PARAM, paramId);
  }

  paramBuffRate(paramId: number): number {
    return this._buffs[paramId] * 0.25 + 1.0; // TODO : adjust buff rate
  }

  param(paramId: number): number {
    const value =
      this.paramBasePlus(paramId) *
      this.paramRate(paramId) *
      this.paramBuffRate(paramId);
    const maxValue = this.paramMax();
    const minValue = this.paramMin(paramId);
    return Math.round(value.clamp(minValue, maxValue));
  }

  xparam(xparamId: number): number {
    return this.traitsSum(Traits.XPARAM, xparamId);
  }

  sparam(sparamId: number): number {
    return this.traitsPi(Traits.SPARAM, sparamId);
  }

  elementRate(elementId: number): number {
    return this.traitsPi(Traits.ELEMENT_RATE, elementId);
  }

  debuffRate(paramId: number): number {
    return this.traitsPi(Traits.DEBUFF_RATE, paramId);
  }

  stateRate(stateId: number): number {
    return this.traitsPi(Traits.STATE_RATE, stateId);
  }

  stateResistSet(): number[] {
    return this.traitsSet(Traits.STATE_RESIST);
  }

  isStateResist(stateId: number): boolean {
    return this.stateResistSet().includes(stateId);
  }

  attackElements(): number[] {
    return this.traitsSet(Traits.ATTACK_ELEMENT);
  }

  attackStates(): number[] {
    return this.traitsSet(Traits.ATTACK_STATE);
  }

  attackStatesRate(stateId: number): number {
    return this.traitsSum(Traits.ATTACK_STATE, stateId);
  }

  attackSpeed(): number {
    return this.traitsSumAll(Traits.ATTACK_SPEED);
  }

  attackTimesAdd(): number {
    return Math.max(this.traitsSumAll(Traits.ATTACK_TIMES), 0);
  }

  attackSkillId(): number {
    const set = this.traitsSet(Traits.ATTACK_SKILL);
    return set.length > 0 ? Math.max(...set) : 1;
  }

  addedSkillType(): number[] {
    return this.traitsSet(Traits.STYPE_ADD);
  }

  isSkillTypeSealed(stypeId: number): boolean {
    return this.traitsSet(Traits.STYPE_SEAL).includes(stypeId);
  }

  addedSkills(): number[] {
    return this.traitsSet(Traits.SKILL_ADD);
  }

  isSkillSealed(skillId: number): boolean {
    return this.traitsSet(Traits.SKILL_SEAL).includes(skillId);
  }

  isEquipWtypeOk(wtypeId: number): boolean {
    return this.traitsSet(Traits.EQUIP_WTYPE).includes(wtypeId);
  }

  isEquipAtypeOk(atypeId: number): boolean {
    return this.traitsSet(Traits.EQUIP_ATYPE).includes(atypeId);
  }

  isEquipTypeLocked(etypeId: number): boolean {
    return this.traitsSet(Traits.EQUIP_LOCK).includes(etypeId);
  }

  isEquipTypeSealed(etypeId: number): boolean {
    return this.traitsSet(Traits.EQUIP_SEAL).includes(etypeId);
  }

  slotType(): number {
    const set = this.traitsSet(Traits.SLOT_TYPE);
    return set.length > 0 ? Math.max(...set) : 0;
  }

  isDualWield(): boolean {
    return this.slotType() === 1;
  }

  actionPlusSet(): number[] {
    return this.traits(Traits.ACTION_PLUS).map(
      trait => trait.value
    );
  }

  specialFlag(flagId: number): boolean {
    return this.traits(Traits.SPECIAL_FLAG).some(
      trait => trait.dataId === flagId
    );
  }

  collapseType(): number {
    const set = this.traitsSet(Traits.COLLAPSE_TYPE);
    return set.length > 0 ? Math.max(...set) : 0;
  }

  partyAbility(abilityId: number): boolean {
    return this.traits(Traits.PARTY_ABILITY).some(
      trait => trait.dataId === abilityId
    );
  }

  isAutoBattle(): boolean {
    return this.specialFlag(FlagId.AUTO_BATTLE);
  }

  isGuard(): boolean {
    return this.specialFlag(FlagId.GUARD) && this.canMove();
  }

  isSubstitute(): boolean {
    return (
      this.specialFlag(FlagId.SUBSTITUTE) && this.canMove()
    );
  }

  isPreserveTp(): boolean {
    return this.specialFlag(FlagId.PRESERVE_TP);
  }

  addParam(paramId: number, value: number) {
    this._paramPlus[paramId] += value;
    this.refresh();
  }

  setHp(hp: number) {
    this._hp = hp;
    this.refresh();
  }

  setMp(hp: number) {
    this._mp = hp;
    this.refresh();
  }

  setTp(hp: number) {
    this._tp = hp;
    this.refresh();
  }

  maxTp(): number {
    return 100;
  }

  refresh() {
    for (const stateId of this.stateResistSet()) {
      this.eraseState(stateId);
    }
    this._hp = this._hp.clamp(0, this.mhp);
    this._mp = this._mp.clamp(0, this.mmp);
    this._tp = this._tp.clamp(0, this.maxTp());
  }

  recoverAll() {
    this.clearStates();
    this._hp = this.mhp;
    this._mp = this.mmp;
  }

  hpRate(): number {
    return this.hp / this.mhp;
  }

  mpRate(): number {
    return this.mmp > 0 ? this.mp / this.mmp : 0;
  }

  tpRate(): number {
    return this.tp / this.maxTp();
  }

  hide() {
    this._hidden = true;
  }

  appear() {
    this._hidden = false;
  }

  isHidden(): boolean {
    return this._hidden;
  }

  isAppeared(): boolean {
    return !this.isHidden();
  }

  isDead(): boolean {
    return this.isAppeared() && this.isDeathStateAffected();
  }

  isAlive(): boolean {
    return this.isAppeared() && !this.isDeathStateAffected();
  }

  isDying(): boolean {
    return this.isAlive() && this._hp < this.mhp / 4; // TODO : maybe allow some rate to be edited via json
  }

  isRestricted(): boolean {
    return this.isAppeared() && this.restriction() > 0;
  }

  canInput(): boolean {
    return this.isAppeared() && this.isActor() &&
      !this.isRestricted() && !this.isAutoBattle();
  }

  canMove(): boolean {
    return this.isAppeared() && this.restriction() < 4;
  }

  isConfused(): boolean {
    return (
      this.isAppeared() && this.restriction() >= 1 && this.restriction() <= 3
    );
  }

  confusionLevel(): number {
    return this.isConfused() ? this.restriction() : 0;
  }

  isActor(): boolean {
    return false;
  }

  isEnemy(): boolean {
    return false;
  }

  sortStates() {
    this._states.sort((a, b) => {
      const p1 = $dataStates[a].priority;
      const p2 = $dataStates[b].priority;
      if (p1 !== p2) {
        return p2 - p1;
      }
      return a - b;
    });
  }

  restriction(): number {
    const restrictions = this.states().map(state => state.restriction);
    return Math.max(0, ...restrictions);
  }

  addNewState(stateId: number) {
    if (stateId === this.deathStateId()) {
      this.die();
    }
    const restricted = this.isRestricted();
    this._states.push(stateId);
    this.sortStates();
    if (!restricted && this.isRestricted()) {
      this.onRestrict();
    }
  }

  onRestrict() {
    // for other classes
  }

  mostImportantStateText(): string {
    for (const state of this.states()) {
      if (state.message3) {
        return state.message3;
      }
    }
    return '';
  }

  stateMotionIndex(): number {
    const states = this.states();
    if (states.length > 0) {
      return states[0].motion;
    } else {
      return 0;
    }
  }

  stateOverlayIndex(): number {
    const states = this.states();
    if (states.length > 0) {
      return states[0].overlay;
    } else {
      return 0;
    }
  }

  isSkillWtypeOk(_skill: DataSkill): boolean {
    return true;
  }

  skillMpCost(skill: DataSkill): number{
    return Math.floor(skill.mpCost * this.mcr);
  }

  skillTpCost(skill: DataSkill): number{
    return skill.tpCost;
  }

  canPaySkillCost(skill: DataSkill): boolean {
    return (
      this._tp >= this.skillTpCost(skill) &&
      this._mp >= this.skillMpCost(skill)
    );
  }

  paySkillCost(skill: DataSkill) {
    this._mp -= this.skillMpCost(skill);
    this._tp -= this.skillTpCost(skill);
  }

  isOccasionOk(item: DataItem) : boolean {
    if ($gameParty.inBattle()) {
      return item.occasion === 0 || item.occasion === 1;
    } else {
      return item.occasion === 0 || item.occasion === 2;
    }
  }

  meetsUsableItemConditions(item: DataItem) : boolean {
    return this.canMove() && this.isOccasionOk(item);
  }

  meetsSkillConditions(skill: DataSkill): boolean {
    return (
      this.meetsUsableItemConditions(skill) &&
      this.isSkillWtypeOk(skill) &&
      this.canPaySkillCost(skill) &&
      !this.isSkillSealed(skill.id) &&
      !this.isSkillTypeSealed(skill.stypeId)
    );
  }
}
