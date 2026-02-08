import {Application, Ticker, WebGLRenderer} from "pixi.js";
import EffekseerContext = effekseer.EffekseerContext;
import {Stage} from "./Stage";
import {Utils} from "./Utils";
import {FPSCounter} from "./FpsCounter";
import {Video} from "./Video";

/**
 * The game engine that initializes and manages the application.
 *
 * Handles:
 * - PixiJS application initialization
 * - Canvas and display management
 * - Game loop and rendering
 * - Error handling and loading states
 * - Screen resizing and fullscreen
 *
 * @remarks
 * Previously named `Graphics` in RPG Maker MZ, but was renamed to `Engine`
 * to avoid naming conflicts with PixiJS's `Graphics` class when using ESM imports.
 *
 * @since 2.0.0
 * @example
 * ```typescript
 * await Engine.initialize();
 * Engine.resize(800, 600);
 * Engine.startGameLoop();
 * Engine.setStage(new GameStage());
 * ```
 */
export class Engine {

  private static _width: number;
  private static _height: number;
  private static _defaultScale: number;
  private static _realScale: number;
  private static _errorPrinter: HTMLDivElement;
  private static _tickHandler: (delta: number) => void;
  private static _canvas: HTMLCanvasElement;
  private static _fpsCounter : FPSCounter;
  private static _loadingSpinner: HTMLDivElement;
  private static _stretchEnabled: boolean;
  private static _app: Application<WebGLRenderer<HTMLCanvasElement>>;
  private static _effekseer: EffekseerContext;
  private static _wasLoading: boolean;

  public static frameCount: number;
  public static boxWidth: number;
  public static boxHeight: number;

  static async initialize(): Promise<boolean>{
    this._width = 0;
    this._height = 0;
    this._defaultScale = 1;
    this._realScale = 1;
    this._errorPrinter = null;
    this._tickHandler = null;
    this._canvas = null;
    this._fpsCounter = null;
    this._loadingSpinner = null;
    this._stretchEnabled = this._defaultStretchMode();
    this._app = null;
    this._effekseer = null;
    this._wasLoading = false;

    /**
     * The total frame count of the game screen.
     *
     * @type number
     * @name Engine.frameCount
     */
    this.frameCount = 0;

    /**
     * The width of the window display area.
     *
     * @type number
     * @name Engine.boxWidth
     */
    this.boxWidth = this._width;

    /**
     * The height of the window display area.
     *
     * @type number
     * @name Engine.boxHeight
     */
    this.boxHeight = this._height;

    this._updateRealScale();
    this._createAllElements();
    this._disableContextMenu();
    this._setupEventHandlers();
    await this._createPixiApp();
    // this._createEffekseerContext();

    return !!this._app;
  }

  static setTickHandler(handler: (delta: number) => void) {
    this._tickHandler = handler;
  }

  static startGameLoop(){
    if(this._app) this._app.start();
  }

  static stopGameLoop(){
    if(this._app) this._app.stop();
  }

  static setStage(stage: Stage) {
    if(this._app) this._app.stage = stage;
  }

  /**
   * Shows the loading spinner.
   */
  static startLoading() {
    if (!document.getElementById("loadingSpinner")) {
      document.body.appendChild(this._loadingSpinner);
    }
  }

  /**
   * Erases the loading spinner.
   *
   * @returns {boolean} True if the loading spinner was active.
   */
  static endLoading() {
    if (document.getElementById("loadingSpinner")) {
      document.body.removeChild(this._loadingSpinner);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Displays the error text to the screen.
   *
   * @param {string} name - The name of the error.
   * @param {string} message - The message of the error.
   * @param {Error} [_error] - The error object.
   */
  static printError(name: string, message: string, _error: ErrorEvent = null) {
    if (!this._errorPrinter) {
      this._createErrorPrinter();
    }
    this._errorPrinter.innerHTML = this._makeErrorHtml(name, message);
    this._wasLoading = this.endLoading();
    this._applyCanvasFilter();
  }

  /**
   * Displays a button to try to reload resources.
   *
   * @param {function} retry - The callback function to be called when the button
   *                           is pressed.
   */
  static showRetryButton(retry: () => void) {
    const button = document.createElement("button");
    button.id = "retryButton";
    button.innerHTML = "Retry";
    // [Note] stopPropagation() is required for iOS Safari.
    button.ontouchstart = e => e.stopPropagation();
    button.onclick = () => {
      Engine.eraseError();
      retry();
    };
    this._errorPrinter.appendChild(button);
    button.focus();
  }

  /**
   * Erases the loading error text.
   */
  static eraseError() {
    if (this._errorPrinter) {
      this._errorPrinter.innerHTML = this._makeErrorHtml();
      if (this._wasLoading) {
        this.startLoading();
      }
    }
    this._clearCanvasFilter();
  }

  /**
   * Converts an x coordinate on the page to the corresponding
   * x coordinate on the canvas area.
   *
   * @param {number} x - The x coordinate on the page to be converted.
   * @returns {number} The x coordinate on the canvas area.
   */
  static pageToCanvasX(x: number): number {
    if (this._canvas) {
      const left = this._canvas.offsetLeft;
      return Math.round((x - left) / this._realScale);
    } else {
      return 0;
    }
  }


  /**
   * Converts a y coordinate on the page to the corresponding
   * y coordinate on the canvas area.
   *
   * @param {number} y - The y coordinate on the page to be converted.
   * @returns {number} The y coordinate on the canvas area.
   */
  static pageToCanvasY(y: number): number {
    if (this._canvas) {
      const top = this._canvas.offsetTop;
      return Math.round((y - top) / this._realScale);
    } else {
      return 0;
    }
  }

  /**
   * Checks whether the specified point is inside the game canvas area.
   *
   * @param {number} x - The x coordinate on the canvas area.
   * @param {number} y - The y coordinate on the canvas area.
   * @returns {boolean} True if the specified point is inside the game canvas area.
   */
  static isInsideCanvas(x: number, y: number): boolean {
    return x >= 0 && x < this._width && y >= 0 && y < this._height;
  }


  /**
   * Shows the game screen.
   */
  static showScreen() {
    this._canvas.style.opacity = "1";
  }

  /**
   * Hides the game screen.
   */
  static hideScreen() {
    this._canvas.style.opacity = "0";
  }

  /**
   * Changes the size of the game screen.
   *
   * @param {number} width - The width of the game screen.
   * @param {number} height - The height of the game screen.
   */
  static resize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._app.renderer.resize(width, height);
    this._updateAllElements();
  }

  private static _createAllElements() {
    this._createErrorPrinter();
    this._createCanvas();
    this._createLoadingSpinner();
    this._createFPSCounter();
  }

  private static _updateAllElements() {
    this._updateRealScale();
    this._updateErrorPrinter();
    this._updateCanvas();
    this._updateVideo();
  }

  private static _onTick(ticker: Ticker) {
    this._fpsCounter.startTick();
    if (this._tickHandler) {
      this._tickHandler(ticker.deltaTime);
    }
    if (this._canRender()) {
      this._app.render();
    }
    this._fpsCounter.endTick();
  }

  private static _canRender() : boolean{
    return !!this._app.stage;
  }

  private static _updateRealScale() {
    if (this._stretchEnabled && this._width > 0 && this._height > 0) {
      const h = this._stretchWidth() / this._width;
      const v = this._stretchHeight() / this._height;
      this._realScale = Math.min(h, v);
      window.scrollTo(0, 0);
    } else {
      this._realScale = this._defaultScale;
    }
  }

  private static _stretchWidth() {
    if (Utils.isMobileDevice()) {
      return document.documentElement.clientWidth;
    } else {
      return window.innerWidth;
    }
  }

  private static _stretchHeight() {
    if (Utils.isMobileDevice()) {
      // [Note] Mobile browsers often have special operations at the top and
      //   bottom of the screen.
      const rate = Utils.isLocal() ? 1.0 : 0.9;
      return document.documentElement.clientHeight * rate;
    } else {
      return window.innerHeight;
    }
  }

  static _makeErrorHtml(name?: string, message?: string /*, error*/): string {
    const nameDiv = document.createElement("div");
    const messageDiv = document.createElement("div");
    nameDiv.id = "errorName";
    messageDiv.id = "errorMessage";
    nameDiv.innerHTML = Utils.escapeHtml(name || "");
    messageDiv.innerHTML = Utils.escapeHtml(message || "");
    return nameDiv.outerHTML + messageDiv.outerHTML;
  }

  static _defaultStretchMode() {
    return Utils.isNwjs() || Utils.isMobileDevice();
  }

  static _createErrorPrinter() {
    this._errorPrinter = document.createElement("div");
    this._errorPrinter.id = "errorPrinter";
    this._errorPrinter.innerHTML = this._makeErrorHtml();
    document.body.appendChild(this._errorPrinter);
  }

  static _updateErrorPrinter() {
    const width = this._width * 0.8 * this._realScale;
    const height = 100 * this._realScale;
    this._errorPrinter.style.width = width + "px";
    this._errorPrinter.style.height = height + "px";
  }

  static _createCanvas() {
    this._canvas = document.createElement("canvas");
    this._canvas.id = "gameCanvas";
    this._updateCanvas();
    document.body.appendChild(this._canvas);
  }

  static _updateCanvas() {
    this._canvas.width = this._width;
    this._canvas.height = this._height;
    this._canvas.style.zIndex = "1";
    this._centerElement(this._canvas);
  }

  static _updateVideo() {
    const width = this._width * this._realScale;
    const height = this._height * this._realScale;
    Video.resize(width, height);
  }

  static _createLoadingSpinner() {
    const loadingSpinner = document.createElement("div");
    const loadingSpinnerImage = document.createElement("div");
    loadingSpinner.id = "loadingSpinner";
    loadingSpinnerImage.id = "loadingSpinnerImage";
    loadingSpinner.appendChild(loadingSpinnerImage);
    this._loadingSpinner = loadingSpinner;
  }

  static _createFPSCounter() {
    this._fpsCounter = new FPSCounter();
  }

  static _centerElement(element: HTMLCanvasElement) {
    const width = element.width * this._realScale;
    const height = element.height * this._realScale;
    element.style.position = "absolute";
    element.style.margin = "auto";
    element.style.top = "0";
    element.style.left = "0";
    element.style.right = "0";
    element.style.bottom = "0";
    element.style.width = width + "px";
    element.style.height = height + "px";
  }

  static _disableContextMenu() {
    const elements = document.body.getElementsByTagName("*");
    const oncontextmenu = () => false;
    for (const element of elements) {
      //@ts-expect-error
      element.oncontextmenu = oncontextmenu;
    }
  }

  static _applyCanvasFilter() {
    if (this._canvas) {
      this._canvas.style.opacity = "0.5";
      this._canvas.style.filter = "blur(8px)";
      this._canvas.style.webkitFilter = "blur(8px)";
    }
  }

  static _clearCanvasFilter() {
    if (this._canvas) {
      this._canvas.style.opacity = "1";
      this._canvas.style.filter = "";
      this._canvas.style.webkitFilter = "";
    }
  }

  static _setupEventHandlers() {
    window.addEventListener("resize", this._onWindowResize.bind(this));
    document.addEventListener("keydown", this._onKeyDown.bind(this));
  }

  static _onWindowResize() {
    this._updateAllElements();
  }

  static _onKeyDown(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.altKey) {
      switch (event.keyCode) {
        case 113: // F2
          event.preventDefault();
          this._switchFPSCounter();
          break;
        case 114: // F3
          event.preventDefault();
          this._switchStretchMode();
          break;
        case 115: // F4
          event.preventDefault();
          this._switchFullScreen();
          break;
      }
    }
  }

  static _switchFPSCounter() {
    this._fpsCounter.switchMode();
  }

  static _switchStretchMode() {
    this._stretchEnabled = !this._stretchEnabled;
    this._updateAllElements();
  }

  static _switchFullScreen() {
    if (this._isFullScreen()) {
      this._cancelFullScreen();
    } else {
      this._requestFullScreen();
    }
  }

  static _isFullScreen() {
    return (
        document.fullScreenElement ||
        document.mozFullScreen ||
        document.webkitFullscreenElement
    );
  }

  static _requestFullScreen() {
    const element = document.body;
    if (element.requestFullScreen) {
      element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      //@ts-expect-error
      element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  }

  static _cancelFullScreen() {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }

  static async _createPixiApp(){
    try {
      this._app = new Application<WebGLRenderer<HTMLCanvasElement>>();
      await this._app.init({
        canvas: this._canvas,
        autoStart: false,
        hello: true,
        textureGCMaxIdle : 600,
      });
      this._app.ticker.remove(this._app.render, this._app);
      this._app.ticker.add(this._onTick, this);

     // await initDevtools(this._app);
      // @ts-ignore
    //  globalThis.__PIXI_APP__ = this._app;
    } catch (e) {
      this._app = null;
    }
  }

  static _createEffekseerContext() {
    if (this._app && window.effekseer) {
      try {
        this._effekseer = effekseer.createContext();
        if (this._effekseer) {
          //@ts-expect-error it shouldnt be accessed but we need the gl in this case
          this._effekseer.init(this._app.renderer.context.gl);
          //@ts-expect-error the ts definitions files of effekseer is so old its hard to get properly.
          this._effekseer.setRestorationOfStatesFlag(false);
        }
      } catch (e) {
        this._app = null;
      }
    }
  }

  static get app(): Application<WebGLRenderer<HTMLCanvasElement>> {
    return this._app;
  }

  static set app(value: Application<WebGLRenderer<HTMLCanvasElement>>) {
    this._app = value;
  }

  static get effekseer(): EffekseerContext {
    return this._effekseer;
  }

  static set effekseer(value: effekseer.EffekseerContext) {
    this._effekseer = value;
  }

  static get width(): number {
    return this._width;
  }

  static set width(value: number) {
    this._width = value;
  }

  static get height(): number {
    return this._height;
  }

  static set height(value: number) {
    this._height = value;
  }

  static get defaultScale(): number {
    return this._defaultScale;
  }

  static set defaultScale(value: number) {
    this._defaultScale = value;
  }
}
