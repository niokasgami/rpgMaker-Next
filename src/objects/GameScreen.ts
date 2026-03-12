/**
 * The game object class for screen effect data, such as changes in color tone and flashes
 */
import { $gameParty } from '@managers';
import { EasingType, GamePicture } from '@objects/GamePicture.ts';

export type WeatherType = "none" | "rain" | "snow" | "storm" | "";

export class GameScreen {


  private _brightness: number;


  private _zoomX: number;
  private _zoomY: number;
  private _zoomScale: number;
  private _zoomScaleTarget: number;
  private _zoomDuration: number;

  private _weatherType: WeatherType;
  private _weatherPower: number;
  private _weatherPowerTarget: number;
  private _weatherDuration: number;

  private _pictures: GamePicture[];

  private _fadeOutDuration: number;
  private _fadeInDuration: number;

  private _tone: number[];
  private _toneTarget: number[];
  private _toneDuration: number;

  private _flashColor: number[];
  private _flashDuration: number;
  private _shakePower: number;
  private _shakeSpeed: number;
  private _shakeDuration: number;
  private _shakeDirection: number;
  private _shake: number;

  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this.clear();
  }

  clear() {
    this.clearFade();
    this.clearTone();
    this.clearFlash();
    this.clearShake();
    this.clearZoom();
    this.clearWeather();
    this.clearPictures();
  }

  onBattleStart(){
    this.clearFade();
    this.clearFlash();
    this.clearShake();
    this.clearZoom();
    this.eraseBattlePictures();
  }

  get brightness(): number {
    return this._brightness;
  }

  get tone(): number[] {
    return this._tone;
  }

  get flashColor(): number[] {
    return this._flashColor
  }

  get shake(): number {
    return this._shake;
  }

  get zoomX(): number {
    return this._zoomX;
  }

  get zoomY(): number {
    return this._zoomY;
  }

  get zoomScale(): number {
    return this._zoomScale;
  }

  get weatherType(): WeatherType {
    return this._weatherType;
  }

  get weatherPower(): number {
    return this._weatherPower;
  }

  picture(pictureId: number): GamePicture{
    const realPictureId = this.realPictureId(pictureId);
    return this._pictures[realPictureId];
  }

  realPictureId(pictureId: number): number {
    if ($gameParty.inBattle()) {
      return pictureId + this.maxPictures();
    } else {
      return pictureId;
    }
  }

  clearFade() {
    this._brightness = 255;
    this._fadeOutDuration = 0;
    this._fadeInDuration = 0;
  }

  clearTone(){
    this._tone = [0, 0, 0, 0];
    this._toneTarget = [0, 0, 0, 0];
    this._toneDuration = 0;
  }

  clearFlash(){
    this._flashColor = [0, 0, 0, 0];
    this._flashDuration = 0;
  }

  clearShake(){
    this._shakePower = 0;
    this._shakeSpeed = 0;
    this._shakeDuration = 0;
    this._shakeDirection = 1;
    this._shake = 0;
  }

  clearZoom(){
    this._zoomX = 0;
    this._zoomY = 0;
    this._zoomScale = 1;
    this._zoomScaleTarget = 1;
    this._zoomDuration = 0;
  }

  clearWeather(){
    this._weatherType = "none";
    this._weatherPower = 0;
    this._weatherPowerTarget = 0;
    this._weatherDuration = 0;
  }

  clearPictures(){
    this._pictures = [];
  }

  eraseBattlePictures(){
    this._pictures = this._pictures.slice(0, this.maxPictures() + 1);
  }

  maxPictures(){
    return 100;
  }

  startFadeOut(duration: number){
    this._fadeOutDuration = duration;
    this._fadeInDuration = 0;
  }

  startFadeIn(duration: number){
    this._fadeInDuration = duration;
    this._fadeOutDuration = 0;
  }

  startTint(tone: number[],duration: number){
    this._toneTarget = tone.clone();
    this._toneDuration = duration;
    if (this._toneDuration !== 0) return;

    this._tone = this._toneTarget.clone();
  }

  startFlash(color: number[],duration: number){
    this._flashColor = color.clone();
    this._flashDuration = duration;
  }

  startShake(power: number, speed: number, duration: number){
    this._shakePower = power;
    this._shakeSpeed = speed;
    this._shakeDuration = duration;
  }

  startZoom(x: number,y: number,scale: number, duration: number){
    this._zoomX = x;
    this._zoomY = y;
    this._zoomScaleTarget = scale;
    this._zoomDuration = duration;
  }

  setZoom(x: number,y: number,scale: number){
    this._zoomX = x;
    this._zoomY = y;
    this._zoomScale = scale;
  }

  changeWeather(type: WeatherType, power: number, duration: number){
    if (type !== "none" || duration === 0) {
      this._weatherType = type;
    }
    this._weatherPowerTarget = type === "none" ? 0 : power;
    this._weatherDuration = duration;
    if (duration === 0) {
      this._weatherPower = this._weatherPowerTarget;
    }
  }

  update(){
    this.updateFadeOut();
    this.updateFadeIn();
    this.updateTone();
    this.updateFlash();
    this.updateShake();
    this.updateZoom();
    this.updateWeather();
    this.updatePictures();
  }

  updateFadeOut(){
    if (this._fadeOutDuration > 0) {
      const d = this._fadeOutDuration;
      this._brightness = (this._brightness * (d - 1)) / d;
      this._fadeOutDuration--;
    }
  }

  updateFadeIn(){
    if (this._fadeInDuration > 0) {
      const d = this._fadeInDuration;
      this._brightness = (this._brightness * (d - 1) + 255) / d;
      this._fadeInDuration--;
    }
  }

  updateTone(){
    if (this._toneDuration > 0) {
      const d = this._toneDuration;
      for (let i = 0; i < 4; i++) {
        this._tone[i] = (this._tone[i] * (d - 1) + this._toneTarget[i]) / d;
      }
      this._toneDuration--;
    }
  }

  updateFlash(){
    if (this._flashDuration > 0) {
      const d = this._flashDuration;
      this._flashColor[3] *= (d - 1) / d;
      this._flashDuration--;
    }
  }

  updateShake(){
    if (this._shakeDuration > 0 || this._shake !== 0) {
      const delta =
        (this._shakePower * this._shakeSpeed * this._shakeDirection) / 10;
      if (
        this._shakeDuration <= 1 &&
        this._shake * (this._shake + delta) < 0
      ) {
        this._shake = 0;
      } else {
        this._shake += delta;
      }
      if (this._shake > this._shakePower * 2) {
        this._shakeDirection = -1;
      }
      if (this._shake < -this._shakePower * 2) {
        this._shakeDirection = 1;
      }
      this._shakeDuration--;
    }
  }

  updateZoom(){
    if (this._zoomDuration > 0) {
      const d = this._zoomDuration;
      const t = this._zoomScaleTarget;
      this._zoomScale = (this._zoomScale * (d - 1) + t) / d;
      this._zoomDuration--;
    }
  }

  updateWeather(){
    if (this._weatherDuration > 0) {
      const d = this._weatherDuration;
      const t = this._weatherPowerTarget;
      this._weatherPower = (this._weatherPower * (d - 1) + t) / d;
      this._weatherDuration--;
      if (this._weatherDuration === 0 && this._weatherPowerTarget === 0) {
        this._weatherType = "none";
      }
    }
  }

  updatePictures(){
    for (const picture of this._pictures) {
      if (picture) {
        picture.update();
      }
    }
  }

  startFlashForDamage(){
    this.startFlash([255, 0, 0, 128], 8);
  }

  showPicture(pictureId: number, name: string, origin: number, x: number, y: number,
              scaleX: number, scaleY: number, opacity: number, blendMode: number){

    const realPictureId = this.realPictureId(pictureId);
    const picture = new GamePicture();
    picture.show(name, origin, x, y, scaleX, scaleY, opacity, blendMode);
    this._pictures[realPictureId] = picture;
  }

  //TODO : make the parameters a lil better
  movePicture(    pictureId: number, origin: number, x:number, y: number, scaleX: number, scaleY: number, opacity: number, blendMode: number, duration: number,
                  easingType: EasingType) {
    const picture = this.picture(pictureId);
    if (picture) {
      // prettier-ignore
      picture.move(origin, x, y, scaleX, scaleY, opacity, blendMode,
        duration, easingType);
    }
  }

  rotatePicture(pictureId: number, speed: number) {
    const picture = this.picture(pictureId);
    if (picture) {
      picture.rotate(speed);
    }
  }

  tintPicture(pictureId: number, tone: number[], duration: number) {
    const picture = this.picture(pictureId);
    if (picture) {
      picture.tint(tone, duration);
    }
  }

  erasePicture(pictureId: number){
    const realPictureId = this.realPictureId(pictureId);
    this._pictures[realPictureId] = null;
  }
}
