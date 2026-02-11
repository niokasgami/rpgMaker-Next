import { IContractualClass } from '../core/interfaces';
import { $dataStates } from '@managers';
import { DataState } from '@data/DataState.ts';


export enum Trait {
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
    this._stateTurns = new Map<number,number>();
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

  resetStateCounts(stateId: number){
    const state = $dataStates[stateId];
    const variance = 1 + Math.max(state.maxTurns - state.minTurns, 0);
    this._stateTurns.set(stateId, state.minTurns + Math.randomInt(variance));
  }
}
