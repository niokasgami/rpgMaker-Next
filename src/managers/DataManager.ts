import { DataActor, DataAnimation } from '../data';
import { DataArmor } from '../data/DataArmor.ts';

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
export let $dataMap : DataMap = null;

// GLOBAL CLASSES
export let $gameTemp = null;
export let $gameSystem = null;
export let $gameScreen = null;
export let $gameTimer = null;
export let $gameMessage = null;
export let $gameSwitches = null;
export let $gameVariables = null;
export let $gameSelfSwitches = null;
export let $gameActors = null;
export let $gameParty = null;
export let $gameTroop = null;
export let $gameMap = null;
export let $gamePlayer = null;
export let $testEvent = null;


export class DataManager {}
