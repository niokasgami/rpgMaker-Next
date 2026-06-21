import { IContractualClass } from '../core/interfaces';
import { $dataSkills, $dataStates, $gameParty, DataManager } from '@managers';
import { DataState } from '@data/DataState.ts';
import { ItemDamage, OccasionType, TraitData } from '@data/RPG';
import { DataSkill } from '@data/DataSkill.ts';
import { DataItem } from '@data/DataItem.ts';
import { DataUsableItem } from '@data/DataUsableItem.ts';
import { DataEquipable } from '@data/DataEquipable.ts';
import { DataWeapon } from '@data/DataWeapon.ts';
import { DataArmor } from '@data/DataArmor.ts';
import { GameActors } from '@objects/GameActors.ts';
import { GameActor } from '@objects/GameActor.ts';
import { GameEnemy } from '@objects/GameEnemy.ts';


export interface WithTraits {
  traits: TraitData[];
}
/**
 * Enum representing all trait codes used by RPG Maker MZ.
 * Traits are passive effects applied to battlers via states, equipment, classes, etc.
 */
export enum Traits {
  /** Element damage rate modifier (e.g. fire resistance) */
  ELEMENT_RATE = 11,
  /** Debuff success rate modifier */
  DEBUFF_RATE = 12,
  /** State (status effect) success rate modifier */
  STATE_RATE = 13,
  /** State immunity - battler is immune to these states */
  STATE_RESIST = 14,
  /** Basic parameter (ATK, DEF, etc.) rate modifier */
  PARAM = 21,
  /** Extra parameter (HIT, EVA, etc.) additive modifier */
  XPARAM = 22,
  /** Special parameter (TGR, GRD, etc.) rate modifier */
  SPARAM = 23,
  /** Adds an attack element to normal attacks */
  ATTACK_ELEMENT = 31,
  /** Adds a state to inflict on normal attacks */
  ATTACK_STATE = 32,
  /** Modifies attack speed (agility) */
  ATTACK_SPEED = 33,
  /** Adds extra attack times */
  ATTACK_TIMES = 34,
  /** Overrides the skill used for normal attacks */
  ATTACK_SKILL = 35,
  /** Adds a skill type to the battler's usable skill types */
  STYPE_ADD = 41,
  /** Seals a skill type, preventing its use */
  STYPE_SEAL = 42,
  /** Adds a specific skill to the battler's skill list */
  SKILL_ADD = 43,
  /** Seals a specific skill, preventing its use */
  SKILL_SEAL = 44,
  /** Allows equipping a specific weapon type */
  EQUIP_WTYPE = 51,
  /** Allows equipping a specific armor type */
  EQUIP_ATYPE = 52,
  /** Locks an equipment slot, preventing changes */
  EQUIP_LOCK = 53,
  /** Seals an equipment slot, preventing equipping */
  EQUIP_SEAL = 54,
  /** Determines the equipment slot type (e.g. dual wield) */
  SLOT_TYPE = 55,
  /** Adds a chance for an extra action */
  ACTION_PLUS = 61,
  /** Special flags (auto battle, guard, substitute, preserve TP) */
  SPECIAL_FLAG = 62,
  /** Determines the battler's collapse animation type */
  COLLAPSE_TYPE = 63,
  /** Grants a party-wide passive ability */
  PARTY_ABILITY = 64,
}

/**
 * Enum representing special flag IDs used with the {@link Traits.SPECIAL_FLAG} trait.
 */
export enum FlagId {
  AUTO_BATTLE = 0,
  GUARD = 1,
  SUBSTITUTE = 2,
  PRESERVE_TP = 3,
}

/**
 * Enum representing the starting icon indices for buff and debuff icons.
 */
export enum IconStart {
  BUFF = 32,
  DEBUFF = 48,
}

export enum CollapseType {
  NORMAL = 0,
  BOSS = 1,
  INSTANT = 2,
  NO_DISAPPEAR = 3
}
/**
 * The base class for all battlers (actors and enemies) in the game.
 * Handles stats, states, buffs, traits, and combat conditions.
 *
 * @implements {IContractualClass}
 */
export abstract class GameBattlerBase implements IContractualClass {

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

  constructor(...args: any[]) {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this.initMembers();
  }

  /**
   * Initialize all member variables to their default values.
   * Called during construction and should be overridden by subclasses
   * to initialize additional properties.
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

  /**
   * Resets all flat parameter bonuses to zero.
   */
  clearParamPlus() {
    this._paramPlus = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  /**
   * Clears all active states and their turn counters.
   */
  clearStates() {
    this._states = [];
    this._stateTurns = new Map<number, number>();
  }

  /**
   * Removes a specific state from the battler.
   * @param stateId - The ID of the state to remove.
   */
  eraseState(stateId: number) {
    this._states.remove(stateId);
  }

  /**
   * Checks whether the battler is currently affected by a specific state.
   * @param stateId - The ID of the state to check.
   * @returns `true` if the battler has the state active.
   */
  isStateAffected(stateId: number): boolean {
    return this._states.includes(stateId);
  }

  /**
   * Checks whether the battler is currently in the death state.
   * @returns `true` if the death state is active.
   */
  isDeathStateAffected(): boolean {
    return this._states.includes(this.deathStateId());
  }

  /**
   * Returns the ID of the death state.
   * @returns The death state ID (always 1).
   */
  deathStateId(): number {
    return 1;
  }

  /**
   * Resets the turn counter for a state, randomizing within its min/max turn range.
   * @param stateId - The ID of the state to reset.
   */
  resetStateCounts(stateId: number) {
    const state = $dataStates[stateId];
    const variance = 1 + Math.max(state.maxTurns - state.minTurns, 0);
    this._stateTurns.set(stateId, state.minTurns + Math.randomInt(variance));
  }

  /**
   * Checks whether a state's turn counter has reached zero (expired).
   * @param stateId - The ID of the state to check.
   * @returns `true` if the state has expired.
   */
  isStateExpired(stateId: number): boolean {
    return this._stateTurns.get(stateId) === 0;
  }

  /**
   * Decrements the turn counter for all active states by one.
   * States with 0 turns remaining are not decremented further.
   */
  updateStateTurns(): void {
    for (const stateId of this._states) {
      const turns = this._stateTurns.get(stateId);
      if (turns !== undefined && turns > 0) {
        this._stateTurns.set(stateId, turns - 1);
      }
    }
  }

  /**
   * Resets all buff levels and their turn counters to zero.
   */
  clearBuffs() {
    this._buffs = [0, 0, 0, 0, 0, 0, 0, 0];
    this._buffTurns = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  /**
   * Removes the buff or debuff for a specific parameter.
   * @param paramId - The parameter index (0-7).
   */
  eraseBuff(paramId: number) {
    this._buffs[paramId] = 0;
    this._buffTurns[paramId] = 0;
  }

  /**
   * Returns the number of buffable parameters.
   * @returns The length of the buffs array.
   */
  buffLength(): number {
    return this._buffs.length;
  }

  /**
   * Returns the current buff level for a parameter.
   * Positive values are buffs, negative values are debuffs.
   * @param paramId - The parameter index (0-7).
   * @returns The buff level (-2 to 2).
   */
  buff(paramId: number): number {
    return this._buffs[paramId];
  }

  /**
   * Checks whether a parameter is currently buffed (level > 0).
   * @param paramId - The parameter index (0-7).
   * @returns `true` if the parameter has a buff applied.
   */
  isBuffAffected(paramId: number): boolean {
    return this._buffs[paramId] === 0;
  }

  /**
   * Checks whether a parameter is currently debuffed
   * @param paramId - the parameter index (0,7)
   * @returns `true` if the parameter has a buff applied.
   */
  isDebuffAffected(paramId: number): boolean {
    return this._buffs[paramId] < 0;
  }

  /**
   * Checks whether a parameter has any buff or debuff applied.
   * @param paramId - The parameter index (0-7).
   * @returns `true` if the parameter has any buff or debuff.
   */
  isBuffOrDebuffAffected(paramId: number): boolean {
    return this._buffs[paramId] !== 0;
  }

  /**
   * Checks whether a parameter is at maximum buff level (2).
   * @param paramId - The parameter index (0-7).
   * @returns `true` if at maximum buff level.
   */
  isMaxBuffAffected(paramId: number): boolean {
    return this._buffs[paramId] === 2;
  }

  /**
   * Checks whether a parameter is at maximum debuff level (-2).
   * @param paramId - The parameter index (0-7).
   * @returns `true` if at maximum debuff level.
   */
  isMaxDebuffAffected(paramId: number): boolean {
    return this._buffs[paramId] === -2;
  }

  /**
   * Increases the buff level of a parameter by 1, up to the maximum of 2.
   * @param paramId - The parameter index (0-7).
   */
  increaseBuff(paramId: number) {
    if (!this.isMaxBuffAffected(paramId)) {
      this._buffs[paramId]++;
    }
  }

  /**
   * Decreases the buff level of a parameter by 1, down to the minimum of -2.
   * @param paramId - The parameter index (0-7).
   */
  decreaseBuff(paramId: number) {
    if (!this.isMaxDebuffAffected(paramId)) {
      this._buffs[paramId]--;
    }
  }

  /**
   * Sets the buff turn counter for a parameter if the new value is higher.
   * This prevents shorter buffs from overwriting longer ones.
   * @param paramId - The parameter index (0-7).
   * @param turns - The number of turns to set.
   */
  overwriteBuffTurns(paramId: number, turns: number) {
    if (this._buffTurns[paramId] < turns) {
      this._buffTurns[paramId] = turns;
    }
  }

  /**
   * Checks whether a buff's turn counter has reached zero (expired).
   * @param paramId - The parameter index (0-7).
   * @returns `true` if the buff has expired.
   */
  isBuffExpired(paramId: number): boolean {
    return this._buffTurns[paramId] === 0;
  }

  /**
   * Decrements the turn counter for all active buffs by one.
   * Buffs with 0 turns remaining are not decremented further.
   */
  updateBuffTurns() {
    for (let i = 0; i < this._buffTurns.length; i++) {
      if (this._buffTurns[i] > 0) {
        this._buffTurns[i]--;
      }
    }
  }

  /**
   * Kills the battler by setting HP to 0 and clearing all states and buffs.
   */
  die() {
    this._hp = 0;
    this.clearStates();
    this.clearBuffs();
  }

  /**
   * Revives the battler with 1 HP if they are currently dead (HP === 0).
   */
  revive() {
    if (this._hp === 0) {
      this._hp = 1;
    }
  }

  /**
   * Returns all active states as their full data objects.
   * @returns Array of {@link DataState} objects for all active states.
   */
  states(): DataState[] {
    return this._states.map(id => $dataStates[id]);
  }

  /**
   * Returns the icon indices for all active states that have an icon.
   * @returns Array of icon indices (filters out states with iconIndex of 0).
   */
  stateIcons(): number[] {
    return this.states()
      .map(state => state.iconIndex)
      .filter(iconIndex => iconIndex > 0);
  }

  /**
   * Returns the icon indices for all active buffs and debuffs.
   * @returns Array of icon indices for all non-zero buff levels.
   */
  buffIcons(): number[] {
    const icons = [];
    for (let i = 0; i < this._buffs.length; i++) {
      if (this._buffs[i] !== 0) {
        icons.push(this.buffIconIndex(this._buffs[i], i));
      }
    }
    return icons;
  }

  /**
   * Calculates the icon index for a given buff level and parameter.
   * @param buffLevel - The buff level (positive for buff, negative for debuff).
   * @param paramId - The parameter index (0-7).
   * @returns The icon index, or 0 if buff level is 0.
   */
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

  /**
   * Returns the combined icon indices for all states and buffs/debuffs.
   * @returns Concatenated array of state icons and buff icons.
   */
  allIcons(): number[] {
    return this.stateIcons().concat(this.buffIcons());
  }

  /**
   * Returns the objects that contribute traits to this battler.
   * In the base class, only active states are trait sources.
   * Overridden by subclasses (e.g. actors also include class, equipment, etc.).
   * @returns Array of {@link DataState} objects.
   */
  traitObjects(): WithTraits[] {
    return this.states();
  }

  /**
   * return all the traits as an array.
   */
  allTraits(): TraitData[] {
    return this.traitObjects().flatMap(obj => obj.traits);
  }

  /**
   * Returns all traits matching a specific trait code.
   * @param code - The trait code to filter by (see {@link Traits}).
   * @returns Array of matching {@link TraitData} objects.
   */
  traits(code: number): TraitData[] {
    return this.allTraits().filter(trait => trait.code === code);
  }

  /**
   * Returns all traits matching a specific trait code and data ID.
   * @param code - The trait code to filter by (see {@link Traits}).
   * @param id - The data ID to filter by.
   * @returns Array of matching {@link TraitData} objects.
   */
  traitsWithId(code: number, id: number): TraitData[] {
    return this.allTraits().filter(
      trait => trait.code === code && trait.dataId === id
    );
  }

  /**
   * Calculates the product of all trait values matching a code and ID.
   * Used for multiplicative modifiers like element rates.
   * @param code - The trait code (see {@link Traits}).
   * @param id - The data ID.
   * @returns The product of all matching trait values (1 if none).
   */
  traitsPi(code: number, id: number): number {
    return this.traitsWithId(code, id).reduce((r, trait) => r * trait.value, 1);
  }

  /**
   * Calculates the sum of all trait values matching a code and ID.
   * Used for additive modifiers like extra parameters.
   * @param code - The trait code (see {@link Traits}).
   * @param id - The data ID.
   * @returns The sum of all matching trait values (0 if none).
   */
  traitsSum(code: number, id: number): number {
    return this.traitsWithId(code, id).reduce((r, trait) => r + trait.value, 0);
  }

  /**
   * Calculates the sum of all trait values matching a code, across all data IDs.
   * @param code - The trait code (see {@link Traits}).
   * @returns The sum of all matching trait values (0 if none).
   */
  traitsSumAll(code: number): number {
    return this.traits(code).reduce((r, trait) => r + trait.value, 0);
  }

  /**
   * Returns the unique set of data IDs from all traits matching a code.
   * @param code - The trait code (see {@link Traits}).
   * @returns Array of unique data IDs.
   * @todo Test if Set deduplication is needed.
   * Can multiple equipment grant same trait dataId?
   * Do stacked states create duplicate trait entries?
   * If duplicates never occur, simplify to: this.traits(code).map(t => t.dataId)
   */
  traitsSet(code: number): number[] {
    // TODO: Test if Set deduplication is needed
    // - Can multiple equipment grant same trait dataId?
    // - Do stacked states create duplicate trait entries?
    // If duplicates never occur, simplify to: this.traits(code).map(t => t.dataId)
    return [...new Set(this.traits(code).map(trait => trait.dataId))];
  }

  /**
   * Returns the base value of a parameter before any modifications.
   * Always returns 0 in the base class; overridden by subclasses.
   * @param _paramId - The parameter index (0-7).
   * @returns The base parameter value (0 by default).
   */
  paramBase(_paramId: number): number {
    return 0;
  }

  /**
   * Returns the flat bonus added to a parameter via {@link addParam}.
   * @param paramId - The parameter index (0-7).
   * @returns The flat parameter bonus.
   */
  paramPlus(paramId: number): number {
    return this._paramPlus[paramId];
  }

  /**
   * Returns the sum of the base parameter value and flat bonus, clamped to a minimum of 0.
   * @param paramId - The parameter index (0-7).
   * @returns The base parameter value plus bonuses, minimum 0.
   */
  paramBasePlus(paramId: number): number {
    return Math.max(0, this.paramBase(paramId) + this.paramPlus(paramId));
  }

  /**
   * Returns the minimum allowed value for a parameter.
   * MHP (param 0) has a minimum of 1; all others default to 0.
   * @param paramId - The parameter index (0-7).
   * @returns The minimum parameter value.
   */
  paramMin(paramId: number): number {
    if (paramId === 0) {
      return 1; // MHP
    } else {
      return 0;
    }
  }

  /**
   * Returns the maximum allowed value for any parameter.
   * @returns `Infinity` by default (no cap).
   */
  paramMax(): number {
    return Infinity;
  }

  /**
   * Returns the multiplicative trait rate for a parameter.
   * @param paramId - The parameter index (0-7).
   * @returns The product of all {@link Traits.PARAM} traits for this parameter.
   */
  paramRate(paramId: number): number {
    return this.traitsPi(Traits.PARAM, paramId);
  }

  /**
   * Returns the buff/debuff multiplier for a parameter.
   * Each buff level adds 25% (e.g. level 2 = 1.5x, level -1 = 0.75x).
   * @param paramId - The parameter index (0-7).
   * @returns The buff rate multiplier.
   * @todo Adjust buff rate if needed.
   */
  paramBuffRate(paramId: number): number {
    return this._buffs[paramId] * 0.25 + 1.0; // TODO : adjust buff rate
  }

  /**
   * Calculates the final value of a basic parameter after all modifiers.
   * Formula: `(base + plus) * traitRate * buffRate`, clamped to min/max.
   * @param paramId - The parameter index (0-7).
   * @returns The final rounded parameter value.
   */
  param(paramId: number): number {
    const value =
      this.paramBasePlus(paramId) *
      this.paramRate(paramId) *
      this.paramBuffRate(paramId);
    const maxValue = this.paramMax();
    const minValue = this.paramMin(paramId);
    return Math.round(value.clamp(minValue, maxValue));
  }

  /**
   * Returns the value of an extra parameter (xparam) by summing all matching traits.
   * @param xparamId - The extra parameter index (0-9).
   * @returns The summed extra parameter value.
   */
  xparam(xparamId: number): number {
    return this.traitsSum(Traits.XPARAM, xparamId);
  }

  /**
   * Returns the value of a special parameter (sparam) by multiplying all matching traits.
   * @param sparamId - The special parameter index (0-9).
   * @returns The product of all matching special parameter traits.
   */
  sparam(sparamId: number): number {
    return this.traitsPi(Traits.SPARAM, sparamId);
  }

  /**
   * Returns the damage rate for a specific element.
   * @param elementId - The element ID to check.
   * @returns The multiplicative element rate (1.0 = normal damage).
   */
  elementRate(elementId: number): number {
    return this.traitsPi(Traits.ELEMENT_RATE, elementId);
  }

  /**
   * Returns the debuff success rate for a specific parameter.
   * @param paramId - The parameter index (0-7).
   * @returns The multiplicative debuff rate.
   */
  debuffRate(paramId: number): number {
    return this.traitsPi(Traits.DEBUFF_RATE, paramId);
  }

  /**
   * Returns the state (status effect) success rate for a specific state.
   * @param stateId - The state ID to check.
   * @returns The multiplicative state rate.
   */
  stateRate(stateId: number): number {
    return this.traitsPi(Traits.STATE_RATE, stateId);
  }

  /**
   * Returns the set of state IDs the battler is immune to.
   * @returns Array of state IDs the battler resists.
   */
  stateResistSet(): number[] {
    return this.traitsSet(Traits.STATE_RESIST);
  }

  /**
   * Checks whether the battler is immune to a specific state.
   * @param stateId - The state ID to check.
   * @returns `true` if the battler resists the state.
   */
  isStateResist(stateId: number): boolean {
    return this.stateResistSet().includes(stateId);
  }

  /**
   * Returns the set of element IDs added to normal attacks.
   * @returns Array of attack element IDs.
   */
  attackElements(): number[] {
    return this.traitsSet(Traits.ATTACK_ELEMENT);
  }

  /**
   * Returns the set of state IDs that can be inflicted by normal attacks.
   * @returns Array of attack state IDs.
   */
  attackStates(): number[] {
    return this.traitsSet(Traits.ATTACK_STATE);
  }

  /**
   * Returns the rate at which a specific state is applied on normal attacks.
   * @param stateId - The state ID to check.
   * @returns The summed attack state rate.
   */
  attackStatesRate(stateId: number): number {
    return this.traitsSum(Traits.ATTACK_STATE, stateId);
  }

  /**
   * Returns the total attack speed bonus from traits.
   * @returns The summed attack speed modifier.
   */
  attackSpeed(): number {
    return this.traitsSumAll(Traits.ATTACK_SPEED);
  }

  /**
   * Returns the total number of additional attacks per action (minimum 0).
   * @returns The summed attack times bonus, clamped to 0.
   */
  attackTimesAdd(): number {
    return Math.max(this.traitsSumAll(Traits.ATTACK_TIMES), 0);
  }

  /**
   * Returns the skill ID used for normal attacks.
   * Uses the highest attack skill ID from traits, defaulting to skill 1.
   * @returns The attack skill ID.
   */
  attackSkillId(): number {
    const set = this.traitsSet(Traits.ATTACK_SKILL);
    return set.length > 0 ? Math.max(...set) : 1;
  }


  /**
   * Returns the set of skill type IDs added to the battler's usable skill types.
   * @returns Array of added skill type IDs.
   */
  addedSkillTypes(): number[] {
    return this.traitsSet(Traits.STYPE_ADD);
  }

  /**
   * Checks whether a skill type is sealed (cannot be used).
   * @param stypeId - The skill type ID to check.
   * @returns `true` if the skill type is sealed.
   */
  isSkillTypeSealed(stypeId: number): boolean {
    return this.traitsSet(Traits.STYPE_SEAL).includes(stypeId);
  }

  /**
   * Returns the set of skill type IDs added to the battler's usable skill types.
   * @returns Array of added skill type IDs.
   */
  addedSkills(): number[] {
    return this.traitsSet(Traits.SKILL_ADD);
  }

  /**
   * Checks whether a specific skill is sealed (cannot be used).
   * @param skillId - The skill ID to check.
   * @returns `true` if the skill is sealed.
   */
  isSkillSealed(skillId: number): boolean {
    return this.traitsSet(Traits.SKILL_SEAL).includes(skillId);
  }

  /**
   * Checks whether the battler can equip a specific weapon type.
   * @param wtypeId - The weapon type ID to check.
   * @returns `true` if the weapon type is allowed.
   */
  isEquipWtypeOk(wtypeId: number): boolean {
    return this.traitsSet(Traits.EQUIP_WTYPE).includes(wtypeId);
  }

  /**
   * Checks whether the battler can equip a specific armor type.
   * @param atypeId - The armor type ID to check.
   * @returns `true` if the armor type is allowed.
   */
  isEquipAtypeOk(atypeId: number): boolean {
    return this.traitsSet(Traits.EQUIP_ATYPE).includes(atypeId);
  }

  /**
   * Checks whether an equipment slot type is locked (cannot be changed).
   * @param etypeId - The equipment type ID to check.
   * @returns `true` if the slot is locked.
   */
  isEquipTypeLocked(etypeId: number): boolean {
    return this.traitsSet(Traits.EQUIP_LOCK).includes(etypeId);
  }

  /**
   * Checks whether an equipment slot type is sealed (cannot be equipped).
   * @param etypeId - The equipment type ID to check.
   * @returns `true` if the slot is sealed.
   */
  isEquipTypeSealed(etypeId: number): boolean {
    return this.traitsSet(Traits.EQUIP_SEAL).includes(etypeId);
  }

  /**
   * Returns the battler's equipment slot type.
   * Uses the highest slot type value from traits, defaulting to 0 (normal).
   * @returns The slot type (0 = normal, 1 = dual wield).
   */
  slotType(): number {
    const set = this.traitsSet(Traits.SLOT_TYPE);
    return set.length > 0 ? Math.max(...set) : 0;
  }

  /**
   * Checks whether the battler is in dual wield mode (slot type 1).
   * @returns `true` if dual wielding.
   */
  isDualWield(): boolean {
    return this.slotType() === 1;
  }

  /**
   * Returns the set of extra action chance values from traits.
   * Used to determine the probability of performing additional actions.
   * @returns Array of action plus values.
   */
  actionPlusSet(): number[] {
    return this.traits(Traits.ACTION_PLUS).map(
      trait => trait.value
    );
  }

  /**
   * Checks whether a special flag is active on the battler.
   * @param flagId - The flag ID to check (see {@link FlagId}).
   * @returns `true` if the flag is active.
   */
  specialFlag(flagId: number): boolean {
    return this.traits(Traits.SPECIAL_FLAG).some(
      trait => trait.dataId === flagId
    );
  }

  /**
   * Returns the battler's collapse (death) animation type.
   * Uses the highest collapse type value from traits, defaulting to 0.
   * @returns The collapse type ID.
   */
  collapseType(): number {
    const set = this.traitsSet(Traits.COLLAPSE_TYPE);
    return set.length > 0 ? Math.max(...set) : 0;
  }

  /**
   * Checks whether the battler has a specific party ability active.
   * @param abilityId - The party ability ID to check.
   * @returns `true` if the party ability is active.
   */
  partyAbility(abilityId: number): boolean {
    return this.traits(Traits.PARTY_ABILITY).some(
      trait => trait.dataId === abilityId
    );
  }

  /**
   * Checks whether the battler is in auto-battle mode.
   * @returns `true` if the auto-battle flag is active.
   */
  isAutoBattle(): boolean {
    return this.specialFlag(FlagId.AUTO_BATTLE);
  }

  /**
   * Checks whether the battler is currently guarding.
   * Requires both the guard flag and the ability to move.
   * @returns `true` if the battler is guarding.
   */
  isGuard(): boolean {
    return this.specialFlag(FlagId.GUARD) && this.canMove();
  }

  /**
   * Checks whether the battler can substitute for low-HP allies.
   * Requires both the substitute flag and the ability to move.
   * @returns `true` if the battler can substitute.
   */
  isSubstitute(): boolean {
    return (
      this.specialFlag(FlagId.SUBSTITUTE) && this.canMove()
    );
  }

  /**
   * Checks whether the battler retains TP between battles.
   * @returns `true` if the preserve TP flag is active.
   */
  isPreserveTp(): boolean {
    return this.specialFlag(FlagId.PRESERVE_TP);
  }

  /**
   * Adds a flat bonus to a parameter and refreshes the battler.
   * @param paramId - The parameter index (0-7).
   * @param value - The value to add to the parameter bonus.
   */
  addParam(paramId: number, value: number) {
    this._paramPlus[paramId] += value;
    this.refresh();
  }

  /**
   * Sets the battler's HP and triggers a refresh.
   * @param hp - The new HP value.
   */
  setHp(hp: number) {
    this._hp = hp;
    this.refresh();
  }

  /**
   * Sets the battler's MP and triggers a refresh.
   * @param hp - The new MP value.
   */
  setMp(hp: number) {
    this._mp = hp;
    this.refresh();
  }

  /**
   * Sets the battler's TP and triggers a refresh.
   * @param hp - The new TP value.
   */
  setTp(hp: number) {
    this._tp = hp;
    this.refresh();
  }

  /**
   * Returns the maximum TP value.
   * @returns Always 100 in the base class.
   */
  maxTp(): number {
    return 100;
  }

  /**
   * Refreshes the battler's stats, removing resisted states and clamping HP/MP/TP.
   */
  refresh() {
    for (const stateId of this.stateResistSet()) {
      this.eraseState(stateId);
    }
    this._hp = this._hp.clamp(0, this.mhp);
    this._mp = this._mp.clamp(0, this.mmp);
    this._tp = this._tp.clamp(0, this.maxTp());
  }

  /**
   * Fully recovers the battler by clearing all states and restoring HP/MP to maximum.
   */
  recoverAll() {
    this.clearStates();
    this._hp = this.mhp;
    this._mp = this.mmp;
  }

  /**
   * Returns the battler's current HP as a ratio of max HP.
   * @returns A value between 0.0 and 1.0.
   */
  hpRate(): number {
    return this.hp / this.mhp;
  }

  /**
   * Returns the battler's current MP as a ratio of max MP.
   * Returns 0 if max MP is 0 to avoid division by zero.
   * @returns A value between 0.0 and 1.0.
   */
  mpRate(): number {
    return this.mmp > 0 ? this.mp / this.mmp : 0;
  }

  /**
   * Returns the battler's current TP as a ratio of max TP.
   * @returns A value between 0.0 and 1.0.
   */
  tpRate(): number {
    return this.tp / this.maxTp();
  }

  /**
   * Hides the battler, removing them from battle display and targeting.
   */
  hide() {
    this._hidden = true;
  }

  /**
   * Makes the battler visible and targetable again.
   */
  appear() {
    this._hidden = false;
  }

  /**
   * Checks whether the battler is currently hidden.
   * @returns `true` if the battler is hidden.
   */
  isHidden(): boolean {
    return this._hidden;
  }

  /**
   * Checks whether the battler is currently visible (not hidden).
   * @returns `true` if the battler is visible.
   */
  isAppeared(): boolean {
    return !this.isHidden();
  }

  /**
   * Checks whether the battler is dead (visible and in the death state).
   * @returns `true` if the battler is dead.
   */
  isDead(): boolean {
    return this.isAppeared() && this.isDeathStateAffected();
  }

  /**
   * Checks whether the battler is alive (visible and not in the death state).
   * @returns `true` if the battler is alive.
   */
  isAlive(): boolean {
    return this.isAppeared() && !this.isDeathStateAffected();
  }

  /**
   * Checks whether the battler is in a critical HP state (below 25% max HP).
   * @returns `true` if the battler is alive and HP is below 25% of max.
   * @todo Consider making the threshold configurable via JSON.
   */
  isDying(): boolean {
    return this.isAlive() && this._hp < this.mhp / 4; // TODO : maybe allow some rate to be edited via json
  }

  /**
   * Checks whether the battler is restricted (cannot act freely).
   * @returns `true` if the battler is visible and has a restriction level > 0.
   */
  isRestricted(): boolean {
    return this.isAppeared() && this.restriction() > 0;
  }

  /**
   * Checks whether the battler can input commands (actor only, not restricted or auto-battling).
   * @returns `true` if the battler can receive player input.
   */
  canInput(): boolean {
    return this.isAppeared() && this.isActor() &&
      !this.isRestricted() && !this.isAutoBattle();
  }

  /**
   * Checks whether the battler can move (restriction level below 4).
   * @returns `true` if the battler can perform actions.
   */
  canMove(): boolean {
    return this.isAppeared() && this.restriction() < 4;
  }

  /**
   * Checks whether the battler is confused (restriction level 1-3).
   * @returns `true` if the battler is confused.
   */
  isConfused(): boolean {
    return (
      this.isAppeared() && this.restriction() >= 1 && this.restriction() <= 3
    );
  }

  /**
   * Returns the battler's confusion level.
   * @returns The restriction level if confused, otherwise 0.
   */
  confusionLevel(): number {
    return this.isConfused() ? this.restriction() : 0;
  }

  /**
   * Checks whether this battler is an actor.
   * Always returns `false` in the base class; overridden by `GameActor`.
   * @returns `false` by default.
   */
  isActor(): this is GameActor {
    return false;
  }

  /**
   * Checks whether this battler is an enemy.
   * Always returns `false` in the base class; overridden by `GameEnemy`.
   * @returns `false` by default.
   */
  isEnemy(): this is GameEnemy {
    return false;
  }

  /**
   * Sorts the active states by priority (descending), then by ID (ascending) as a tiebreaker.
   */
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

  /**
   * Returns the highest restriction level from all active states.
   * @returns The maximum restriction level (0 if no states restrict movement).
   */
  restriction(): number {
    const restrictions = this.states().map(state => state.restriction);
    return Math.max(0, ...restrictions);
  }

  /**
   * Adds a new state to the battler, triggering death if it's the death state,
   * and firing {@link onRestrict} if the battler becomes restricted.
   * @param stateId - The ID of the state to add.
   */
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

  /**
   * Called when the battler becomes restricted.
   * Empty in the base class; intended for subclass overrides.
   */
  onRestrict() {
    // for other classes
  }

  /**
   * Returns the message text of the most important active state.
   * Iterates states in priority order and returns the first with a message3 field.
   * @returns The state message text, or an empty string if none.
   */
  mostImportantStateText(): string {
    for (const state of this.states()) {
      if (state.message3) {
        return state.message3;
      }
    }
    return '';
  }

  /**
   * Returns the motion index of the highest-priority active state.
   * Used to determine the battler's idle animation during battle.
   * @returns The motion index, or 0 if no states are active.
   */
  stateMotionIndex(): number {
    const states = this.states();
    if (states.length > 0) {
      return states[0].motion;
    } else {
      return 0;
    }
  }

  /**
   * Returns the overlay index of the highest-priority active state.
   * Used to display state overlay sprites on the battler.
   * @returns The overlay index, or 0 if no states are active.
   */
  stateOverlayIndex(): number {
    const states = this.states();
    if (states.length > 0) {
      return states[0].overlay;
    } else {
      return 0;
    }
  }

  /**
   * Checks whether the battler can use a specific weapon type.
   * Always returns `true` in the base class; overridden by subclasses.
   * @param _skill - The skill to check weapon type compatibility for.
   * @returns `true` by default.
   */
  isSkillWtypeOk(_skill: DataSkill): boolean {
    return true;
  }

  /**
   * Calculates the MP cost of a skill after applying the MP cost rate modifier.
   * @param skill - The skill to calculate MP cost for.
   * @returns The final MP cost (floored).
   */
  skillMpCost(skill: DataSkill): number {
    return Math.floor(skill.mpCost * this.mcr);
  }

  /**
   * Returns the TP cost of a skill.
   * @param skill - The skill to calculate TP cost for.
   * @returns The skill's TP cost.
   */
  skillTpCost(skill: DataSkill): number {
    return skill.tpCost;
  }

  /**
   * Checks whether the battler has enough TP and MP to pay a skill's cost.
   * @param skill - The skill to check costs for.
   * @returns `true` if the battler can afford the skill.
   */
  canPaySkillCost(skill: DataSkill): boolean {
    return (
      this._tp >= this.skillTpCost(skill) &&
      this._mp >= this.skillMpCost(skill)
    );
  }

  /**
   * Deducts the MP and TP costs of a skill from the battler.
   * @param skill - The skill whose costs are to be paid.
   */
  paySkillCost(skill: DataSkill) {
    this._mp -= this.skillMpCost(skill);
    this._tp -= this.skillTpCost(skill);
  }

  /**
   * Checks whether a usable item or skill can be used based on the current occasion.
   * Occasion 0 = always, 1 = battle only, 2 = menu only.
   * @param item - The item or skill to check.
   * @returns `true` if the occasion conditions are met.
   */
  isOccasionOk(item: DataUsableItem): boolean {
    if ($gameParty.inBattle()) {
      return item.occasion ===  OccasionType.Always || item.occasion === OccasionType.BattleScreen;
    } else {
      return item.occasion === OccasionType.Always || item.occasion === OccasionType.MenuScreen;
    }
  }

  /**
   * Checks whether the battler meets the basic conditions to use an item or skill.
   * Requires the battler to be able to move and the occasion to be valid.
   * @param item - The item or skill to check.
   * @returns `true` if the basic usability conditions are met.
   */
  meetsUsableItemConditions(item: DataUsableItem): boolean {
    return this.canMove() && this.isOccasionOk(item);
  }

  /**
   * Checks whether the battler meets all conditions to use a skill.
   * Checks occasion, weapon type, cost, seal status, and skill type seal.
   * @param skill - The skill to check.
   * @returns `true` if all skill conditions are satisfied.
   */
  meetsSkillConditions(skill: DataSkill): boolean {
    return (
      this.meetsUsableItemConditions(skill) &&
      this.isSkillWtypeOk(skill) &&
      this.canPaySkillCost(skill) &&
      !this.isSkillSealed(skill.id) &&
      !this.isSkillTypeSealed(skill.stypeId)
    );
  }

  /**
   * Checks whether the battler meets all conditions to use a consumable item.
   * Requires basic usability conditions and the party to possess the item.
   * @param item - The item to check.
   * @returns `true` if the item can be used.
   */
  meetsItemConditions(item: DataItem): boolean {
    return this.meetsUsableItemConditions(item) && $gameParty.hasItem(item);
  }

  /**
   * Checks whether the battler can use a given item or skill.
   * Delegates to {@link meetsSkillConditions} or {@link meetsItemConditions} based on type.
   * @param item - The item or skill to check.
   * @returns `true` if the battler can use the item or skill, `false` if null or unknown type.
   */
  canUse(item: DataUsableItem): boolean {
    if (!item) return false;
    if (DataManager.isSkill(item))
      return this.meetsSkillConditions(item as DataSkill);
    if (DataManager.isItem(item))
      return this.meetsItemConditions(item as DataItem);

    return false;
  }

  /**
   * Checks whether the battler can equip a given piece of equipment.
   * Delegates to {@link canEquipWeapon} or {@link canEquipArmor} based on type.
   * @param item - The equipment to check.
   * @returns `true` if the battler can equip the item, `false` if null or unknown type.
   */
  canEquip(item: DataEquipable): boolean {
    if (!item) return false;
    if (DataManager.isWeapon(item))
      return this.canEquipWeapon(item as DataWeapon);
    if(DataManager.isArmor(item))
      return this.canEquipArmor(item as DataArmor);
    return false;
  }

  /**
   * Checks whether the battler can equip a specific weapon.
   * Requires the weapon type to be allowed and the equipment slot to not be sealed.
   * @param item - The weapon to check.
   * @returns `true` if the weapon can be equipped.
   */
  canEquipWeapon(item: DataWeapon): boolean {
    return (
      this.isEquipWtypeOk(item.wtypeId) &&
      !this.isEquipTypeSealed(item.etypeId)
    );
  }

  /**
   * Checks whether the battler can equip a specific armor.
   * Requires the armor type to be allowed and the equipment slot to not be sealed.
   * @param item - The armor to check.
   * @returns `true` if the armor can be equipped.
   */
  canEquipArmor(item: DataArmor): boolean {
    return (
      this.isEquipAtypeOk(item.atypeId) &&
      !this.isEquipTypeSealed(item.etypeId)
    );
  }

  /**
   * Returns the skill ID used for the guard action.
   * @returns Always 2 (the default guard skill ID).
   */
  guardSkillId(): number {
    return 2;
  }

  /**
   * Checks whether the battler can perform a normal attack.
   * @returns `true` if the attack skill can be used.
   */
  canAttack(): boolean {
    return this.canUse($dataSkills[this.attackSkillId()]);
  }

  /**
   * Checks whether the battler can perform a guard action.
   * @returns `true` if the guard skill can be used.
   */
  canGuard(): boolean {
    return this.canUse($dataSkills[this.guardSkillId()]);
  }
}
