// SceneManager
//
// The static class that manages scene transitions.

class SceneManager {
  static _scene = null;
  static _nextScene = null;
  static _stack = [];
  static _exiting = false;
  static _previousScene = null;
  static _previousClass = null;
  static _backgroundBitmap = null;
  static _smoothDeltaTime = 1;
  static _elapsedTime = 0;

  constructor() {
    throw new Error("This is a static class");
  }

  static run(sceneClass) {
    try {
      this.initialize();
      this.goto(sceneClass);
      Graphics.startGameLoop();
    } catch (e) {
      this.catchException(e);
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

  static checkBrowser() {
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

  static checkPluginErrors() {
    PluginManager.checkErrors();
  }

  static initGraphics() {
    if (!Graphics.initialize()) {
      throw new Error("Failed to initialize graphics.");
    }
    Graphics.setTickHandler(this.update.bind(this));
  }

  static initAudio() {
    WebAudio.initialize();
  }

  static initVideo() {
    Video.initialize(Graphics.width, Graphics.height);
  }

  static initInput() {
    Input.initialize();
    TouchInput.initialize();
  }

  static setupEventHandlers() {
    window.addEventListener("error", this.onError.bind(this));
    window.addEventListener("unhandledrejection", this.onReject.bind(this));
    window.addEventListener("unload", this.onUnload.bind(this));
    document.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  static update(deltaTime) {
    try {
      const n = this.determineRepeatNumber(deltaTime);
      for (let i = 0; i < n; i++) {
        this.updateMain();
      }
    } catch (e) {
      this.catchException(e);
    }
  }

  static determineRepeatNumber(deltaTime) {
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

  static terminate() {
    if (Utils.isNwjs()) {
      nw.App.quit();
    }
  }

  static onError(event) {
    console.error(event.message);
    console.error(event.filename, event.lineno);
    try {
      this.stop();
      Graphics.printError("Error", event.message, event);
      AudioManager.stopAll();
    } catch (e) {
      //
    }
  }

  static onReject(event) {
    // Catch uncaught exception in Promise
    event.message = event.reason;
    this.onError(event);
  }

  static onUnload() {
    ImageManager.clear();
    EffectManager.clear();
    AudioManager.stopAll();
  }

  static onKeyDown(event) {
    if (!event.ctrlKey && !event.altKey) {
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

  static reloadGame() {
    if (Utils.isNwjs()) {
      chrome.runtime.reload();
    }
  }

  static showDevTools() {
    if (Utils.isNwjs() && Utils.isOptionValid("test")) {
      nw.Window.get().showDevTools();
    }
  }

  static catchException(e) {
    if (e instanceof Error) {
      this.catchNormalError(e);
    } else if (e instanceof Array && e[0] === "LoadError") {
      this.catchLoadError(e);
    } else {
      this.catchUnknownError(e);
    }
    this.stop();
  }

  static catchNormalError(e) {
    Graphics.printError(e.name, e.message, e);
    AudioManager.stopAll();
    console.error(e.stack);
  }

  static catchLoadError(e) {
    const url = e[1];
    const retry = e[2];
    Graphics.printError("Failed to load", url);
    if (retry) {
      Graphics.showRetryButton(() => {
        retry();
        SceneManager.resume();
      });
    } else {
      AudioManager.stopAll();
    }
  }

  static catchUnknownError(e) {
    Graphics.printError("UnknownError", String(e));
    AudioManager.stopAll();
  }

  static updateMain() {
    this.updateFrameCount();
    this.updateInputData();
    this.updateEffekseer();
    this.changeScene();
    this.updateScene();
  }

  static updateFrameCount() {
    Graphics.frameCount++;
  }

  static updateInputData() {
    Input.update();
    TouchInput.update();
  }

  static updateEffekseer() {
    if (Graphics.effekseer && this.isGameActive()) {
      Graphics.effekseer.update();
    }
  }

  static changeScene() {
    if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
      if (this._scene) {
        this._scene.terminate();
        this.onSceneTerminate();
      }
      this._scene = this._nextScene;
      this._nextScene = null;
      if (this._scene) {
        this._scene.create();
        this.onSceneCreate();
      }
      if (this._exiting) {
        this.terminate();
      }
    }
  }

  static updateScene() {
    if (this._scene) {
      if (this._scene.isStarted()) {
        if (this.isGameActive()) {
          this._scene.update();
        }
      } else if (this._scene.isReady()) {
        this.onBeforeSceneStart();
        this._scene.start();
        this.onSceneStart();
      }
    }
  }

  static isGameActive() {
    // [Note] We use "window.top" to support an iframe.
    try {
      return window.top.document.hasFocus();
    } catch (e) {
      // SecurityError
      return true;
    }
  }

  static onSceneTerminate() {
    this._previousScene = this._scene;
    this._previousClass = this._scene.constructor;
    Graphics.setStage(null);
  }

  static onSceneCreate() {
    Graphics.startLoading();
  }

  static onBeforeSceneStart() {
    if (this._previousScene) {
      this._previousScene.destroy();
      this._previousScene = null;
    }
    if (Graphics.effekseer) {
      Graphics.effekseer.stopAll();
    }
  }

  static onSceneStart() {
    Graphics.endLoading();
    Graphics.setStage(this._scene);
  }

  static isSceneChanging() {
    return this._exiting || !!this._nextScene;
  }

  static isCurrentSceneBusy() {
    return this._scene && this._scene.isBusy();
  }

  static isNextScene(sceneClass) {
    return this._nextScene && this._nextScene.constructor === sceneClass;
  }

  static isPreviousScene(sceneClass) {
    return this._previousClass === sceneClass;
  }

  static goto(sceneClass) {
    if (sceneClass) {
      this._nextScene = new sceneClass();
    }
    if (this._scene) {
      this._scene.stop();
    }
  }

  static push(sceneClass) {
    this._stack.push(this._scene.constructor);
    this.goto(sceneClass);
  }

  static pop() {
    if (this._stack.length > 0) {
      this.goto(this._stack.pop());
    } else {
      this.exit();
    }
  }

  static exit() {
    this.goto(null);
    this._exiting = true;
  }

  static clearStack() {
    this._stack = [];
  }

  static stop() {
    Graphics.stopGameLoop();
  }

  static prepareNextScene() {
    this._nextScene.prepare(...arguments);
  }

  static snap() {
    return Bitmap.snap(this._scene);
  }

  static snapForBackground() {
    if (this._backgroundBitmap) {
      this._backgroundBitmap.destroy();
    }
    this._backgroundBitmap = this.snap();
  }

  static backgroundBitmap() {
    return this._backgroundBitmap;
  }

  static resume() {
    TouchInput.update();
    Graphics.startGameLoop();
  }
}

