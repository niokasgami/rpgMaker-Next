import { Engine, Stack, Utils } from '../core';
import { SceneBase } from '../scenes';
import { OldBitmap } from '../core/OldBitmap';


export interface IScene {
  initialize(): void;
  create(): Promise<void>;
  start(): void;
  terminate(): Promise<void>;
  update(): void;
}
export class SceneManager {

  private static _scene: SceneBase = null;
  private static _nextScene: SceneBase = null;
  private static _stack: Stack<SceneBase> = new Stack<SceneBase>();
  private static _exiting: boolean;
  private static _previousScene: SceneBase = null;
  private static _previousClass: Function = null;
  private static _backgroundBitmap: OldBitmap = null;
  private static _smoothDeltaTime = 1;
  private static _elapsedTime = 0;

  static async run(sceneClass: SceneBase): Promise<void> {
    try {
      this.initialize();
      this.goto(sceneClass);
      Engine.startGameLoop();
    } catch (err: any) {
      this.catchException(err);
    }
  }

  static initialize() {
    this.checkBrowser();
    this.checkPluginErrors();
    this.initGraphics();
    this.initAudio();
    this.initVideo();
    this.initInput();
    this.setupEventHandlers();
  }

  static checkBrowser(){
    if (!Utils.canUseWebGL()) {
      throw new Error("Your browser does not support WebGL.");
    }
    if (!Utils.canUseWebAudioAPI()) {
      throw new Error("Your browser does not support Web Audio API.");
    }
    if (!Utils.canUseCssFontLoading()) {
      throw new Error("Your browser does not support CSS Font Loading.");
    }
    if (!Utils.canUseIndexedDB()) {
      throw new Error("Your browser does not support IndexedDB.");
    }
  }

  static checkPluginErrors(){
    // @todo implement plugins at a later date.
  }

  static initGraphics() {
    if (!Engine.initialize()) {
      throw new Error("Failed to initialize graphics.");
    }
    Engine.setTickHandler(this.update.bind(this));
  }

  static initAudio() {
    // @todo implement audio
  }

  static initVideo() {
    // @todo implement video
  }

  static initInput() {
    // @todo implement inputs
  }

  static setupEventHandlers() {
    window.addEventListener("error", this.onError.bind(this));
    window.addEventListener("unhandledrejection", this.onReject.bind(this));
    window.addEventListener("unload", this.onUnload.bind(this));
    document.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  static update(deltaTime: number){
    try {
      const n = this.determineRepeatNumber(deltaTime);
      for (let i = 0; i < n; i++) {
        this.updateMain();
      }
    } catch (e) {
      this.catchException(e);
    }
  }

  static determineRepeatNumber(deltaTime: number){
    // [Note] We consider environments where the refresh rate is higher than
    //   60Hz, but ignore sudden irregular deltaTime.
    this._smoothDeltaTime *= 0.8;
    this._smoothDeltaTime += Math.min(deltaTime, 2) * 0.2;
    if (this._smoothDeltaTime >= 0.9) {
      this._elapsedTime = 0;
      return Math.round(this._smoothDeltaTime);
    } else {
      this._elapsedTime += deltaTime;
      if (this._elapsedTime >= 1) {
        this._elapsedTime -= 1;
        return 1;
      }
      return 0;
    }
  }

  static terminate(){
    if (Utils.isNwjs()) {
      nw.App.quit();
    }
  }

  static onError(event: ErrorEvent) {
    console.error(event.message);
    console.error(event.filename, event.lineno);
    try {
      this.stop();
      Engine.printError("Error", event.message, event);
      AudioManager.stopAll();
    } catch (e) {
      //
    }
  }

  static onReject(event:PromiseRejectionEvent){
    // Catch uncaught exception in Promise
    // @ts-ignore
    event.message = event.reason;
    // @ts-ignore
    this.onError(event);
  }

  static onUnload(){
    // @todo implement unloading
  }

  static onKeyDown(event: KeyboardEvent){
    if (!event.ctrlKey && !event.altKey) {
      // @todo stop using keycode since it is deprecated.
      switch (event.keyCode) {
        case 116: // F5
          this.reloadGame();
          break;
        case 119: // F8
          this.showDevTools();
          break;
      }
    }
  }

  static reloadGame(){
    if (Utils.isNwjs()) {
      //@ts-ignore
      chrome.runtime.reload();
    }
  }

  static showDevTools(){
    if (Utils.isNwjs() && Utils.isOptionValid("test")) {
      nw.Window.get().showDevTools();
    }
  }

  static catchException(e: ErrorEvent){
    if (e instanceof Error) {
      this.catchNormalError(e);
    } else if (e instanceof Array && e[0] === "LoadError") {
      this.catchLoadError(e as any[]);
    } else {
      this.catchUnknownError(e);
    }
    this.stop();
  }

  static catchNormalError(e:Error){
    // @ts-ignore
    Engine.printError(e.name, e.message, e);
    //@todo implement AudioManager
   // AudioManager.stopAll();
    console.error(e.stack);
  }

  static catchLoadError(e: any[]){
    const url = e[1];
    const retry = e[2];
    Engine.printError("Failed to load", url);
    if (retry) {
      Engine.showRetryButton(() => {
        retry();
        SceneManager.resume();
      });
    } else {
      AudioManager.stopAll();
    }
  }

  static catchUnknownError(e: unknown){
    Engine.printError("UnknownError", String(e));
    AudioManager.stopAll();
  }

  static updateMain(){
    this.updateFrameCount();
    this.updateInputData();
    this.updateEffekseer();
    this.changeScene();
    this.updateScene();
  }

  static updateFrameCount(){
    Engine.frameCount++;
  }

  static updateInputData(){
    //@todo do the input
  }

  static updateEffekseer(){
    // @todo  init effeek
  }

  static async changeScene(){
    if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
      if (this._scene) {
        await this._scene.terminate();
        this.onSceneTerminate();
      }
      this._scene = this._nextScene;
      this._nextScene = null;
      if (this._scene) {
        this.onSceneCreate();
        await this._scene.create();
      }
      if (this._exiting) {
        this.terminate();
      }
    }
  }

  static updateScene(){
    if(this._scene){
      if(this._scene.isStarted()){
        if(this.isGameActive()){
          this._scene.update();
        }
      }  else if (this._scene.isReady()){
        this.onBeforeSceneStart();
        this._scene.start();
        this.onSceneStart();
      }
    }
  }

  static isGameActive(): boolean {
    // [Note] We use "window.top" to support an iframe.
    try {
      return window.top.document.hasFocus();
    } catch (e) {
      // SecurityError
      return true;
    }
  }

  static onSceneTerminate(){
    this._previousScene = this._scene;
    this._previousClass = this._scene.constructor;
    Engine.setStage(null);
  }

  static onSceneCreate(){
    Engine.startLoading();
  }

  static onBeforeSceneStart(){
    if (this._previousScene) {
      this._previousScene.destroy();
      this._previousScene = null;
    }
    if (Engine.effekseer) {
    //  Graphics.effekseer.stopAll();
    }
  }

  static onSceneStart(){
    Engine.endLoading();
    Engine.setStage(this._scene);
  }

  static isSceneChanging(){
    return this._exiting || !!this._nextScene;
  }
}
