import {
  Vehicle,
  AudioObject,
  Terms,
  TestBattler,
  TitleCommandWindow,
  BattleSystem,
  JsonFormatLevel,
  AttackMotion
} from '@data/RPG';




export interface SystemAdvanced {
  gameId: number;
  screenWidth: number;
  screenHeight: number;
  uiAreaWidth: number;
  uiAreaHeight: number;
  numberFontFilename: string;
  fallbackFonts: string;
  fontSize: number;
  mainFontFilename: string;
  screenScale: number;
  windowOpacity: number;
  picturesUpperLimit: number;
}

export interface SystemEditor {
  messageWidth1: number;
  messageWidth2: number;
  jsonFormatLevel: JsonFormatLevel;
}

export interface DataSystem {
  advanced: SystemAdvanced;
  airship: Vehicle;
  armorTypes: string[];
  attackMotions: AttackMotion[];
  battleBgm: AudioObject;
  battleback1Name: string;
  battleback2Name: string;
  battlerHue: number;
  battlerName: string;
  battleSystem: BattleSystem;
  boat: Vehicle;
  currencyUnit: string;
  defeatMe: AudioObject;
  editMapId: number;
  elements: string[];
  equipTypes: string[];
  gameTitle: string;
  gameoverMe: AudioObject;
  itemCategories: boolean[];
  locale: string;
  magicSkills: number[];
  menuCommands: boolean[];
  optAutosave: boolean;
  optDisplayTp: boolean;
  optExtraExp: boolean;
  optFloorDeath: boolean;
  optFollowers: boolean;
  optKeyItemsNumber: number;
  optSideView: boolean;
  optSlipDeath: boolean;
  optTransparent: boolean;
  partyMembers: number[];
  ship: Vehicle;
  skillTypes: string[];
  sounds: AudioObject[];
  startMapId: number;
  startX: number;
  startY: number;
  switches: string[];
  terms: Terms;
  testBattlers: TestBattler[];
  testTroopId: number;
  title1Name: string;
  title2Name: string;
  titleBgm: AudioObject;
  titleCommandWindow: TitleCommandWindow;
  variables: string[];
  versionId: number;
  victoryMe: AudioObject;
  weaponTypes: string[];
  windowTone: number[];
  editor: SystemEditor;
  faceSize: number;
  iconSize: number;
  optSplashScreen: boolean;
  optMessageSkip: boolean;
  tileSize: number;
}


