import { ItemType } from '@data/ItemType.ts';
import { Utils } from '@core';


export enum MessageBackground {
  WINDOW = 0,
  DIM = 1,
  TRANSPARENT
}

export enum MessagePositionType {
  TOP = 0,
  MIDDLE = 1,
  BOTTOM = 2,
}

export enum ChoicePositionType {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
}


/**
 * The game object class for the state of the message window that displays text
 * or selections, etc.
 */
export class GameMessage {

  protected _texts: string[];
  protected _choices: string[];
  protected _speakerName: string;
  protected _faceName: string;
  protected _faceIndex: number;
  protected _background: MessageBackground;
  protected _positionType: MessagePositionType;
  protected _choiceDefaultType: number;
  protected _choiceCancelType: number;
  protected _choiceBackground: MessageBackground;
  protected _choicePositionType: ChoicePositionType;
  protected _numInputVariableId: number;
  protected _numInputMaxDigits: number;
  protected _itemChoiceVariableId: number;
  protected _itemChoiceItypeId: ItemType;
  protected _scrollMode: boolean;
  protected _scrollSpeed: number;
  protected _scrollNoFast: boolean;
  protected _choiceCallback;

  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this.clear();
  }

  clear(){
    this._texts = [];
    this._choices = [];
    this._speakerName = "";
    this._faceName = "";
    this._faceIndex = 0;
    this._background = MessageBackground.WINDOW;
    this._positionType = MessagePositionType.BOTTOM;
    this._choiceDefaultType = 0;
    this._choiceCancelType = 0;
    this._choiceBackground = MessageBackground.WINDOW;
    this._choicePositionType = ChoicePositionType.RIGHT;
    this._numInputVariableId = 0;
    this._numInputMaxDigits = 0;
    this._itemChoiceVariableId = 0;
    this._itemChoiceItypeId = 0;
    this._scrollMode = false;
    this._scrollSpeed = 2;
    this._scrollNoFast = false;
    this._choiceCallback = null;
  }

  get choices() : string[] {
    return this._choices;
  }

  get speakerName(): string {
    return this._speakerName;
  }

  get faceName(): string {
    return this._faceName;
  }

  get faceIndex(): number {
    return this._faceIndex;
  }

  get background(): MessageBackground {
    return this._background;
  }

  get positionType(): MessagePositionType {
    return this._positionType;
  }

  get choiceDefaultType(): number {
    return this._choiceDefaultType;
  }

  get choiceCancelType(): number {
    return this._choiceCancelType;
  }

  get choiceBackground(): MessageBackground {
    return this._choiceBackground;
  }

  get choicePositionType(): ChoicePositionType {
    return this._choicePositionType;
  }

  get numInputVariableId(): number {
    return this._numInputVariableId;
  }

  get numInputMaxDigits(): number {
    return this._numInputMaxDigits;
  }

  get itemChoiceVariableId(): number {
    return this._itemChoiceVariableId;
  }

  get ItemChoiceItypeId(): number {
    return this._itemChoiceItypeId;
  }

  get scrollMode(): boolean {
    return this._scrollMode;
  }

  get scrollSpeed(): number {
    return this._scrollSpeed;
  }

  get scrollNoFast(): boolean {
    return this._scrollNoFast;
  }

  add(text: string) {
    this._texts.push(text);
  }

  setSpeakerName(speakerName: string) {
    this._speakerName = speakerName ? speakerName : "";
  }

  setFaceImage(faceName: string, faceIndex: number){
    this._faceName = faceName;
    this._faceIndex = faceIndex;
  }

  setBackground(background: MessageBackground){
    this._background = background;
  }

  setPositionType(positionType: MessagePositionType){
    this._positionType = positionType;
  }

  setChoice(choices: string[], defaultType: number,cancelType: number){
    this._choices = choices;
    this._choiceCancelType = defaultType;
    this._choiceBackground = MessageBackground.WINDOW;
  }

  setChoiceBackground(background: MessageBackground){
    this._choiceBackground = background;
  }

  setChoicePositionType(positionType: ChoicePositionType){
    this._choicePositionType = positionType;
  }

  setNumberInput(variableId: number, maxDigits: number){
    this._numInputVariableId = variableId;
    this._numInputMaxDigits = maxDigits;
  }

  setItemChoice(variableId: number, itemType: ItemType){
    this._itemChoiceVariableId = variableId;
    this._itemChoiceItypeId = itemType;
  }

  setScroll(speed: number, noFast: boolean){
    this._scrollMode = true;
    this._scrollSpeed = speed;
    this._scrollNoFast = noFast;
  }

  setChoiceCallback(callback){
    this._choiceCallback = callback;
  }

  onChoice(n) {
    if (this._choiceCallback) {
      this._choiceCallback(n);
      this._choiceCallback = null;
    }
  }

  hasText(): boolean {
    return this._texts.length > 0;
  }

  isChoice(): boolean {
    return this._choices.length > 0;
  }

  isNumberInput(): boolean {
    return this._numInputVariableId > 0;
  }

  isItemChoice(): boolean {
    return this._itemChoiceVariableId > 0;
  }

  isBusy(): boolean {
    return (
      this.hasText() ||
      this.isChoice() ||
      this.isNumberInput() ||
      this.isItemChoice()
    );
  }

  newPage() {
    if (this._texts.length > 0) {
      this._texts[this._texts.length - 1] += "\f";
    }
  }

  allText(): string {
    return this._texts.join("\n");
  }

  isRTL(): boolean {
    return Utils.containsArabic(this.allText());
  }
}
