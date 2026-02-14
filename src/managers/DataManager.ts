import { DataActor, DataAnimation } from '../data';
import { DataArmor } from '../data/DataArmor.ts';
import { DataWeapon } from '@data/DataWeapon.ts';
import { DataItem } from '@data/DataItem.ts';
import { DataSkill } from '@data/DataSkill.ts';
import { DataClass } from '@data/DataClass.ts';
import { DataEnemy } from '@data/DataEnemy.ts';
import { DataTroop } from '@data/DataTroop.ts';
import { DataState } from '@data/DataState.ts';
import { DataTileset } from '@data/DataTileset.ts';
import { DataCommonEvent } from '@data/DataCommonEvent.ts';
import { DataSystem } from '@data/DataSystem.ts';
import { DataMapInfo } from '@data/DataMapInfo.ts';
import { DataMap } from '@data/DataMap.ts';
import { StorageManager } from '@managers/StorageManager.ts';
import { SavefileInfo } from '@data/SavefileInfo.ts';
import { Engine, Utils } from '@core';
import { DataItemBase } from '@data/DataItemBase.ts';
import { GameSystem } from '@objects/GameSystem.ts';
import { GameActors } from '@objects/GameActors.ts';
import { GameParty } from '@objects/GameParty.ts';
import { GameTimer } from '@objects/GameTimer.ts';
import { GameTroop } from '@objects/GameTroop.ts';

// DATA RELATED JSON
export let $dataActors: DataActor[] = null;
export let $dataClasses: DataClass[] = null;
export let $dataSkills: DataSkill[] = null;
export let $dataItems: DataItem[] = null;
export let $dataWeapons: DataWeapon[] = null;
export let $dataArmors: DataArmor[] = null;
export let $dataEnemies: DataEnemy[] = null;
export let $dataTroops: DataTroop[] = null;
export let $dataStates: DataState[] = null;
export let $dataAnimations: DataAnimation[] = null;
export let $dataTilesets: DataTileset[] = null;
export let $dataCommonEvents: DataCommonEvent[] = null;
export let $dataSystem: DataSystem = null;
export let $dataMapInfos: DataMapInfo[] = null;
export let $dataMap: DataMap = null;

// GLOBAL CLASSES
export let $gameTemp : GameTemp = null;
export let $gameSystem: GameSystem = null;
export let $gameScreen: GameScreen = null;
export let $gameTimer: GameTimer = null;
export let $gameMessage: GameMessage = null;
export let $gameSwitches: GameSwitches = null;
export let $gameVariables: GameVariables = null;
export let $gameSelfSwitches: GameSelfSwitches = null;
export let $gameActors: GameActors = null;
export let $gameParty: GameParty = null;
export let $gameTroop: GameTroop = null;
export let $gameMap: GameMap = null;
export let $gamePlayer: GamePlayer = null;
export let $testEvent: GameEvent = null;


type errorObj = { name: string, src: string, url: string };

export class DataManager {

  private static _globalInfo: SavefileInfo[] = null;
  private static _errors: errorObj[] = [];

  private static _databaseFiles = [
    { name: '$dataActors', src: 'Actors.json' },
    { name: '$dataClasses', src: 'Classes.json' },
    { name: '$dataSkills', src: 'Skills.json' },
    { name: '$dataItems', src: 'Items.json' },
    { name: '$dataWeapons', src: 'Weapons.json' },
    { name: '$dataArmors', src: 'Armors.json' },
    { name: '$dataEnemies', src: 'Enemies.json' },
    { name: '$dataTroops', src: 'Troops.json' },
    { name: '$dataStates', src: 'States.json' },
    { name: '$dataAnimations', src: 'Animations.json' },
    { name: '$dataTilesets', src: 'Tilesets.json' },
    { name: '$dataCommonEvents', src: 'CommonEvents.json' },
    { name: '$dataSystem', src: 'System.json' },
    { name: '$dataMapInfos', src: 'MapInfos.json' }
  ];

  static async loadGlobalInfo() {
    this._globalInfo = await StorageManager.loadObject('global');
    this.removeInvalidGlobalInfo();
  }

  static removeInvalidGlobalInfo() {
    const globalInfo = this._globalInfo;
    for (const info of globalInfo) {
      const savefileId = globalInfo.indexOf(info);
    }
  }

  static async saveGlobalInfo() {
    await StorageManager.saveObject('global', this._globalInfo);
  }

  static isGlobalInfoLoaded(): boolean {
    return !!this._globalInfo;
  }

  static async loadDatabase(): Promise<void> {
    const test = this.isBattleTest() || this.isEventTest();
    const prefix = test ? "Test_" : "";

    const loadPromises = this._databaseFiles.map(databaseFile =>
      this.loadDataFile(databaseFile.name, prefix + databaseFile.src)
    );
    if (this.isEventTest()) {
      loadPromises.push(this.loadDataFile("$testEvent", prefix + "Event.json"));
    }

    await Promise.all(loadPromises);
  }

  static async loadDataFile(name: string, src: string) {
    const url = 'data/' + src;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      (window as any)[name] = await response.json();
      this.onLoad((window as any)[name]);
    } catch (error) {
      this.onFetchError(name, src, url);
    }
  }

  static onFetchError(name: string, src: string, url: string) {
    const error = { name: name, src, url };
    this._errors.push(error);
  }

  static isDatabaseLoaded(): boolean {
    this.checkForErrors();
    for (const databaseFile of this._databaseFiles) {
      if(!(window as any)[databaseFile.name]) {
        return false;
      }
    }
    return true;
  }

  static async loadMapData(mapId: number) {
    if(mapId > 0) {
      const filename = "Map%1.json".format(mapId.padZero(3));
      await this.loadDataFile("$dataMap", filename);
    } else {
      this.makeEmptyMap();
    }
  }

  static makeEmptyMap() {
    $dataMap = {} as DataMap;
    $dataMap.data = [];
    $dataMap.events = [];
    $dataMap.width = 100;
    $dataMap.height = 100;
    $dataMap.scrollType = 3;
  }

  static isMapLoaded(): boolean {
    this.checkForErrors();
    return !!$dataMap;
  }

  static onLoad(object: object){
    if (this.isMapObject(object)) {
      this.extractMetadata(object);
      this.extractArrayMetadata((object as DataMap).events);
    } else {
      this.extractArrayMetadata(object);
    }
  }

  static isMapObject(object: any): boolean {
    return !!(object.data && object.events);
  }

  static extractArrayMetadata(array: any){
    if (Array.isArray(array)) {
      for (const data of array) {
        if (data && "note" in data) {
          this.extractMetadata(data);
        }
      }
    }
  }

  static extractMetadata(data: any){
    const regExp = /<([^<>:]+)(:?)([^>]*)>/g;
    data.meta = {};
    for (;;) {
      const match = regExp.exec(data.note);
      if (match) {
        if (match[2] === ":") {
          data.meta[match[1]] = match[3];
        } else {
          data.meta[match[1]] = true;
        }
      } else {
        break;
      }
    }
  }

  static checkForErrors() {
    if (this._errors.length > 0) {
      const error = this._errors.shift();
      const retry = () => {
        this.loadDataFile(error.name, error.src);
      };
      throw ["LoadError", error.url, retry];
    }
  }

  static isBattleTest(): boolean {
    return Utils.isOptionValid("btest");
  }

  static isEventTest(): boolean {
    return Utils.isOptionValid("etest");
  }

  static isTitleSkip(): boolean {
    return Utils.isOptionValid("tskip");
  }

  static isSkill(item: DataItemBase): boolean {
    return item && $dataSkills.includes(item as DataSkill);
  }

  static isItem(item: DataItemBase): boolean {
    return item && $dataItems.includes(item as DataItem);
  }

  static isWeapon(item:DataItemBase): boolean {
    return item && $dataWeapons.includes(item as DataWeapon);
  }

  static isArmor(item: DataItemBase): boolean {
    return item && $dataArmors.includes(item as DataArmor);
  }

  static createGameObjects() {
    $gameTemp = new GameTemp();
    $gameSystem = new GameSystem();
    $gameScreen = new GameScreen();
    $gameTimer = new GameTimer();
    $gameMessage = new GameMessage();
    $gameSwitches = new GameSwitches();
    $gameVariables = new GameVariables();
    $gameSelfSwitches = new GameSelfSwitches();
    $gameActors = new GameActors();
    $gameParty = new GameParty();
    $gameTroop = new GameTroop();
    $gameMap = new GameMap();
    $gamePlayer = new GamePlayer();
  }

  static setupNewGame(){
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.setupStartingMembers();
    $gamePlayer.setupForNewGame();
    Engine.frameCount = 0;
  }

  static setupBattleTest(){
    this.createGameObjects();
    $gameParty.setupBattleTest();
    BattleManager.setup($dataSystem.testTroopId, true, false);
    BattleManager.setBattleTest(true);
    BattleManager.playBattleBgm();
  }

  static setupEventTest(){
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.setupStartingMembers();
    $gamePlayer.reserveTransfer(-1, 8, 6);
    $gamePlayer.setTransparent(false);
  }

  static isAnySavefileExists(): boolean  {
    return this._globalInfo.some(x => x);
  }

  static latestSavefileId() : number {
    const globalInfo = this._globalInfo;
    const validInfo = globalInfo.slice(1).filter(x => x);
    const latest = Math.max(...validInfo.map(x => x.timestamp));
    const index = globalInfo.findIndex(x => x && x.timestamp === latest);
    return index > 0 ? index : 0;
  }

  static earliestSavefileId(): number {
    const globalInfo = this._globalInfo;
    const validInfo = globalInfo.slice(1).filter(x => x);
    const earliest = Math.min(...validInfo.map(x => x.timestamp));
    const index = globalInfo.findIndex(x => x && x.timestamp === earliest);
    return index > 0 ? index : 0;
  }

  static emptySavefileId(): number {
    const globalInfo = this._globalInfo;
    const maxSavefiles = this.maxSavefiles();
    if (globalInfo.length < maxSavefiles) {
      return Math.max(1, globalInfo.length);
    } else {
      const index = globalInfo.slice(1).findIndex(x => !x);
      return index >= 0 ? index + 1 : -1;
    }
  }

  static async loadAllSavefileImages() {
    for (const info of this._globalInfo.filter(x => x)) {
     await this.loadSavefileImages(info);
    }
  }

  static async loadSavefileImages(info: SavefileInfo){
    if (info.characters && Symbol.iterator in info.characters) {
      for (const character of info.characters) {
       await ImageManager.loadCharacter(character[0]);
      }
    }
    if (info.faces && Symbol.iterator in info.faces) {
      for (const face of info.faces) {
      await  ImageManager.loadFace(face[0]);
      }
    }
  }

  static maxSavefiles(): number {
    return 20; // TODO : later implement actual JSON supports for this as it should be editable by the user without plugins.
  }

  static savefileInfo(savefileId: number): SavefileInfo | null {
    const globalInfo = this._globalInfo;
    return globalInfo[savefileId] ? globalInfo[savefileId] : null;
  }

  static savefileExists(savefileId: number): boolean {
    const saveName = this.makeSaveName(savefileId);
    return StorageManager.exists(saveName);
  }

  static async saveGame(savefileId: number): Promise<void> {
    const contents = this.makeSaveContents();
    const saveName = this.makeSaveName(savefileId);

    await StorageManager.saveObject(saveName, contents);

    this._globalInfo[savefileId] = this.makeSavefileInfo();
    await this.saveGlobalInfo();
  }

  static async loadGame(savefileId: number): Promise<void> {
    const saveName = this.makeSaveName(savefileId);
    const contents = await StorageManager.loadObject(saveName);

    this.createGameObjects();
    this.extractSaveContents(contents);
    this.correctDataErrors();
  }

  static makeSaveName(savefileId: number): string {
    return "file%1".format(savefileId);
  }

  static selectSavefileForNewGame() {
    const emptySavefileId = this.emptySavefileId();
    const earliestSavefileId = this.earliestSavefileId();
    if (emptySavefileId > 0) {
      $gameSystem.setSavefileId(emptySavefileId);
    } else {
      $gameSystem.setSavefileId(earliestSavefileId);
    }
  }

  static makeSavefileInfo(): SavefileInfo {
    const info = {} as SavefileInfo;
    info.title = $dataSystem.gameTitle;
    info.characters = $gameParty.charactersForSavefile();
    info.faces = $gameParty.facesForSavefile();
    info.playtime = $gameSystem.playtimeText();
    info.timestamp = Date.now();
    return info;
  }

  static  makeSaveContents() : SavefileContents{
    const contents = {} as SavefileContents;
    contents.system = $gameSystem;
    contents.screen = $gameScreen;
    contents.timer = $gameTimer;
    contents.switches = $gameSwitches;
    contents.variables = $gameVariables;
    contents.selfSwitches = $gameSelfSwitches;
    contents.actors = $gameActors;
    contents.party = $gameParty;
    contents.map = $gameMap;
    contents.player = $gamePlayer;
    return contents;
  }

  static extractSaveContents(contents: SavefileContents){
    $gameSystem = contents.system;
    $gameScreen = contents.screen;
    $gameTimer = contents.timer;
    $gameSwitches = contents.switches;
    $gameVariables = contents.variables;
    $gameSelfSwitches = contents.selfSwitches;
    $gameActors = contents.actors;
    $gameParty = contents.party;
    $gameMap = contents.map;
    $gamePlayer = contents.player;
  }

  static correctDataErrors(): void {
    $gameParty.removeInvalidMembers();
  }
}

export interface SavefileContents {
  system: GameSystem;
  screen: GameScreen;
  timer: GameTimer;
  switches: GameSwitches;
  variables: GameVariables;
  selfSwitches: GameSelfSwitches;
  actors: GameActors;
  party: GameParty;
  map: GameMap;
  player: GamePlayer;
}

