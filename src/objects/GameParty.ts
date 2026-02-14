import { GameUnit } from '@objects/GameUnit.ts';
import { GameActor } from '@objects/GameActor.ts';
import { EquipmentType, GameItem, ItemType } from '@objects/GameItem.ts';
import {
  $dataActors,
  $dataArmors,
  $dataItems,
  $dataSystem,
  $dataWeapons,
  $gameActors, $gameMap,
  $gamePlayer, $gameTemp,
  DataManager
} from '@managers';
import { GameActors } from '@objects/GameActors.ts';
import { DataItem } from '@data/DataItem.ts';
import { DataWeapon } from '@data/DataWeapon.ts';
import { DataArmor } from '@data/DataArmor.ts';
import { DataEquipable } from '@data/DataEquipable.ts';
import { TextManager } from '@managers/TextManager.ts';
import { DataUsableItem } from '@data/DataUsableItem.ts';


export enum PartyAbility {
  ENCOUNTER_HALF = 0,
  ENCOUNTER_NONE = 1,
  CANCEL_SURPRISE = 2,
  RAISE_PREEMPTIVE = 3,
  GOLD_DOUBLE = 4,
  DROP_ITEM_DOUBLE = 5,
}

export class GameParty extends GameUnit<GameActor> {


  protected _gold: number;
  protected _steps: number;
  protected _lastItem: GameItem;
  protected _menuActorId: number;
  protected _targetActorId: number;
  protected _actors: number[];

  protected _items: Map<number, number>;
  protected _weapons: Map<number, number>;
  protected _armors: Map<number, number>;

  override initialize(...args: any[]) {
    super.initialize(...args);
    this._gold = 0;
    this._steps = 0;
    this._lastItem = new GameItem();
    this._menuActorId = 0;
    this._targetActorId = 0;
    this._actors = [];
    this.initAllItems();
  }

  initAllItems(): void {
    this._items = new Map();
    this._weapons = new Map();
    this._armors = new Map();
  }

  exists(): boolean {
    return this._actors.length > 0;
  }

  size(): number {
    return this.members().length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  override members(): GameActor[] {
    return this.inBattle() ? this.battleMembers() : this.allMembers();
  }

  allMembers(): GameActor[] {
    return this._actors.map(id => $gameActors.actor(id));
  }

  battleMembers(): GameActor[] {
    return this.allBattleMembers().filter(actor => actor.isAppeared());
  }

  hiddenBattleMembers(): GameActor[] {
    return this.allBattleMembers().filter(actor => actor.isHidden());
  }

  allBattleMembers(): GameActor[] {
    return this.allMembers().slice(0, this.maxBattleMembers());
  }

  maxBattleMembers(): number {
    return 4; // TODO : add a setting directly in an json to allow this.
  }

  leader(): GameActor {
    return this.battleMembers()[0];
  }

  removeInvalidMembers() {
    for (const actorId of this._actors) {
      if (!$dataActors[actorId]) {
        this._actors.remove(actorId);
      }
    }
  }

  reviveBattleMembers() {
    for (const actor of this.battleMembers()) {
      if (actor.isDead()) {
        actor.setHp(1);
      }
    }
  }

  items(): DataItem[] {
    return [...this._items.keys()].map(id => $dataItems[id]);
  }

  weapons(): DataWeapon[] {
    return [...this._weapons.keys()].map(id => $dataWeapons[id]);
  }

  armors(): DataArmor[] {
    return [...this._armors.keys()].map(id => $dataArmors[id]);
  }

  equipItems(): EquipmentType[] {
    return [...this.weapons(), ...this.armors()];
  }

  allItems(): ItemType[] {
    return [...this.items(), ...this.equipItems()];
  }

  itemContainer(item: ItemType): Map<number, number> | null {
    if (!item) return null;
    if (DataManager.isItem(item)) return this._items;
    if (DataManager.isWeapon(item)) return this._weapons;
    if (DataManager.isArmor(item)) return this._armors;
    return null;
  }

  setupStartingMembers() {
    this._actors = [];
    for (const actorId of $dataSystem.partyMembers) {
      if ($gameActors.actor(actorId)) {
        this._actors.push(actorId);
      }
    }
  }

  name(): string {
    const numBattleMembers = this.battleMembers().length;
    if (numBattleMembers === 0) {
      return '';
    } else if (numBattleMembers === 1) {
      return this.leader().name;
    } else {
      return TextManager.partyName.format(this.leader().name);
    }
  }

  setupBattleTest() {
    this.setupBattleTestMembers();
    this.setupBattleTestItems();
  }

  setupBattleTestMembers() {
    for (const battler of $dataSystem.testBattlers) {
      const actor = $gameActors.actor(battler.actorId);
      if (actor) {
        actor.changeLevel(battler.level, false);
        actor.initEquips(battler.equips);
        actor.recoverAll();
        this.addActor(battler.actorId);
      }
    }
  }

  setupBattleTestItems() {
    for (const item of $dataItems) {
      if (item && item.name.length > 0) {
        this.gainItem(item, this.maxItems(item));
      }
    }
  }

  highestLevel(): number {
    return Math.max(...this.members().map(actor => actor.level));
  }

  addActor(actorId: number) {
    if (!this._actors.includes(actorId)) {
      this._actors.push(actorId);
      $gamePlayer.refresh();
      $gameMap.requestRefresh();
      $gameTemp.requestBattleRefresh();
      if (this.inBattle()) {
        const actor = $gameActors.actor(actorId);
        if (this.battleMembers().includes(actor)) {
          actor.onBattleStart();
        }
      }
    }
  }

  removeActor(actorId: number) {
    if (this._actors.includes(actorId)) {
      const actor = $gameActors.actor(actorId);
      const wasBattleMember = this.battleMembers().includes(actor);
      this._actors.remove(actorId);
      $gamePlayer.refresh();
      $gameMap.requestRefresh();
      $gameTemp.requestBattleRefresh();
      if (this.inBattle() && wasBattleMember) {
        actor.onBattleEnd();
      }
    }
  }

  gold(): number {
    return this._gold;
  }

  gainGold(amount: number) {
    this._gold = (this._gold + amount).clamp(0, this.maxGold());
  }

  loseGold(amount: number) {
    this.gainGold(-amount);
  }

  maxGold(): number {
    return 99999999;
  }

  steps(): number {
    return this._steps;
  }

  increaseSteps() {
    this._steps++;
  }

  numItems(item: ItemType): number {
    const container = this.itemContainer(item);
    return container ? container.get(item.id) : 0;
  }

  maxItems(_item: ItemType): number {
    return 99;
  }

  hasMaxItems(item: ItemType): boolean {
    return this.numItems(item) >= this.maxItems(item);
  }

  hasItem(item: ItemType, includeEquip? : boolean): boolean {
    if (this.numItems(item) > 0) {
      return true;
    } else if (includeEquip && this.isAnyMemberEquipped(item as EquipmentType)) {
      return true;
    } else {
      return false;
    }
  }

  isAnyMemberEquipped(item: EquipmentType): boolean {
    return this.members().some(actor => actor.equips().includes(item));
  }

  gainItem(item: ItemType,amount: number, includeEquip? : boolean) {
    const container = this.itemContainer(item);
    if (container) {
      const lastNumber = this.numItems(item);
      const newNumber = lastNumber + amount;

      container.set(item.id, newNumber.clamp(0, this.maxItems(item)));
      if (container.get(item.id) === 0) {
        container.delete(item.id);
      }
      if (includeEquip && newNumber < 0) {
        this.discardMembersEquip(item as EquipmentType, -newNumber);
      }
      $gameMap.requestRefresh();
    }
  }

  discardMembersEquip(item: EquipmentType, amount: number) {
    let n = amount;
    for (const actor of this.members()) {
      while (n > 0 && actor.isEquipped(item)) {
        actor.discardEquip(item);
        n--;
      }
    }
  }

  loseItem(item: ItemType, amount: number, includeEquip? : boolean) {
    this.gainItem(item, -amount, includeEquip);
  }

  consumeItem(item: ItemType) {
    if (DataManager.isItem(item) && (item as DataItem).consumable) {
      this.loseItem(item, 1);
    }
  }

  canUse(item: DataUsableItem): boolean {
    return this.members().some(actor => actor.canUse(item));
  }

  canInput() : boolean {
    return this.members().some(actor => actor.canInput());
  }

  override isAllDead(): boolean {
    if(super.isAllDead()) {
      return this.inBattle() || !this.isEmpty();
    }
    return false;
  }

  isEscaped(): boolean {
    return this.isAllDead() && this.hiddenBattleMembers().length > 0;
  }

  onPlayerWalk(){
    for (const actor of this.members()) {
      actor.onPlayerWalk();
    }
  }

  menuActor(): GameActor {
    let actor = $gameActors.actor(this._menuActorId);
    if (!this.members().includes(actor)) {
      actor = this.members()[0];
    }
    return actor;
  }

  /// maybe make it an getter setter?
  setMenuActor(actor: GameActor) {
    this._menuActorId = actor.actorId;
  }

  makeMenuActorNext(){
    let index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
      index = (index + 1) % this.members().length;
      this.setMenuActor(this.members()[index]);
    } else {
      this.setMenuActor(this.members()[0]);
    }
  }

  makeMenuActorPrevious(){
    let index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
      index = (index + this.members().length - 1) % this.members().length;
      this.setMenuActor(this.members()[index]);
    } else {
      this.setMenuActor(this.members()[0]);
    }
  }

  targetActor(): GameActor {
    let actor = $gameActors.actor(this._targetActorId);
    if (!this.members().includes(actor)) {
      actor = this.members()[0];
    }
    return actor;
  }

  setTargetActor(actor: GameActor) {
    this._targetActorId = actor.actorId;
  }

  lastItem(): ItemType {
    return this._lastItem.object();
  }

  setLastItem(item: ItemType) {
    this._lastItem.setObject(item);
  }

  swapOrder(index1: number, index2: number) {
    const temp = this._actors[index1];
    this._actors[index1] = this._actors[index2];
    this._actors[index2] = temp;
    $gamePlayer.refresh();
  }

  charactersForSavefile(): (string | number)[][] {
    return this.battleMembers().map(actor => [
      actor.characterName,
      actor.characterIndex
    ]);
  }

  facesForSavefile(): (string | number)[][] {
    return this.battleMembers().map(actor => [
      actor.faceName,
      actor.faceIndex
    ]);
  }

  partyAbility(abilityId: number): boolean {
    return this.battleMembers().some(actor => actor.partyAbility(abilityId));
  }

  hasEncounterHalf(): boolean  {
    return this.partyAbility(PartyAbility.ENCOUNTER_HALF);
  }

  hasEncounterNone(): boolean {
    return this.partyAbility(PartyAbility.ENCOUNTER_NONE);
  }

  hasCancelSurprise(): boolean {
    return this.partyAbility(PartyAbility.CANCEL_SURPRISE);
  }

  hasRaisePreemptive(): boolean {
    return this.partyAbility(PartyAbility.RAISE_PREEMPTIVE);
  }

  hasGoldDouble(): boolean {
    return this.partyAbility(PartyAbility.GOLD_DOUBLE);
  }

  hasDropItemDouble(): boolean {
    return this.partyAbility(PartyAbility.DROP_ITEM_DOUBLE);
  }

  ratePreemptive(troopAgi: number) : number {
    let rate = this.agility() >= troopAgi ? 0.05 : 0.03;
    if (this.hasRaisePreemptive()) {
      rate *= 4;
    }
    return rate;
  }

  performVictory() {
    for (const actor of this.members()) {
      actor.performVictory();
    }
  }

  performEscape(){
    for (const actor of this.members()) {
      actor.performEscape();
    }
  }

  removeBattleStates(){
    for (const actor of this.members()) {
      actor.removeBattleStates();
    }
  }

  requestMotionRefresh(){
    for (const actor of this.members()) {
      actor.requestMotionRefresh();
    }
  }

  onEscapeFailure(){
    for (const actor of this.members()) {
      actor.onEscapeFailure();
    }
  }
}
