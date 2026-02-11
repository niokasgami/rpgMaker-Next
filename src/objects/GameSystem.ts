import { AudioObject } from '@data/RPG';
import { $dataMap, $dataSystem } from '@managers';
import { Engine } from '@core';


/**
 * The game object class for the system data.
 */
export class GameSystem {
  private _saveEnabled: boolean;
  private _menuEnabled: boolean;
  private _encounterEnabled: boolean;
  private _formationEnabled: boolean;
  private _battleCount: number;
  private _winCount: number;
  private _escapeCount: number;
  private _saveCount: number;
  private _versionId: number;
  private _savefileId: number;
  private _framesOnSave: number;
  private _bgmOnSave: AudioObject;
  private _bgsOnSave: AudioObject;
  private _windowTone: [number, number, number, number];
  private _battleBgm: AudioObject;
  private _victoryMe: AudioObject;
  private _defeatMe: AudioObject;
  private _savedBgm: AudioObject;
  private _walkingBgm: AudioObject;

  constructor(...args: any[]) {
    this.initialize(...args);
  }

  initialize(...args: any[]) {
    this._saveEnabled = true;
    this._menuEnabled = true;
    this._encounterEnabled = true;
    this._formationEnabled = true;
    this._battleCount = 0;
    this._winCount = 0;
    this._escapeCount = 0;
    this._saveCount = 0;
    this._versionId = 0;
    this._savefileId = 0;
    this._framesOnSave = 0;
    this._bgmOnSave = null;
    this._bgsOnSave = null;
    this._windowTone = null;
    this._battleBgm = null;
    this._victoryMe = null;
    this._defeatMe = null;
    this._savedBgm = null;
    this._walkingBgm = null;
  }

  /**
   * Check whether the game is currently in Japanese.
   */
  isJapanese(): boolean {
    return $dataSystem.locale.startsWith('ja');
  }

  /**
   * Check whether the game is currently in Chinese.
   */
  isChinese(): boolean {
    return $dataSystem.locale.startsWith('zh');
  }

  /**
   * Check whether the game is currently in Korean.
   */
  isKorean(): boolean {
    return $dataSystem.locale.startsWith('ko');
  }

  /**
   * Check if the current locale uses CJK (Chinese, Japanese, Korean) characters.
   * Used to determine text rendering and font selection.
   */
  isCJK(): boolean {
    return /^(ja|zh|ko)/.test($dataSystem.locale);
  }

  /**
   * Check whether the game is currently in Russian.
   */
  isRussian() {
    return $dataSystem.locale.startsWith('ru');
  }

  /**
   * Check whether the battle system is in sideview.
   */
  isSideView(): boolean {
    return $dataSystem.optSideView;
  }

  /**
   * Check whether the game autosave feature is enabled or not.
   */
  isAutosaveEnabled(): boolean {
    return $dataSystem.optAutosave;
  }

  /**
   * Check whether the game currently skips messages.
   */
  isMessageSkipEnabled(): boolean {
    return $dataSystem.optMessageSkip;
  }

  /**
   * return whether the save mode is enabled.
   */
  isSaveEnabled(): boolean {
    return this._saveEnabled;
  }

  /**
   * disable saving in game.
   */
  disableSave() {
    this._saveEnabled = false;
  }

  /**
   * enable saving in game.
   */
  enableSave() {
    this._saveEnabled = true;
  }

  /**
   * return whether menu is enabled or not.
   */
  isMenuEnabled(): boolean {
    return this._menuEnabled;
  }

  /**
   * disable access to the menu.
   */
  disableMenu() {
    this._menuEnabled = false;
  }

  /**
   * enable access to the menu.
   */
  enableMenu() {
    this._menuEnabled = true;
  }

  /**
   * return whether randoms battle encounter is enabled or not.
   */
  isEncounterEnabled(): boolean {
    return this._encounterEnabled;
  }


  /**
   * disable random battle encounter in the game.
   */
  disableEncounter() {
    this._encounterEnabled = false;
  }

  /**
   * enable random battle encounter in the game.
   */
  enableEncounter() {
    this._encounterEnabled = true;
  }

  /**
   * return whether party followers are enabled on the map or not.
   */
  isFormationEnabled(): boolean {
    return this._formationEnabled;
  }

  /**
   * disable party followers on the map.
   */
  disableFormation() {
    this._formationEnabled = false;
  }

  /**
   * enable party followers on the map.
   */
  enableFormation() {
    this._formationEnabled = false;
  }

  /**
   * return the number of battle process in the current savefile.
   */
  battleCount(): number {
    return this._battleCount;
  }

  /**
   * return the number of win in the current savefile.
   */
  winCount(): number {
    return this._winCount;
  }

  /**
   * return the number of escape tentative in the current savefile.
   */
  escapeCount(): number {
    return this._escapeCount;
  }

  /**
   * return the number of time a player saved in the current savefile.
   */
  saveCount(): number {
    return this._saveCount;
  }

  /**
   * return the current savefile version id.
   */
  versionId(): number {
    return this._versionId;
  }

  /**
   * return the current savefile id.
   */
  savefileId(): number {
    return this._savefileId;
  }

  /**
   * set the current session to a specific savefileId;
   * @param savefileId - the savefile slot to save to.
   */
  setSavefileId(savefileId: number) {
    this._savefileId = savefileId;
  }

  /**
   * return the window tone
   */
  windowTone(): [number, number, number, number] {
    return this._windowTone || $dataSystem.windowTone;
  }

  /**
   * set the window tone.
   * @param windowTone - the color in RGBA
   */
  setWindowTone(windowTone: [number, number, number, number]) {
    this._windowTone = windowTone;
  }

  /**
   * return the current battle music
   * @remarks it will default to the system one set in the editor if no music is set.
   */
  battleBgm(): AudioObject {
    return this._battleBgm || $dataSystem.battleBgm;
  }

  /**
   * set the current battle music.
   * @param bgm - the audio object.
   */
  setBattleBgm(bgm: AudioObject) {
    this._battleBgm = bgm;
  }

  /**
   * return the Victory music effect.
   * @remarks it will default to the system one set in the editor if no music is set.
   */
  victoryMe(): AudioObject {
    return this._victoryMe || $dataSystem.victoryMe;
  }

  /**
   * set the current victory music effect
   * @param victoryMe - the audio object
   */
  setVictoryMe(victoryMe: AudioObject) {
    this._victoryMe = victoryMe;
  }

  /**
   * return the game over music effect.
   * @remarks it will default to the system one set in the editor if no music is set.
   */
  defeatMe(): AudioObject {
    return this._defeatMe || $dataSystem.defeatMe;
  }

  /**
   * set the game over music.
   * @param defeatMe - the audio object.
   */
  setDefeatMe(defeatMe: AudioObject) {
    this._defeatMe = defeatMe;
  }

  /**
   * Increase the battle count.
   */
  onBattleStart(){
    this._battleCount++;
  }

  /**
   * Increase the win count.
   */
  onBattleWin(){
    this._winCount++;
  }

  /**
   * Increase the escape count.
   */
  onBattleEscape(){
    this._escapeCount++;
  }

  /**
   * Action processed before a savefile is compiled.
   */
  onBeforeSave(){
    this._saveCount++;
    this._versionId = $dataSystem.versionId;
    this._framesOnSave = Engine.frameCount;
    this._bgmOnSave = AudioManager.saveBgm();
    this._bgsOnSave = AudioManager.saveBgs();
  }

  /**
   * Action processed after a save is decompiled.
   */
  onAfterLoad(){
    Engine.frameCount = this._framesOnSave;
    AudioManager.playBgm(this._bgmOnSave);
    AudioManager.playBgs(this._bgsOnSave);
  }

  /**
   * return the current session playtime.
   */
  playtime(): number {
    return Math.floor(Engine.frameCount / 60);
  }

  /**
   * return the play time in formated text format.
   */
  playtimeText(): string {
    const hour = Math.floor(this.playtime() / 60 / 60);
    const min = Math.floor(this.playtime() / 60) % 60;
    const sec = this.playtime() % 60;
    return hour.padZero(2) + ":" + min.padZero(2) + ":" + sec.padZero(2);
  }

  /**
   * save the current active background music.
   */
  saveBgm(){
    this._savedBgm = AudioManager.saveBgm();
  }

  /**
   * resume the play of a previously saved background music.
   */
  replayBgm(){
    if (this._savedBgm) {
      AudioManager.replayBgm(this._savedBgm);
    }
  }

  /**
   * save the walking background music
   */
  saveWalkingBgm(){
    this._walkingBgm = AudioManager.saveBgm();
  }

  /**
   * resume the current saved walking background music
   */
  replayWalkingBgm(){
    if (this._walkingBgm) {
      AudioManager.playBgm(this._walkingBgm);
    }
  }

  /**
   * save the map-bound background walking music
   */
  saveWalkingBgm2(){
    this._walkingBgm = $dataMap.bgm;
  }

  /**
   * return the main font face of the game
   */
  mainFontFace(): string {
    return "rmmz-mainfont, " + $dataSystem.advanced.fallbackFonts;
  }

  /**
   * return the number font face
   */
  numberFontFace(): string {
    return "rmmz-numberfont, " + this.mainFontFace();
  }

  /**
   * return the font main size.
   */
  mainFontSize(): number {
    return $dataSystem.advanced.fontSize;
  }

  /**
   * return the windows default padding.
   */
  windowPadding(): number {
    return 12;
  }

  /**
   * return the window opacity.
   */
  windowOpacity(): number {
    return $dataSystem.advanced.windowOpacity;
  }
}
