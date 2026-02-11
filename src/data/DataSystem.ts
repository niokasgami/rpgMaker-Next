import { Vehicule, AudioObject, Terms, TestBattler } from '@data/RPG';
import { AttackMotion } from '@data/RPG/AttackMotion.ts';


export interface DataSystem {
  advanced : {
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
  };
  airship: Vehicule;
  armorTypes: string[];
  attackMotions : AttackMotion[];
  battleBgm: AudioObject;
  battleback1Name: string;
  battleback2Name: string;
  battlerhHue: number;
  battlerName: string;
  battleSystem: BattleSystem;
  boat: Vehicule;
  currencyUnit: string;
  defeatMe: AudioObject;
  editMapId: number
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
  ship: Vehicule;
  skillTypes: string[];
  sounds: AudioObject[]
  startMapId: number;
  startX: number;
  startY: number;
  switches: string[];
  terms: Terms;
  testBattlers: TestBattler[]
  testTroopId: number;
  title1Name: string;
  title2Name: string;
  titleBgm: AudioObject;
  titleCommandWindow : {
    background: number;
    offsetX: number;
    offsetY: number;
  };
  variables: string[];
  versionId: number;
  victoryMe: AudioObject;
  weaponTypes: string[];
  windowTone: [number, number, number, number];
  editor: {
    messageWidth1: number;
    messageWidth2: number;
    jsonFormatLevel: JsonFormatLevel
  };
  faceSize: number;
  iconSize: number;
  optSplashScreen: boolean;
  optMessageSkip: boolean;
  tileSize: number;
}

export enum JsonFormatLevel {
  MINIFIED = 1,
  PRETTIFIED = 2
}
export enum BattleSystem {
  TURN_BASED = 0,
  ATB_ACTIVE = 1,
  ATB_WAIT = 2
}
