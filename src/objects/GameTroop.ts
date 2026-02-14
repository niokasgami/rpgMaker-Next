import { GameUnit } from '@objects/GameUnit.ts';
import { GameEnemy } from '@objects/GameEnemy.ts';
import { DataTroop } from '@data/DataTroop.ts';
import { $dataEnemies, $dataTroops, $gameActors, $gameParty, $gameSwitches, $gameSystem, $gameTroop } from '@managers';


import { BattlePage } from '@data/RPG/BattlePage.ts';
import { DataItem } from '@data/DataItem.ts';
import { DataWeapon } from '@data/DataWeapon.ts';
import { DataArmor } from '@data/DataArmor.ts';

type DropItem = DataItem | DataWeapon | DataArmor;

export class GameTroop extends GameUnit<GameEnemy> {

  readonly LETTER_TABLE_HALF = [
    ' A', ' B', ' C', ' D', ' E', ' F', ' G', ' H', ' I', ' J', ' K', ' L', ' M',
    ' N', ' O', ' P', ' Q', ' R', ' S', ' T', ' U', ' V', ' W', ' X', ' Y', ' Z'
  ];

  readonly LETTER_TABLE_FULL = [
    'Ａ', 'Ｂ', 'Ｃ', 'Ｄ', 'Ｅ', 'Ｆ', 'Ｇ', 'Ｈ', 'Ｉ', 'Ｊ', 'Ｋ', 'Ｌ', 'Ｍ',
    'Ｎ', 'Ｏ', 'Ｐ', 'Ｑ', 'Ｒ', 'Ｓ', 'Ｔ', 'Ｕ', 'Ｖ', 'Ｗ', 'Ｘ', 'Ｙ', 'Ｚ'
  ];

  protected _interpreter: GameInterpreter;
  protected _turnCount: number;
  protected _troopId: number;
  protected _eventFlags: Record<string, boolean>;
  protected _enemies: GameEnemy[];
  protected _namesCount: Record<string, number>;


  override initialize(...args: any[]) {
    super.initialize(...args);
    this._interpreter = new GameInterpreter();
    this.clear();
  }


  isEventRunning(): boolean {
    return this._interpreter.isRunning();
  }

  updateInterpreter() {
    this._interpreter.update();
  }

  turnCount(): number {
    return this._turnCount;
  }

  override members(): GameEnemy[] {
    return this._enemies;
  }

  clear() {
    this._interpreter.clear();
    this._troopId = 0;
    this._eventFlags = {};
    this._enemies = [];
    this._turnCount = 0;
    this._namesCount = {};
  }

  troop(): DataTroop {
    return $dataTroops[this._troopId];
  }

  setup(troopId: number) {
    this.clear();
    this._troopId = troopId;
    this._enemies = [];
    for (const member of this.troop().members) {
      if ($dataEnemies[member.enemyId]) {
        const enemyId = member.enemyId;
        const x = member.x;
        const y = member.y;
        const enemy = new GameEnemy(enemyId, x, y);
        if (member.hidden) {
          enemy.hide();
        }
        this._enemies.push(enemy);
      }
    }
    this.makeUniqueNames();
  }

  makeUniqueNames() {
    const table = this.letterTable();
    for (const enemy of this.members()) {
      if (enemy.isAlive() && enemy.isLetterEmpty()) {
        const name = enemy.originalName;
        const n = this._namesCount[name] || 0;
        enemy.setLetter(table[n % table.length]);
        this._namesCount[name] = n + 1;
      }
    }
    this.updatePluralFlags();
  }

  updatePluralFlags() {
    for (const enemy of this.members()) {
      const name = enemy.originalName;
      if (this._namesCount[name] >= 2) {
        enemy.setPlural(true);
      }
    }
  }

  letterTable(): string[] {
    return $gameSystem.isCJK()
      ? this.LETTER_TABLE_FULL
      : this.LETTER_TABLE_HALF;
  }

  enemyNames() {
    const names = [];
    for (const enemy of this.members()) {
      const name = enemy.originalName;
      if (enemy.isAlive() && !names.includes(name)) {
        names.push(name);
      }
    }
    return names;
  }

  meetsConditions(page: BattlePage): boolean {
    const c = page.conditions;
    if (
      !c.turnEnding &&
      !c.turnValid &&
      !c.enemyValid &&
      !c.actorValid &&
      !c.switchValid
    ) {
      return false; // Conditions not set
    }
    if (c.turnEnding) {
      if (!BattleManager.isTurnEnd()) {
        return false;
      }
    }
    if (c.turnValid) {
      const n = this._turnCount;
      const a = c.turnA;
      const b = c.turnB;
      if (b === 0 && n !== a) {
        return false;
      }
      if (b > 0 && (n < 1 || n < a || n % b !== a % b)) {
        return false;
      }
    }
    if (c.enemyValid) {
      const enemy = $gameTroop.members()[c.enemyIndex];
      if (!enemy || enemy.hpRate() * 100 > c.enemyHp) {
        return false;
      }
    }
    if (c.actorValid) {
      const actor = $gameActors.actor(c.actorId);
      if (!actor || actor.hpRate() * 100 > c.actorHp) {
        return false;
      }
    }
    if (c.switchValid) {
      if (!$gameSwitches.value(c.switchId)) {
        return false;
      }
    }
    return true;
  }

  setupBattleEvent() {
    if (this._interpreter.isRunning()) return;
    if (this._interpreter.setupReservedCommonEvent()) return;

    const pages = this.troop().pages;
    const index = pages.findIndex((page, i) => this.meetsConditions(page) && !this._eventFlags[i]);
    if (index === -1) return;

    const page = pages[index];
    this._interpreter.setup(page.list);
    if (page.span <= 1) this._eventFlags[index] = true;
  }

  increaseTurn(){
    const pages = this.troop().pages;
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (page.span === 1) {
        this._eventFlags[i] = false;
      }
    }
    this._turnCount++;
  }

  expTotal(): number {
    return this.deadMembers().reduce((r, enemy) => r + enemy.exp(), 0);
  }

  goldTotal(): number {
    const members = this.deadMembers();
    return members.reduce((r, enemy) => r + enemy.gold(), 0) * this.goldRate();
  }

  goldRate(): number {
    return $gameParty.hasGoldDouble() ? 2 : 1;
  }


  makeDropItems(): DropItem[] {
    return this.deadMembers().reduce<DropItem[]>(
      (acc, enemy) => [...acc, ...enemy.makeDropItems()],
      []
    );
  }

  isTpbTurnEnd(): boolean {
    const members = this.members();
    const turnMax = Math.max(...members.map(member => member.turnCount()));
    return turnMax > this._turnCount;
  }
}
