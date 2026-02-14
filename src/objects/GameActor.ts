import { GameBattler } from '@objects/GameBattler.ts';
import { EquipmentType, GameItem, ItemType } from '@objects/GameItem.ts';
import {
  $dataActors,
  $dataArmors, $dataClasses, $dataSkills,
  $dataStates,
  $dataSystem,
  $dataWeapons, $gameMessage,
  $gameParty, $gamePlayer, $gameScreen, $gameSystem,
  $gameTemp, $gameTroop,
  DataManager
} from '@managers';
import { DataActor } from '@data';
import { DataWeapon } from '@data/DataWeapon.ts';
import { DataArmor } from '@data/DataArmor.ts';
import { DataItem } from '@data/DataItem.ts';
import { DataEquipable } from '@data/DataEquipable.ts';
import { DataSkill } from '@data/DataSkill.ts';
import { DataClass } from '@data/DataClass.ts';
import { DataState } from '@data/DataState.ts';
import { Traits, WithTraits } from '@objects/GameBattlerBase.ts';
import { TextManager } from '@managers/TextManager.ts';
import { DataUsableItem } from '@data/DataUsableItem.ts';
import { GameParty } from '@objects/GameParty.ts';
import { GameTroop } from '@objects/GameTroop.ts';

export class GameActor extends GameBattler {

  protected _actorId: number;
  protected _name: string;
  protected _nickname: string;
  protected _classId: number;
  protected _level: number;
  protected _characterName: string;
  protected _characterIndex: number;
  protected _faceName: string;
  protected _faceIndex: number;
  protected _battlerName: string;
  protected _exp: Record<number, number>;
  protected _skills: number[];
  protected _equips: GameItem[];
  protected _actionInputIndex: number;
  protected _lastMenuSkill: GameItem;
  protected _lastBattleSkill: GameItem;
  protected _lastCommandSymbol: string;
  protected _profile: string;
  protected _stateSteps: Map<number, number>;

  get level(): number {
    return this._level;
  }

  constructor(actorId: number, ...args: any[]) {
    super(...arguments);
  }

  override initialize(actorId: number, ...args: any[]) {
    super.initialize(...args);
    this.setup(actorId);
  }

  override initMembers() {
    super.initMembers();
    this._actorId = 0;
    this._name = '';
    this._nickname = '';
    this._classId = 0;
    this._level = 0;
    this._characterName = '';
    this._characterIndex = 0;
    this._faceName = '';
    this._faceIndex = 0;
    this._battlerName = '';
    this._exp = {};
    this._skills = [];
    this._equips = [];
    this._actionInputIndex = 0;
    this._lastMenuSkill = new GameItem();
    this._lastBattleSkill = new GameItem();
    this._lastCommandSymbol = '';
    this._stateSteps = new Map<number, number>();
  }

  setup(actorId: number) {
    const actor = $dataActors[actorId];
    this._actorId = actorId;
    this._name = actor.name;
    this._nickname = actor.nickname;
    this._profile = actor.profile;
    this._classId = actor.classId;
    this._level = actor.initialLevel;
    this.initImages();
    this.initExp();
    this.initSkills();
    this.initEquips(actor.equips);
    this.clearParamPlus();
    this.recoverAll();
  }

  get actorId(): number {
    return this._actorId;
  }

  get actor(): DataActor {
    return $dataActors[this._actorId];
  }

  get name(): string {
    return this._name;
  }

  set name(name: string) {
    this._name = name;
  }

  get nickname() {
    return this._nickname;
  }

  set nickname(newNickname: string) {
    this._nickname = newNickname;
  }

  get profile(): string {
    return this._profile;
  }

  set profile(newProfile: string) {
    this._profile = newProfile;
  }

  get characterName(): string {
    return this._characterName;
  }

  get characterIndex(): number {
    return this._characterIndex;
  }

  get faceName(): string {
    return this._faceName;
  }

  get faceIndex(): number {
    return this._faceIndex;
  }

  get battlerName(): string {
    return this._battlerName;
  }

  override clearStates() {
    super.clearStates();
    this._stateSteps.clear();
  }

  override eraseState(stateId: number) {
    super.eraseState(stateId);
    this._stateSteps.delete(stateId);
  }

  override resetStateCounts(stateId: number) {
    super.resetStateCounts(stateId);
    const steps = $dataStates[stateId].stepsToRemove;
    this._stateSteps.set(stateId, steps);
  }

  initImages() {
    const actor = this.actor;
    this._characterName = actor.characterName;
    this._characterIndex = actor.characterIndex;
    this._faceName = actor.faceName;
    this._faceIndex = actor.faceIndex;
    this._battlerName = actor.battlerName;
  }

  expForLevel(level: number): number {
    const c = this.currentClass();
    const basis = c.expParams[0];
    const extra = c.expParams[1];
    const acc_a = c.expParams[2];
    const acc_b = c.expParams[3];
    return Math.round(
      (basis * Math.pow(level - 1, 0.9 + acc_a / 250) * level * (level + 1)) /
      (6 + Math.pow(level, 2) / 50 / acc_b) +
      (level - 1) * extra
    );
  }

  initExp() {
    this._exp[this._classId] = this.currentLevelExp();
  }

  currentExp(): number {
    return this._exp[this._classId];
  }

  currentLevelExp(): number {
    return this.expForLevel(this._level);
  }

  nextLevelExp(): number {
    return this.expForLevel(this._level + 1);
  }

  nextRequiredExp(): number {
    return this.nextLevelExp() - this.currentExp();
  }

  maxLevel(): number {
    return this.actor.maxLevel;
  }

  isMaxLevel(): boolean {
    return this._level >= this.maxLevel();
  }
  initSkills() {
    this._skills = [];
    for (const learning of this.currentClass().learnings) {
      if (learning.level <= this._level) {
        this.learnSkill(learning.skillId);
      }
    }
  }

  initEquips(equips: number[]) {
    const slots = this.equipSlots();
    const maxSlots = slots.length;
    this._equips = [];
    for (let i = 0; i < maxSlots; i++) {
      this._equips[i] = new GameItem();
    }
    for (let j = 0; j < equips.length; j++) {
      if (j < maxSlots) {
        this._equips[j].setEquip(slots[j] === 1, equips[j]);
      }
    }
    this.releaseUnequippableItems(true);
    this.refresh();
  }

  equipSlots(): number[] {
    const slots = [];
    for (let i = 1; i < $dataSystem.equipTypes.length; i++) {
      slots.push(i);
    }
    if (slots.length >= 2 && this.isDualWield()) {
      slots[1] = 1;
    }
    return slots;
  }

  equips(): EquipmentType[] {
    return this._equips.map(item => item.object()) as EquipmentType[];
  }

  weapons(): DataWeapon[] {
    return this.equips().filter(item => item && DataManager.isWeapon(item)) as DataWeapon[];
  }

  armors(): DataArmor[] {
    return this.equips().filter(item => item && DataManager.isArmor(item)) as DataArmor[];
  }

  hasWeapon(weapon: DataWeapon): boolean {
    return this.weapons().includes(weapon);
  }

  hasArmor(armor: DataArmor): boolean {
    return this.armors().includes(armor);
  }

  isEquipChangeOk(slotId: number): boolean {
    return (
      !this.isEquipTypeLocked(this.equipSlots()[slotId]) &&
      !this.isEquipTypeSealed(this.equipSlots()[slotId])
    );
  }

  changeEquip(slotId: number, item: EquipmentType) {
    if (
      this.tradeItemWithParty(item, this.equips()[slotId] as EquipmentType) &&
      (!item || this.equipSlots()[slotId] === item.etypeId)
    ) {
      this._equips[slotId].setObject(item);
      this.refresh();
    }
  }

  forceChangeEquip(slotId: number, item: EquipmentType) {
    this._equips[slotId].setObject(item);
    this.releaseUnequippableItems(true);
    this.refresh();
  }

  tradeItemWithParty(newItem: EquipmentType, oldItem: EquipmentType): boolean {
    if (newItem && !$gameParty.hasItem(newItem)) {
      return false;
    } else {
      $gameParty.gainItem(oldItem, 1);
      $gameParty.loseItem(newItem, 1);
      return true;
    }
  }

  changeEquipById(etypeId: number, itemId: number) {
    const slotId = etypeId - 1;
    if (this.equipSlots()[slotId] === 1) {
      this.changeEquip(slotId, $dataWeapons[itemId]);
    } else {
      this.changeEquip(slotId, $dataArmors[itemId]);
    }
  }

  isEquipped(item: EquipmentType): boolean {
    return this.equips().includes(item);
  }

  discardEquip(item: EquipmentType) {
    const slotId = this.equips().indexOf(item);
    if (slotId >= 0) {
      this._equips[slotId].setObject(null);
    }
  }

  releaseUnequippableItems(forcing: boolean) {
    for (; ;) {
      const slots = this.equipSlots();
      const equips = this.equips();
      let changed = false;
      for (let i = 0; i < equips.length; i++) {
        const item = equips[i];
        if (item && (!this.canEquip(item) || item.etypeId !== slots[i])) {
          if (!forcing) {
            this.tradeItemWithParty(null, item);
          }
          this._equips[i].setObject(null);
          changed = true;
        }
      }
      if (!changed) {
        break;
      }
    }
  }

  clearEquipments() {
    const maxSlots = this.equipSlots().length;
    for (let i = 0; i < maxSlots; i++) {
      if (this.isEquipChangeOk(i)) {
        this.changeEquip(i, null);
      }
    }
  }

  optimizeEquipments() {
    const maxSlots = this.equipSlots().length;
    this.clearEquipments();
    for (let i = 0; i < maxSlots; i++) {
      if (this.isEquipChangeOk(i)) {
        this.changeEquip(i, this.bestEquipItem(i));
      }
    }
  }

  bestEquipItem(slotId: number): EquipmentType {
    const etypeId = this.equipSlots()[slotId];
    const items = $gameParty
      .equipItems()
      .filter(item => item.etypeId === etypeId && this.canEquip(item));
    let bestItem = null;
    let bestPerformance = -1000;
    for (let i = 0; i < items.length; i++) {
      const performance = this.calcEquipItemPerformance(items[i]);
      if (performance > bestPerformance) {
        bestPerformance = performance;
        bestItem = items[i];
      }
    }
    return bestItem;
  }

  calcEquipItemPerformance(item: DataEquipable) {
    return item.params.reduce((a, b) => a + b);
  }

  override isSkillWtypeOk(skill: DataSkill): boolean {
    const wtypeId1 = skill.requiredWtypeId1;
    const wtypeId2 = skill.requiredWtypeId2;
    return (wtypeId1 === 0 && wtypeId2 === 0) ||
      (wtypeId1 > 0 && this.isWtypeEquipped(wtypeId1)) ||
      (wtypeId2 > 0 && this.isWtypeEquipped(wtypeId2));
  }

  isWtypeEquipped(wtypeId: number) {
    return this.weapons().some(weapon => weapon.wtypeId === wtypeId);
  }

  override refresh() {
    this.releaseUnequippableItems(false);
    super.refresh();
  }

  override hide() {
    super.hide();
    $gameTemp.requestBattleRefresh();
  }

  override isActor(): boolean {
    return true;
  }

  friendsUnit(): GameParty {
    return $gameParty;
  }

  opponentsUnit(): GameTroop {
    return $gameTroop;
  }


  index(): number {
    return $gameParty.members().indexOf(this);
  }

  isBattleMember(): boolean {
    return $gameParty.battleMembers().includes(this);
  }

  isFormationChangeOk(): boolean {
    return true;
  }

  currentClass(): DataClass {
    return $dataClasses[this._classId];
  }

  isClass(gameClass: DataClass): boolean {
    return gameClass && this._classId === gameClass.id;
  }

  skillTypes() {
    const skillTypes = this.addedSkillTypes().sort((a, b) => a - b);
    return skillTypes.filter((x, i, self) => self.indexOf(x) === i);
  }

  skills() {
    const list: DataSkill[] = [];
    for (const id of this._skills.concat(this.addedSkills())) {
      if (!list.includes($dataSkills[id])) {
        list.push($dataSkills[id]);
      }
    }
    return list;
  }

  usableSkills() {
    return this.skills().filter(skill => this.canUse(skill));
  }

  override traitObjects(): WithTraits[] {
    const objects = super.traitObjects();
    objects.push(this.actor, this.currentClass());
    for (const item of this.equips()) {
      if (item) {
        objects.push(item);
      }
    }
    return objects;
  }

  override attackElements(): number[] {
    const set = super.attackElements();
    if (this.hasNoWeapons() && !set.includes(this.bareHandsElementId())) {
      set.push(this.bareHandsElementId());
    }
    return set;
  }

  hasNoWeapons(): boolean {
    return this.weapons().length === 0;
  }

  bareHandsElementId(): number {
    return 1;
  }

  override paramBase(paramId: number): number {
    return super.paramBase(paramId);
  }

  override paramPlus(paramId: number): number {
    let value = super.paramPlus(paramId);
    for (const item of this.equips()) {
      if (item) {
        value += item.params[paramId];
      }
    }
    return value;
  }

  attackAnimationId1(): number {
    if (this.hasNoWeapons()) {
      return this.bareHandsAnimationId();
    } else {
      const weapons = this.weapons();
      return weapons[0] ? weapons[0].animationId : 0;
    }
  }

  attackAnimationId2(): number {
    const weapons = this.weapons();
    return weapons[1] ? weapons[1].animationId : 0;
  }

  bareHandsAnimationId(): number {
    return 1;
  }

  changeExp(exp: number, show: boolean) {
    this._exp[this._classId] = Math.max(exp, 0);
    const lastLevel = this._level;
    const lastSkills = this.skills();
    while (!this.isMaxLevel() && this.currentExp() >= this.nextLevelExp()) {
      this.levelUp();
    }
    while (this.currentExp() < this.currentLevelExp()) {
      this.levelDown();
    }
    if (show && this._level > lastLevel) {
      this.displayLevelUp(this.findNewSkills(lastSkills));
    }
    this.refresh();
  }

  levelUp() {
    this._level++;
    for (const learning of this.currentClass().learnings) {
      if (learning.level === this._level) {
        this.learnSkill(learning.skillId);
      }
    }
  }

  levelDown() {
    this._level--;
  }

  findNewSkills(lastSkills: DataSkill[]){
    const newSkills = this.skills();
    for (const lastSkill of lastSkills) {
      newSkills.remove(lastSkill);
    }
    return newSkills;
  }

  displayLevelUp(newSkills: DataSkill[]){
    const text = TextManager.levelUp.format(
      this._name,
      TextManager.level,
      this._level
    );
    $gameMessage.newPage();
    $gameMessage.add(text);
    for (const skill of newSkills) {
      $gameMessage.add(TextManager.obtainSkill.format(skill.name));
    }
  }

  gainExp(exp: number) {
    const newExp = this.currentExp() + Math.round(exp * this.finalExpRate());
    this.changeExp(newExp, this.shouldDisplayLevelUp());
  }

  finalExpRate(): number {
    return this.exr * (this.isBattleMember() ? 1 : this.benchMembersExpRate());
  }

  benchMembersExpRate(): number {
    return $dataSystem.optExtraExp ? 1 : 0;
  }

  shouldDisplayLevelUp(): boolean {
    return true;
  }

  changeLevel(level: number, show: boolean) {
    level = level.clamp(1, this.maxLevel());
    this.changeExp(this.expForLevel(level), show);
  }

  learnSkill(skillId: number) {
    if (!this.isLearnedSkill(skillId)) {
      this._skills.push(skillId);
      this._skills.sort((a, b) => a - b);
    }
  }

  forgetSkill(skillId: number) {
    this._skills.remove(skillId);
  }

  isLearnedSkill(skillId: number): boolean {
    return this._skills.includes(skillId);
  }

  hasSkill(skillId: number) {
    return this.skills().includes($dataSkills[skillId]);
  }

  changeClass(classId: number, keepExp: boolean) {
    if (keepExp) {
      this._exp[classId] = this.currentExp();
    }
    this._classId = classId;
    this._level = 0;
    this.changeExp(this._exp[this._classId] || 0, false);
    this.refresh();
  }

  setCharacterImage(characterName: string, characterIndex: number) {
    this._characterName = characterName;
    this._characterIndex = characterIndex;
  }

  setFaceImage(faceName: string, faceIndex: number) {
    this._faceName = faceName;
    this._faceIndex = faceIndex;
    $gameTemp.requestBattleRefresh();
  }

  setBattlerImage(battlerName: string) {
    this._battlerName = battlerName;
  }

  isSpriteVisible(): boolean {
    return $gameSystem.isSideView();
  }
  override performActionStart(action: GameAction){
    super.performActionStart(action);
    if (action.isAttack()) {
      this.performAttack();
    } else if (action.isGuard()) {
      this.requestMotion("guard");
    } else if (action.isMagicSkill()) {
      this.requestMotion("spell");
    } else if (action.isSkill()) {
      this.requestMotion("skill");
    } else if (action.isItem()) {
      this.requestMotion("item");
    }
  }

  override performActionEnd(){
    super.performActionEnd();
  }

  performAttack(){
    const weapons = this.weapons();
    const wtypeId = weapons[0] ? weapons[0].wtypeId : 0;
    const attackMotion = $dataSystem.attackMotions[wtypeId];
    if (attackMotion) {
      if (attackMotion.type === 0) {
        this.requestMotion("thrust");
      } else if (attackMotion.type === 1) {
        this.requestMotion("swing");
      } else if (attackMotion.type === 2) {
        this.requestMotion("missile");
      }
      this.startWeaponAnimation(attackMotion.weaponImageId);
    }
  }

  override performDamage(){
    super.performDamage();
    if (this.isSpriteVisible()) {
      this.requestMotion("damage");
    } else {
      $gameScreen.startShake(5, 5, 10);
    }
    SoundManager.playActorDamage();
  }

  override performEvasion() {
    super.performEvasion();
    this.requestMotion("evade");
  }

  override performMagicEvasion() {
    super.performMagicEvasion();
    this.requestMotion("evade");
  }

  override performCounter() {
    super.performCounter();
    this.performAttack();
  }

  override performCollapse() {
    super.performCollapse();
    if ($gameParty.inBattle()) {
      SoundManager.playActorCollapse();
    }
  }

  performVictory(){
    this.setActionState("done");
    if (this.canMove()) {
      this.requestMotion("victory");
    }
  }

  performEscape(){
    if(!this.canMove()) return;
    this.requestMotion("escape");
  }

  makeActionList(): GameAction[] {
    const list = [];
    const attackAction = new Game_Action(this);
    attackAction.setAttack();
    list.push(attackAction);
    for (const skill of this.usableSkills()) {
      const skillAction = new Game_Action(this);
      skillAction.setSkill(skill.id);
      list.push(skillAction);
    }
    return list;
  }

  makeAutoBattleActions() {
    for (let i = 0; i < this.numActions(); i++) {
      const list = this.makeActionList();
      let maxValue = -Number.MAX_VALUE;
      for (const action of list) {
        const value = action.evaluate();
        if (value > maxValue) {
          maxValue = value;
          this.setAction(i, action);
        }
      }
    }
    this.setActionState("waiting");
  }

  makeConfusionActions(){
    for (let i = 0; i < this.numActions(); i++) {
      this.action(i).setConfusion();
    }
    this.setActionState("waiting");
  }

  override makeActions() {
    super.makeActions();
    if (this.numActions() > 0) {
      this.setActionState("undecided");
    } else {
      this.setActionState("waiting");
    }
    if (this.isAutoBattle()) {
      this.makeAutoBattleActions();
    } else if (this.isConfused()) {
      this.makeConfusionActions();
    }
  }

  onPlayerWalk(){
    this.clearResult();
    this.checkFloorEffect();
    if ($gamePlayer.isNormal()) {
      this.turnEndOnMap();
      for (const state of this.states()) {
        this.updateStateSteps(state);
      }
      this.showAddedStates();
      this.showRemovedStates();
    }
  }

  updateStateSteps(state: DataState){
    if(!state.removeByWalking) return;
    if(this._stateSteps.get(state.id) < 0 ) return;
    const st = this._stateSteps.set(state.id, -1);
    if(st.get(state.id) < 0 )  {
      this.removeState(state.id);
    }
  }

  showAddedStates() {
    for (const state of this.result().addedStateObjects()) {
      if (state.message1) {
        $gameMessage.add(state.message1.format(this._name));
      }
    }
  }

  showRemovedStates(){
    for (const state of this.result().removedStateObjects()) {
      if (state.message4) {
        $gameMessage.add(state.message4.format(this._name));
      }
    }
  }

  stepsForTurn(): number {
    return 20;
  }

  turnEndOnMap(){
    if ($gameParty.steps() % this.stepsForTurn() === 0) {
      this.onTurnEnd();
      if (this.result().hpDamage > 0) {
        this.performMapDamage();
      }
    }
  }

  checkFloorEffect(){
    if ($gamePlayer.isOnDamageFloor()) {
      this.executeFloorDamage();
    }
  }

  executeFloorDamage(){
    const floorDamage = Math.floor(this.basicFloorDamage() * this.fdr);
    const realDamage = Math.min(floorDamage, this.maxFloorDamage());
    this.gainHp(-realDamage);
    if (realDamage > 0) {
      this.performMapDamage();
    }
  }

  basicFloorDamage(): number {
    return 10;
  }

  maxFloorDamage(): number {
    return $dataSystem.optFloorDeath ? this.hp : Math.max(this.hp - 1, 0);
  }

  performMapDamage(){
    if (!$gameParty.inBattle()) {
      $gameScreen.startFlashForDamage();
    }
  }

  override clearActions(){
    super.clearActions();
    this._actionInputIndex = 0;
  }

  inputtingAction(){
    return this.action(this._actionInputIndex);
  }

  selectNextCommand(): boolean {
    if (this._actionInputIndex < this.numActions() - 1) {
      this._actionInputIndex++;
      return true;
    } else {
      return false;
    }
  }

  selectPreviousCommand(): boolean {
    if (this._actionInputIndex > 0) {
      this._actionInputIndex--;
      return true;
    } else {
      return false;
    }
  }

  lastSkill(): DataSkill {
    if ($gameParty.inBattle()) {
      return this.lastBattleSkill();
    } else {
      return this.lastMenuSkill();
    }
  }

  lastMenuSkill(): DataSkill {
    return this._lastMenuSkill.object() as DataSkill;
  }

  setLastMenuSkill(lastMenuSkill: DataSkill): void {
    this._lastMenuSkill.setObject(lastMenuSkill);
  }

  lastBattleSkill(): DataSkill{
    return this._lastBattleSkill.object() as DataSkill;
  }

  setLastBattleSkill(lastBattleSkill: DataSkill): void {
    this._lastBattleSkill.setObject(lastBattleSkill);
  }

  lastCommandSymbol(): string {
    return this._lastCommandSymbol;
  }

  setLastCommandSymbol(symbol: string) {
    this._lastCommandSymbol = symbol;
  }

  testEscape(item: DataUsableItem) {
    return item.effects.some(
      effect => effect && effect.code === Actions.EFFECT_SPECIAL
    );
  }

  override meetsUsableItemConditions(item: DataUsableItem): boolean {
    if($gameParty.inBattle()){
      if (!BattleManager.canEscape() && this.testEscape(item)) {
        return false;
      }
    }
    return super.meetsUsableItemConditions(item);
  }

  onEscapeFailure(){
    if (BattleManager.isTpb()) {
      this.applyTpbPenalty();
    }
    this.clearActions();
    this.requestMotionRefresh();
  }


}
