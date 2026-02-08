import { IContractualClass } from '../core/interfaces';

export class Game_BattlerBase implements IContractualClass {

  static readonly TRAIT_ELEMENT_RATE = 11;
  static readonly TRAIT_DEBUFF_RATE = 12;
  static readonly TRAIT_STATE_RATE = 13;
  static readonly TRAIT_STATE_RESIST = 14;
  static readonly TRAIT_PARAM = 21;
  static readonly TRAIT_XPARAM = 22;
  static readonly TRAIT_SPARAM = 23;
  static readonly TRAIT_ATTACK_ELEMENT = 31;
  static readonly TRAIT_ATTACK_STATE = 32;
  static readonly TRAIT_ATTACK_SPEED = 33;
  static readonly TRAIT_ATTACK_TIMES = 34;
  static readonly TRAIT_ATTACK_SKILL = 35;
  static readonly TRAIT_STYPE_ADD = 41;
  static readonly TRAIT_STYPE_SEAL = 42;
  static readonly TRAIT_SKILL_ADD = 43;
  static readonly TRAIT_SKILL_SEAL = 44;
  static readonly TRAIT_EQUIP_WTYPE = 51;
  static readonly TRAIT_EQUIP_ATYPE = 52;
  static readonly TRAIT_EQUIP_LOCK = 53;
  static readonly TRAIT_EQUIP_SEAL = 54;
  static readonly TRAIT_SLOT_TYPE = 55;
  static readonly TRAIT_ACTION_PLUS = 61;
  static readonly TRAIT_SPECIAL_FLAG = 62;
  static readonly TRAIT_COLLAPSE_TYPE = 63;
  static readonly TRAIT_PARTY_ABILITY = 64;
  static readonly FLAG_ID_AUTO_BATTLE = 0;
  static readonly FLAG_ID_GUARD = 1;
  static readonly FLAG_ID_SUBSTITUTE = 2;
  static readonly FLAG_ID_PRESERVE_TP = 3;
  static readonly ICON_BUFF_START = 32;
  static readonly ICON_DEBUFF_START = 48;

  protected _hp: number;
  protected _mp: number;
  protected _tp: number;
  protected _hidden: boolean;
  protected _paramPlus: number[];
  protected _states: number[];
  protected _stateTurns: Record<number, number>;
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
  mhp(): number {
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
    this._stateTurns = {};
  }

  eraseState(stateId: number) {
    this._states.remove(stateId);
    delete this._stateTurns[stateId];
  }

  isStateAffected(stateId: number): boolean {
    return this._states.includes(stateId);
  }

  isDeathStateAffected(): boolean {
    return this.isStateAffected(this.deathStateId());
  }

  deathStateId(): number {
    return 1;
  }

  resetStateCounts(stateId: number) {
    const state = $dataStates[stateId];
    const variance = 1 + Math.max(state.maxTurns - state.minTurns, 0);
    this._stateTurns[stateId] = state.minTurns + Math.randomInt(variance);
  }

  isStateExpired(stateId: number): boolean {
    return this._stateTurns[stateId] <= 0;
  }

  updateStateTurns() {
    for (const stateId of this._states) {
      if (this._stateTurns[stateId] > 0) {
        this._stateTurns[stateId]--;
      }
    }
  }

  clearBuffs() {
    this._buffs = [0, 0, 0, 0, 0, 0, 0, 0];
    this._buffTurns = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  eraseBuff(paramId: number) {
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
    return this._buffs[paramId] > 0;
  }

  isDebuffAffected(paramId: number): boolean {
    return this._buffs[paramId] < 0;
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

  fullRevive() {
    this._hp = this.mhp();
  }

  states(): DataStates[] {
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
      return Game_BattlerBase.ICON_BUFF_START + (buffLevel - 1) * 8 + paramId;
    } else if (buffLevel < 0) {
      return (
        Game_BattlerBase.ICON_DEBUFF_START + (-buffLevel - 1) * 8 + paramId
      );
    } else {
      return 0;
    }
  }

  allIcons(): number[] {
    return this.stateIcons().concat(this.buffIcons());
  }

  traitObjects(): DataStates[] {
    return this.states();
  }

  allTraits() {
    return this.traitObjects().reduce((r, obj) => r.concat(obj.traits), []);
  }

  traits(code: number) {
    return this.allTraits().filter(trait => trait.code === code);
  }

  traitsWithId(code: number, id: number) {
    return this.allTraits().filter(
      trait => trait.code === code && trait.dataId === id
    );
  }

  traitsPi(code: number, id: number) {
    return this.traitsWithId(code, id).reduce((r, trait) => r * trait.value, 1);
  };

  traitsSum(code: number, id: number) {
    return this.traitsWithId(code, id).reduce((r, trait) => r + trait.value, 0);
  };

  traitsSumAll(code: number) {
    return this.traits(code).reduce((r, trait) => r + trait.value, 0);
  };

  traitsSet(code: number) {
    return this.traits(code).reduce((r, trait) => r.concat(trait.dataId), []);
  };

  paramBase(): number {
    return 0;
  }

  paramPlus(paramId: number): number {
    return this._paramPlus[paramId];
  }

  paramBasePlus(paramId: number): number {
    return Math.max(0, this.paramBase() + this.paramPlus(paramId));
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
    return this.traitsPi(Game_BattlerBase.TRAIT_PARAM, paramId);
  }

  paramBuffRate(paramId: number): number {
    return this._buffs[paramId] * 0.25 + 1.0;
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
    return this.traitsSum(Game_BattlerBase.TRAIT_XPARAM, xparamId);
  }

  sparam(sparamId: number): number {
    return this.traitsPi(Game_BattlerBase.TRAIT_SPARAM, sparamId);
  }

  elementRate(elementId: number): number {
    return this.traitsPi(Game_BattlerBase.TRAIT_ELEMENT_RATE, elementId);
  }

  debuffRate(paramId: number): number {
    return this.traitsPi(Game_BattlerBase.TRAIT_DEBUFF_RATE, paramId);
  }

  stateRate(stateId: number): number {
    return this.traitsPi(Game_BattlerBase.TRAIT_STATE_RATE, stateId);
  }

  stateResistSet(): number[] {
    return this.traitsSet(Game_BattlerBase.TRAIT_STATE_RESIST);
  }

  isStateResist(stateId: number): boolean {
    return this.stateResistSet().includes(stateId);
  }

}
