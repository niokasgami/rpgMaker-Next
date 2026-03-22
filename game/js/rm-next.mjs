import { Application, RenderTexture, Graphics, Assets, EventEmitter, Container, Sprite as Sprite$1, FillGradient, Rectangle, Texture, Point, Color, Filter, GlProgram, TextureSource } from 'pixi.js';
import fs from 'fs';
import path from 'path';

/**
 * The static class that defines utility methods.
 * @namespace
 */
class Utils {
    /**
     * Checks whether the current RPG Maker version is greater than or equal to
     * the given version.
     *
     * @param {string} version - The "x.x.x" format string to compare.
     * @returns {boolean} True if the current version is greater than or equal
     *                    to the given version.
     */
    static checkRMVersion(version) {
        const array1 = this.RPGMAKER_VERSION.split(".");
        const array2 = String(version).split(".");
        for (let i = 0; i < array1.length; i++) {
            const v1 = parseInt(array1[i]);
            const v2 = parseInt(array2[i]);
            if (v1 > v2) {
                return true;
            }
            else if (v1 < v2) {
                return false;
            }
        }
        return true;
    }
    /**
     * Checks whether the option is in the query string.
     *
     * @param {string} name - The option name.
     * @returns {boolean} True if the option is in the query string.
     */
    static isOptionValid(name) {
        const args = location.search.slice(1);
        if (args.split("&").includes(name)) {
            return true;
        }
        if (this.isNwjs() && nw.App.argv.length > 0) {
            return nw.App.argv[0].split("&").includes(name);
        }
        return false;
    }
    /**
     * Checks whether the platform is NW.js.
     *
     * @returns {boolean} True if the platform is NW.js.
     */
    static isNwjs() {
        return typeof require === "function" && typeof process === "object";
    }
    /**
     * Checks whether the platform is a mobile device.
     *
     * @returns {boolean} True if the platform is a mobile device.
     */
    static isMobileDevice() {
        const r = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i;
        return !!navigator.userAgent.match(r);
    }
    /**
     * Checks whether the browser is Mobile Safari.
     *
     * @returns {boolean} True if the browser is Mobile Safari.
     */
    static isMobileSafari() {
        const agent = navigator.userAgent;
        return !!(agent.match(/iPhone|iPad|iPod/) &&
            agent.match(/AppleWebKit/) &&
            !agent.match("CriOS"));
    }
    /**
     * Checks whether the browser is Android Chrome.
     *
     * @returns {boolean} True if the browser is Android Chrome.
     */
    static isAndroidChrome() {
        const agent = navigator.userAgent;
        return !!(agent.match(/Android/) && agent.match(/Chrome/));
    }
    /**
     * Checks whether the browser is accessing local files.
     *
     * @returns {boolean} True if the browser is accessing local files.
     */
    static isLocal() {
        return window.location.href.startsWith("file:");
    }
    /**
     * Checks whether the browser supports WebGL.
     *
     * @returns {boolean} True if the browser supports WebGL.
     */
    static canUseWebGL() {
        try {
            const canvas = document.createElement("canvas");
            return !!canvas.getContext("webgl");
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Checks whether the browser supports Web Audio API.
     *
     * @returns {boolean} True if the browser supports Web Audio API.
     */
    static canUseWebAudioAPI() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
    /**
     * Checks whether the browser supports CSS Font Loading.
     *
     * @returns {boolean} True if the browser supports CSS Font Loading.
     */
    static canUseCssFontLoading() {
        return !!(document.fonts && document.fonts.ready);
    }
    /**
     * Checks whether the browser supports IndexedDB.
     *
     * @returns {boolean} True if the browser supports IndexedDB.
     */
    static canUseIndexedDB() {
        return !!(window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB);
    }
    /**
     * Checks whether the browser can play ogg files.
     *
     * @returns {boolean} True if the browser can play ogg files.
     */
    static canPlayOgg() {
        if (!Utils._audioElement) {
            Utils._audioElement = document.createElement("audio");
        }
        return !!(Utils._audioElement &&
            Utils._audioElement.canPlayType('audio/ogg; codecs="vorbis"'));
    }
    /**
     * Checks whether the browser can play webm files.
     *
     * @returns {boolean} True if the browser can play webm files.
     */
    static canPlayWebm() {
        if (!Utils._videoElement) {
            Utils._videoElement = document.createElement("video");
        }
        return !!(Utils._videoElement &&
            Utils._videoElement.canPlayType('video/webm; codecs="vp8, vorbis"'));
    }
    /**
     * Encodes a URI component without escaping slash characters.
     *
     * @param {string} str - The input string.
     * @returns {string} Encoded string.
     */
    static encodeURI(str) {
        return encodeURIComponent(str).replace(/%2F/g, "/");
    }
    /**
     * Gets the filename that does not include subfolders.
     *
     * @param {string} filename - The filename with subfolders.
     * @returns {string} The filename without subfolders.
     */
    static extractFileName(filename) {
        return filename.split("/").pop();
    }
    /**
     * Escapes special characters for HTML.
     *
     * @param {string} str - The input string.
     * @returns {string} Escaped string.
     */
    static escapeHtml(str) {
        const entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
            "/": "&#x2F;"
        };
        // @ts-ignore theres no reason for this to not work so we force ignoring this
        return String(str).replace(/[&<>"'/]/g, s => entityMap[s]);
    }
    /**
     * Checks whether the string contains any Arabic characters.
     *
     * @returns {boolean} True if the string contains any Arabic characters.
     */
    static containsArabic(str) {
        const regExp = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
        return regExp.test(str);
    }
    /**
     * Sets information related to encryption.
     *
     * @param {boolean} hasImages - Whether the image files are encrypted.
     * @param {boolean} hasAudio - Whether the audio files are encrypted.
     * @param {string} key - The encryption key.
     */
    static setEncryptionInfo(hasImages, hasAudio, key) {
        // [Note] This function is implemented for module independence.
        this._hasEncryptedImages = hasImages;
        this._hasEncryptedAudio = hasAudio;
        this._encryptionKey = key;
    }
    /**
     * Checks whether the image files in the game are encrypted.
     *
     * @returns {boolean} True if the image files are encrypted.
     */
    static hasEncryptedImages() {
        return this._hasEncryptedImages;
    }
    /**
     * Checks whether the audio files in the game are encrypted.
     *
     * @returns {boolean} True if the audio files are encrypted.
     */
    static hasEncryptedAudio() {
        return this._hasEncryptedAudio;
    }
    /**
     * Decrypts encrypted data.
     *
     * @param {ArrayBuffer} source - The data to be decrypted.
     * @returns {ArrayBuffer} The decrypted data.
     */
    static decryptArrayBuffer(source) {
        const header = new Uint8Array(source, 0, 16);
        const headerHex = Array.from(header, x => x.toString(16)).join(",");
        if (headerHex !== "52,50,47,4d,56,0,0,0,0,3,1,0,0,0,0,0") {
            throw new Error("Decryption error");
        }
        const body = source.slice(16);
        const view = new DataView(body);
        const key = this._encryptionKey.match(/.{2}/g);
        for (let i = 0; i < 16; i++) {
            view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16));
        }
        return body;
    }
}
/**
 * The name of the RPG Maker. "MZ" in the current version.
 *
 * @type string
 * @constant
 */
Utils.RPGMAKER_NAME = "MZ";
/**
 * The version of the RPG Maker.
 *
 * @type string
 * @constant
 */
Utils.RPGMAKER_VERSION = "1.9.0";

/**
 * the class that handle the FPS Counter
 * @internal
 */
class FPSCounter {
    constructor() {
        this.initialize();
    }
    initialize() {
        this._tickCount = 0;
        this._frameTime = 100;
        this._frameStart = 0;
        this._lastLoop = performance.now() - 100;
        this._showFps = true;
        this.fps = 0;
        this.duration = 0;
        this._createElements();
        this._update();
    }
    startTick() {
        this._frameStart = performance.now();
    }
    endTick() {
        const time = performance.now();
        const thisFrameTime = time - this._lastLoop;
        this._frameTime += (thisFrameTime - this._frameTime) / 12;
        this.fps = 1000 / this._frameTime;
        this.duration = Math.max(0, time - this._frameStart);
        this._lastLoop = time;
        if (this._tickCount++ % 15 === 0) {
            this._update();
        }
    }
    switchMode() {
        if (this._boxDiv.style.display === "none") {
            this._boxDiv.style.display = "block";
            this._showFps = true;
        }
        else if (this._showFps) {
            this._showFps = false;
        }
        else {
            this._boxDiv.style.display = "none";
        }
        this._update();
    }
    _createElements() {
        this._boxDiv = document.createElement("div");
        this._labelDiv = document.createElement("div");
        this._numberDiv = document.createElement("div");
        this._boxDiv.id = "fpsCounterBox";
        this._labelDiv.id = "fpsCounterLabel";
        this._numberDiv.id = "fpsCounterNumber";
        this._boxDiv.style.display = "none";
        this._boxDiv.appendChild(this._labelDiv);
        this._boxDiv.appendChild(this._numberDiv);
        document.body.appendChild(this._boxDiv);
    }
    _update() {
        const count = this._showFps ? this.fps : this.duration;
        this._labelDiv.textContent = this._showFps ? "FPS" : "ms";
        this._numberDiv.textContent = count.toFixed(0);
    }
}

/**
 * The static class that handles video playback.
 *
 * @namespace
 */
class Video {
    /**
     * Initializes the video system.
     *
     * @param {number} width - The width of the video.
     * @param {number} height - The height of the video.
     */
    static initialize(width, height) {
        this._element = null;
        this._loading = false;
        this._volume = 1;
        this._createElement();
        this._setupEventHandlers();
        this.resize(width, height);
    }
    /**
     * Changes the display size of the video.
     *
     * @param {number} width - The width of the video.
     * @param {number} height - The height of the video.
     */
    static resize(width, height) {
        if (this._element) {
            this._element.style.width = width + "px";
            this._element.style.height = height + "px";
        }
    }
    /**
     * Starts playback of a video.
     *
     * @param {string} src - The url of the video.
     */
    static play(src) {
        this._element.src = src;
        this._element.onloadeddata = this._onLoad.bind(this);
        this._element.onerror = this._onError.bind(this);
        this._element.onended = this._onEnd.bind(this);
        this._element.load();
        this._loading = true;
    }
    /**
     * Checks whether the video is playing.
     *
     * @returns {boolean} True if the video is playing.
     */
    static isPlaying() {
        return this._loading || this._isVisible();
    }
    /**
     * Sets the volume for videos.
     *
     * @param {number} volume - The volume for videos (0 to 1).
     */
    static setVolume(volume) {
        this._volume = volume;
        if (this._element) {
            this._element.volume = this._volume;
        }
    }
    static _createElement() {
        this._element = document.createElement("video");
        this._element.id = "gameVideo";
        this._element.style.position = "absolute";
        this._element.style.margin = "auto";
        this._element.style.top = "0";
        this._element.style.left = "0";
        this._element.style.right = "0";
        this._element.style.bottom = "0";
        this._element.style.opacity = "0";
        this._element.style.zIndex = "2";
        this._element.setAttribute("playsinline", "");
        this._element.oncontextmenu = () => false;
        document.body.appendChild(this._element);
    }
    static _onLoad() {
        this._element.volume = this._volume;
        this._element.play();
        this._updateVisibility(true);
        this._loading = false;
    }
    static _onError() {
        this._updateVisibility(false);
        const retry = () => {
            this._element.load();
        };
        throw ["LoadError", this._element.src, retry];
    }
    static _onEnd() {
        this._updateVisibility(false);
    }
    static _updateVisibility(videoVisible) {
        if (videoVisible) {
            Engine.hideScreen();
        }
        else {
            Engine.showScreen();
        }
        this._element.style.opacity = videoVisible ? "1" : "0";
    }
    static _isVisible() {
        return this._element.style.opacity > "0";
    }
    static _setupEventHandlers() {
        const onUserGesture = this._onUserGesture.bind(this);
        document.addEventListener("keydown", onUserGesture);
        document.addEventListener("mousedown", onUserGesture);
        document.addEventListener("touchend", onUserGesture);
    }
    static _onUserGesture() {
        if (!this._element.src && this._element.paused) {
            this._element.play().catch(() => 0);
        }
    }
}

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
class Engine {
    static async initialize() {
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
    static setTickHandler(handler) {
        this._tickHandler = handler;
    }
    static startGameLoop() {
        if (this._app)
            this._app.start();
    }
    static stopGameLoop() {
        if (this._app)
            this._app.stop();
    }
    static setStage(stage) {
        if (this._app)
            this._app.stage = stage;
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
        }
        else {
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
    static printError(name, message, _error = null) {
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
    static showRetryButton(retry) {
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
    static pageToCanvasX(x) {
        if (this._canvas) {
            const left = this._canvas.offsetLeft;
            return Math.round((x - left) / this._realScale);
        }
        else {
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
    static pageToCanvasY(y) {
        if (this._canvas) {
            const top = this._canvas.offsetTop;
            return Math.round((y - top) / this._realScale);
        }
        else {
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
    static isInsideCanvas(x, y) {
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
    static resize(width, height) {
        this._width = width;
        this._height = height;
        this._app.renderer.resize(width, height);
        this._updateAllElements();
    }
    static _createAllElements() {
        this._createErrorPrinter();
        this._createCanvas();
        this._createLoadingSpinner();
        this._createFPSCounter();
    }
    static _updateAllElements() {
        this._updateRealScale();
        this._updateErrorPrinter();
        this._updateCanvas();
        this._updateVideo();
    }
    static _onTick(ticker) {
        this._fpsCounter.startTick();
        if (this._tickHandler) {
            this._tickHandler(ticker.deltaTime);
        }
        if (this._canRender()) {
            this._app.render();
        }
        this._fpsCounter.endTick();
    }
    static _canRender() {
        return !!this._app.stage;
    }
    static _updateRealScale() {
        if (this._stretchEnabled && this._width > 0 && this._height > 0) {
            const h = this._stretchWidth() / this._width;
            const v = this._stretchHeight() / this._height;
            this._realScale = Math.min(h, v);
            window.scrollTo(0, 0);
        }
        else {
            this._realScale = this._defaultScale;
        }
    }
    static _stretchWidth() {
        if (Utils.isMobileDevice()) {
            return document.documentElement.clientWidth;
        }
        else {
            return window.innerWidth;
        }
    }
    static _stretchHeight() {
        if (Utils.isMobileDevice()) {
            // [Note] Mobile browsers often have special operations at the top and
            //   bottom of the screen.
            const rate = Utils.isLocal() ? 1.0 : 0.9;
            return document.documentElement.clientHeight * rate;
        }
        else {
            return window.innerHeight;
        }
    }
    static _makeErrorHtml(name, message /*, error*/) {
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
    static _centerElement(element) {
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
    static _onKeyDown(event) {
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
        }
        else {
            this._requestFullScreen();
        }
    }
    static _isFullScreen() {
        return (document.fullScreenElement ||
            document.mozFullScreen ||
            document.webkitFullscreenElement);
    }
    static _requestFullScreen() {
        const element = document.body;
        if (element.requestFullScreen) {
            element.requestFullScreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullScreen) {
            //@ts-expect-error
            element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
    static _cancelFullScreen() {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
    static async _createPixiApp() {
        try {
            this._app = new Application();
            await this._app.init({
                canvas: this._canvas,
                autoStart: false,
                hello: true,
                textureGCMaxIdle: 600,
            });
            this._app.ticker.remove(this._app.render, this._app);
            this._app.ticker.add(this._onTick, this);
            // await initDevtools(this._app);
            // @ts-ignore
            //  globalThis.__PIXI_APP__ = this._app;
        }
        catch (e) {
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
            }
            catch (e) {
                this._app = null;
            }
        }
    }
    static get app() {
        return this._app;
    }
    static set app(value) {
        this._app = value;
    }
    static get effekseer() {
        return this._effekseer;
    }
    static set effekseer(value) {
        this._effekseer = value;
    }
    static get width() {
        return this._width;
    }
    static set width(value) {
        this._width = value;
    }
    static get height() {
        return this._height;
    }
    static set height(value) {
        this._height = value;
    }
    static get defaultScale() {
        return this._defaultScale;
    }
    static set defaultScale(value) {
        this._defaultScale = value;
    }
}

/**
 * A ping-pong buffer for efficient render texture operations.
 * Maintains two render textures and alternates between them to avoid
 * read/write conflicts and memory allocation overhead.
 *
 * @example
 * ```ts
 * const buffer = new PingPongBuffer({width: 800, height: 600});
 *
 * // Get source (read from) and target (write to)
 * const source = buffer.getSource();
 * const target = buffer.getTarget();
 *
 * // Render something
 * renderer.render({ container: mySprite, target });
 *
 * // Swap for next operation
 * buffer.swap();
 *
 * // Get final result
 * const result = buffer.getSource();
 * ```
 * @link https://en.wikipedia.org/wiki/Ping-pong_scheme
 */
class PingPongBuffer {
    /**
     * Creates a new PingPongBuffer instance.
     * @param options - the buffer options
     */
    constructor(options) {
        this._current = 'A';
        this._hasBeenInitialized = false;
        options.width = options.width || 0;
        options.height = options.height || 0;
        options.scaleMode = options.scaleMode || 'linear';
        options.resolution = options.resolution || Engine.app.renderer.resolution;
        this._textureA = RenderTexture.create(options);
        this._textureB = RenderTexture.create(options);
        this._graphics = new Graphics()
            .rect(0, 0, options.width, options.height)
            .fill(0x000000);
        this._graphics.blendMode = 'erase';
    }
    /**
     * Gets the current source texture (read from this).
     * This is the texture that contains the latest rendered content.
     *
     * @returns The current source RenderTexture
     */
    getSource() {
        return this._current === 'A' ? this._textureA : this._textureB;
    }
    /**
     * Gets the current target texture (write to this).
     * This is the texture you should render to next.
     *
     * @returns The current target RenderTexture
     */
    getTarget() {
        return this._current === 'A' ? this._textureB : this._textureA;
    }
    /**
     * Swaps the source and target textures.
     * Call this after rendering to prepare for the next operation.
     *
     * @example
     * ```ts
     * const source = buffer.getSource();
     * const target = buffer.getTarget();
     * renderer.render({ container: sprite, target: target });
     * buffer.swap(); // Now target becomes source
     * ```
     */
    swap() {
        this._current = this._current === 'A' ? 'B' : 'A';
    }
    /**
     * Clear the current source texture to transparent.
     */
    clear() {
        Engine.app.renderer.render({ container: this._graphics, target: this.getSource() });
    }
    /**
     * Clear all the textures to transparent.
     */
    clearAll() {
        Engine.app.renderer.render({ container: this._graphics, target: this.getSource() });
        Engine.app.renderer.render({ container: this._graphics, target: this.getTarget() });
    }
    /**
     * Resize the buffer to a new size.
     * @param width - the new width
     * @param height - the new height
     */
    resize(width, height) {
        this._textureA.resize(width, height);
        this._textureB.resize(width, height);
        this._graphics.clear();
        this._graphics.rect(0, 0, width, height);
        this._graphics.fill(0x000000);
        this._graphics.blendMode = 'erase';
    }
    /**
     * Destroy the buffer and its textures.
     */
    destroy() {
        this._textureA.destroy();
        this._textureB.destroy();
        this._graphics.destroy();
    }
    assign(container) {
        const renderer = Engine.app.renderer;
        const source = this.getSource();
        const target = this.getTarget();
        renderer.render({ container, target: source, clear: false });
        renderer.render({ container, target, clear: false });
        this._hasBeenInitialized = true;
    }
    hasSource() {
        return this._hasBeenInitialized;
    }
}

var LoadingState;
(function (LoadingState) {
    LoadingState[LoadingState["NONE"] = 0] = "NONE";
    LoadingState[LoadingState["LOADING"] = 1] = "LOADING";
    LoadingState[LoadingState["LOADED"] = 2] = "LOADED";
    LoadingState[LoadingState["ERROR"] = 3] = "ERROR";
})(LoadingState || (LoadingState = {}));
/**
 * The basic object that represents an image.
 */
class Bitmap {
    constructor(width = 0, height = 0) {
        this.initialize(width, height);
    }
    initialize(width = 0, height = 0) {
        this._assets = Assets;
        this.renderer = Engine.app.renderer;
        this._eventEmitter = new EventEmitter();
        this._texture = null;
        this._url = '';
        this._paintOpacity = 255;
        this._scaleMode = 'linear';
        this._loadingState = LoadingState.NONE;
        this._alphaContainer = new Container();
        this._alphaContainer.alpha = this.alphaConversion();
        this.fontFace = 'sans-serif';
        this.fontSize = 16;
        this.fontBold = false;
        this.fontItalic = false;
        this.textColor = '#ffffff';
        this.outlineColor = 'rgba(0, 0, 0, 0.5)';
        this.outlineWidth = 3;
        this._buffer = new PingPongBuffer({
            width,
            height,
            scaleMode: this._scaleMode
        });
        // TODO : maybe remove the usage this._width and this._height they are just bloat tracking.
        this._width = width;
        this._height = height;
        this._originalSprite = new Sprite$1();
        this._blitSprite = new Sprite$1();
        this._graphics = new Graphics();
        this._gradient = new FillGradient({ type: 'linear', textureSpace: 'local' });
    }
    /**
     * load a bitmap image
     * @param url - the image url
     */
    static async load(url) {
        const bitmap = Object.create(Bitmap.prototype);
        bitmap.initialize();
        bitmap._url = url;
        await bitmap.startLoading();
        return bitmap;
    }
    /**
     * Takes a snapshot of the game screen.
     *
     * @param {Stage} stage - The stage object.
     * @returns {Bitmap} The new bitmap object.
     */
    static snap(stage) {
        const width = Engine.width;
        const height = Engine.height;
        stage.worldTransform.identity();
        const bitmap = new Bitmap(width, height);
        bitmap.renderTo(stage);
        return bitmap;
    }
    /**
     * Returns whether the bitmap is ready.
     * @returns {boolean} - true if the bitmap is ready, false otherwise
     */
    isReady() {
        return this._loadingState === LoadingState.LOADED || this._loadingState === LoadingState.NONE;
    }
    /**
     * Returns whether the bitmap has an error.
     * @returns {boolean} - true if the bitmap has an error, false otherwise
     */
    isError() {
        return this._loadingState === LoadingState.ERROR;
    }
    /**
     * the bitmap url
     * @readonly
     */
    get url() {
        return this._url;
    }
    /**
     * the bitmap texture
     * @readonly
     */
    get texture() {
        return this._texture;
    }
    /**
     * the bitmap texture source
     * @readonly
     */
    get textureSource() {
        return this._texture.source;
    }
    /**
     * the bitmap render texture
     * @readonly
     */
    get buffer() {
        return this._buffer;
    }
    /**
     * The bitmap width
     * @readonly
     */
    get width() {
        return this._texture ? this._texture.width : 0;
    }
    /**
     * The bitmap height
     * @readonly
     */
    get height() {
        return this._texture ? this._texture.height : 0;
    }
    /**
     * The bitmap rectangle
     * @readonly
     */
    get rect() {
        return new Rectangle(0, 0, this.width, this.height);
    }
    /**
     * Set the scaling mode for the bitmap which are
     * "linear" and "nearest".
     */
    get scaleMode() {
        return this._scaleMode;
    }
    set scaleMode(value) {
        if (this._scaleMode !== value) {
            this._scaleMode = value;
            this.updateScaleMode();
        }
    }
    /**
     * The opacity for drawing operations, ranging from 0 (fully transparent) to 255 (fully opaque).
     */
    get paintOpacity() {
        return this._paintOpacity;
    }
    set paintOpacity(value) {
        if (this._paintOpacity !== value) {
            this._paintOpacity = value;
            this.refreshPaintOpacity();
        }
    }
    /**
     * destroy the bitmap
     */
    destroy() {
        if (this._texture) {
            this._texture.destroy();
            this._texture = null;
        }
        this._alphaContainer.destroy();
        this._alphaContainer = null;
        this._width = 0;
        this._height = 0;
        this._graphics.destroy();
        this._graphics = null;
        this._gradient.destroy();
        this._gradient = null;
        this._buffer.destroy();
        this._buffer = null;
    }
    /**
     * resize the bitmap
     * @param width - the new bitmap width
     * @param height - the new bitmap height
     */
    resize(width, height) {
        width = Math.max(width || 0, 1);
        height = Math.max(height || 0, 1);
        this._width = width;
        this._height = height;
        this.texture.source.resize(width, height);
        this.texture.update();
    }
    /**
     * Blits (copies) a rectangular region from a source bitmap to this bitmap.
     *
     * @param source - The bitmap to copy from
     * @param sourceRect - The rectangle region to copy from source
     * @param destRect - The position and optional size in destination
     *
     * @example
     * ```ts
     * // Copy 32x32 region from source at (0,0) to destination at (64,64)
     * destBitmap.blt(
     *   sourceBitmap,
     *   { x: 0, y: 0, width: 32, height: 32 },
     *   { x: 64, y: 64 }
     * );
     * ```
     *
     * @example
     * ```ts
     * // Copy and scale to 64x64
     * destBitmap.blt(
     *   sourceBitmap,
     *   { x: 0, y: 0, width: 32, height: 32 },
     *   { x: 0, y: 0, width: 64, height: 64 }
     * );
     * ```
     */
    blt(source, sourceRect, destRect) {
        if (!this._texture || !source._texture)
            return;
        const { x: sx, y: sy, width: sw, height: sh } = sourceRect;
        const { x: dx, y: dy } = destRect;
        const dw = destRect.width || sw;
        const dh = destRect.height || sh;
        // we launch the process
        try {
            this._originalSprite.texture = this._buffer.getSource();
            this._blitSprite.texture = new Texture({
                source: source._texture.source,
                frame: new Rectangle(sx, sy, sw, sh)
            });
            this._blitSprite.position.set(dx, dy);
            this._blitSprite.scale.set(dw / sw, dh / sh);
            this._alphaContainer.addChild(this._originalSprite, this._blitSprite);
            // todo : maybe shorten this function since we repeating a lot of code?
            this.renderer.render({ container: this._alphaContainer, target: this._buffer.getTarget(), clear: false });
            this._alphaContainer.removeChild(this._originalSprite, this._blitSprite);
            this._buffer.swap();
            this._texture = this._buffer.getSource();
            this._texture.update();
        }
        catch (e) {
            throw new Error(e);
        }
    }
    /**
     * Returns pixel color at the specified point.
     *
     * @param x - The x coordinate of the pixel in the bitmap.
     * @param y - The y coordinate of the pixel in the bitmap.
     * @returns {string} The pixel color (hex format).
     */
    getPixel(x, y) {
        if (!this._texture)
            return '#000000';
        const pixels = this.renderer.extract.pixels(this._texture).pixels;
        const index = (y * this._texture.width + x) * 4;
        return '#' + pixels[index].toString(16).padZero(2) +
            pixels[index + 1].toString(16).padZero(2) +
            pixels[index + 2].toString(16).padZero(2);
    }
    /**
     * Returns alpha pixel value at the specified point.
     *
     * @param x - The x coordinate of the pixel in the bitmap.
     * @param y - The y coordinate of the pixel in the bitmap.
     * @returns {string} The alpha value.
     */
    getAlphaPixel(x, y) {
        if (!this._texture)
            return 0;
        // Get all pixels
        const pixels = this.renderer.extract.pixels(this._texture).pixels;
        // Calculate the pixel position in the array (4 values per pixel: R,G,B,A)
        const index = (y * this._texture.width + x) * 4;
        // Return the alpha value (the 4th value in the RGBA array)
        return pixels[index + 3];
    }
    /**
     * Clears the specified rectangle.
     *
     * @param x - The x coordinate for the upper-left corner.
     * @param y - The y coordinate for the upper-left corner.
     * @param width - The width of the rectangle to clear.
     * @param height - The height of the rectangle to clear.
     */
    clearRect(x, y, width, height) {
        this._graphics.clear();
        this._graphics.rect(x, y, width, height)
            .fill(0x000000);
        this._graphics.blendMode = 'erase';
        this._originalSprite.texture = this._buffer.getSource();
        this._alphaContainer.addChild(this._originalSprite, this._graphics);
        this.renderer.render({ container: this._alphaContainer, target: this._buffer.getTarget(), clear: false });
        this._buffer.swap();
        this._texture = this._buffer.getSource();
        this._alphaContainer.removeChild(this._originalSprite, this._graphics);
        this._graphics.blendMode = 'normal';
        this._texture.update();
    }
    /**
     * Clears the entire bitmap.
     */
    clear() {
        this.clearRect(0, 0, this._width, this._height);
    }
    /**
     * Fill the bitmap in a specified rectangle with a color.
     * @param rect - the rectangle coordinates
     * @param color - the rectangle color
     */
    fillRect(rect, color) {
        this._graphics.clear();
        this._graphics
            .rect(rect.x, rect.y, rect.width, rect.height)
            .fill({
            color: this.getColor(color).toNumber(),
            alpha: this.getColor(color).alpha
        });
        this._originalSprite.texture = this._buffer.getSource();
        this._alphaContainer.addChild(this._originalSprite, this._graphics);
        this.renderer.render({ container: this._alphaContainer, target: this._buffer.getTarget(), clear: false });
        // we should always swap the buffer to assure the texture is up to date.
        this._buffer.swap();
        this._texture = this._buffer.getSource();
        this._alphaContainer.removeChild(this._originalSprite, this._graphics);
        this._texture.update();
    }
    /**
     * Fills the entire bitmap.
     *
     * @param color - The color of the rectangle in CSS format.
     */
    fillAll(color) {
        this.fillRect({ x: 0, y: 0, width: this.width, height: this.height }, color);
    }
    /**
     * Create a stroke in the bitmap
     * @param rect - the stroke rectangle coordinates
     * @param color - the stroke color
     * @param lineWidth - the stroke width
     */
    strokeRect(rect, color, lineWidth = 1) {
        this._graphics.clear();
        this._graphics.rect(rect.x, rect.y, rect.width, rect.height)
            .stroke({
            color: this.getColor(color).toNumber(),
            width: lineWidth,
            alpha: this.getColor(color).alpha
        });
        this._originalSprite.texture = this._buffer.getSource();
        this._alphaContainer.addChild(this._originalSprite, this._graphics);
        this.renderer.render({ container: this._alphaContainer, target: this._buffer.getTarget(), clear: false });
        this._buffer.swap();
        this._alphaContainer.removeChild(this._graphics);
        this._texture = this._buffer.getSource();
        this._texture.update();
    }
    /**
     * Draw a gradient fill in the bitmap
     * @param rect - the gradient rectangle coordinates
     * @param color1 - the start color
     * @param color2 - the end color
     * @param orientation - the gradient orientation (horizontal or vertical)
     */
    gradientFillRect(rect, color1, color2, orientation = 'horizontal') {
        let start = new Point(0, 0);
        let end = new Point(0, 0);
        if (orientation === 'horizontal') {
            start.set(0, 0);
            end.set(1, 0);
        }
        if (orientation === 'vertical') {
            start.set(0, 0);
            end.set(0, 1);
        }
        this._gradient.start = start;
        this._gradient.end = end;
        this._gradient.colorStops = [
            { offset: 0, color: this.getColor(color1).toHex() },
            { offset: 1, color: this.getColor(color2).toHex() }
        ];
        this._graphics.clear();
        this._graphics
            .rect(rect.x, rect.y, rect.width, rect.height)
            .fill(this._gradient);
        this._originalSprite.texture = this._buffer.getSource();
        this._alphaContainer.addChild(this._originalSprite, this._graphics);
        this.renderer.render({ container: this._alphaContainer, target: this._buffer.getTarget(), clear: false });
        this._alphaContainer.removeChild(this._graphics);
        this._buffer.swap();
        this._texture = this._buffer.getSource();
        this._texture.update();
    }
    /**
     * Draw a circle in the bitmap
     * @param x - the circle x position
     * @param y - the circle y position
     * @param radius - the circle radius
     * @param color - the circle color
     */
    drawCircle(x, y, radius, color) {
        this._graphics.clear();
        this._graphics
            .circle(x, y, radius)
            .fill({
            color: this.getColor(color).toNumber(),
            alpha: this.getColor(color).alpha
        });
        this._originalSprite.texture = this._buffer.getSource();
        this._alphaContainer.addChild(this._originalSprite, this._graphics);
        this.renderer.render({ container: this._alphaContainer, target: this._buffer.getTarget(), clear: false });
        this._buffer.swap();
        this._alphaContainer.removeChild(this._graphics);
        this._texture = this._buffer.getSource();
        this._texture.update();
    }
    //TODO : actually implement that function
    drawText(text, x, y, maxWidth, lineHeight, align) {
        // code
    }
    measureTextWidth(text) {
        return 0;
    }
    /**
     * subscribe to a bitmap event
     * @remarks the Bitmap class will automatically call 3 events:
     *
     *          - load: Event called when the loading is being loaded
     *
     *          - complete: Event called when the loading is complete
     *
     *          - error: Event called when the loading is error
     * @param bitmapEvent - the bitmap event to subscribe to
     * @param callback - the callback function to call when the event is triggered
     * @param context - the callback context
     */
    on(bitmapEvent, callback, context) {
        return this._eventEmitter.on(bitmapEvent, callback, context);
    }
    //TODO : do the documentation
    once(bitmapEvent, callback, context) {
        return this._eventEmitter.once(bitmapEvent, callback, context);
    }
    // TODO : do the documentation
    emit(bitmapEvent) {
        return this._eventEmitter.emit(bitmapEvent);
    }
    async retry() {
        await this.startLoading();
    }
    /**
     * Render a container to the bitmap
     * @remarks this is different from a blt as you do not have control
     *          of the source and destination rectangles. They are
     *          mostly used for creating Screen snapshot
     * @param container - the container to render
     * @param clear - whether to clear the bitmap before rendering the container
     */
    renderTo(container, clear = true) {
        this.renderer.render({
            container,
            target: this._buffer.getTarget(),
            clear
        });
        this._buffer.swap();
        this._texture = this._buffer.getSource();
        this._texture.update();
    }
    assignTexture(texture) {
        this._texture = texture;
        this._width = this._texture.width;
        this._height = this._texture.height;
        this._buffer.resize(this._width, this._height);
        this.ensureRenderTexture();
    }
    /// PRIVATE FUNCTION
    async startLoading() {
        this._loadingState = LoadingState.LOADING;
        this._eventEmitter.emit('load');
        try {
            // TODO : make sure to add decryption support later on
            this._texture = await this._assets.load(this._url);
            this._texture.dynamic = true;
            this._width = this._texture.width;
            this._height = this._texture.height;
            this._buffer.resize(this._width, this._height);
            this.ensureRenderTexture();
            this._loadingState = LoadingState.LOADED;
            this._eventEmitter.emit('complete');
        }
        catch (e) {
            this._loadingState = LoadingState.ERROR;
            this._eventEmitter.emit('error', e);
        }
    }
    ensureRenderTexture() {
        if (!this._buffer.hasSource()) {
            this._originalSprite.texture = this._texture;
            this._buffer.assign(this._originalSprite);
        }
    }
    updateScaleMode() {
        this._texture.source.scaleMode = this._scaleMode;
    }
    refreshPaintOpacity() {
        this._alphaContainer.alpha = this.alphaConversion();
    }
    alphaConversion() {
        return this._paintOpacity / 255;
    }
    getColor(color) {
        return Color.shared.setValue(color);
    }
}

var fragment = `#version 300 es
in vec2 vTextureCoord;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform float hue;
uniform vec4 colorTone;
uniform vec4 blendColor;
uniform float brightness;

vec3 rgbToHsl(vec3 rgb) {
    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;
    float cmin = min(r, min(g, b));
    float cmax = max(r, max(g, b));
    float h = 0.0;
    float s = 0.0;
    float l = (cmin + cmax) / 2.0;
    float delta = cmax - cmin;
    if (delta > 0.0) {
        if (r == cmax) {
            h = mod((g - b) / delta + 6.0, 6.0) / 6.0;
        } else if (g == cmax) {
            h = ((b - r) / delta + 2.0) / 6.0;
        } else {
            h = ((r - g) / delta + 4.0) / 6.0;
        }
        if (l < 1.0) {
            s = delta / (1.0 - abs(2.0 * l - 1.0));
        }
    }
    return vec3(h, s, l);
}

vec3 hslToRgb(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs((mod(h * 6.0, 2.0)) - 1.0));
    float m = l - c / 2.0;
    float cm = c + m;
    float xm = x + m;
    if (h < 1.0 / 6.0) {
        return vec3(cm, xm, m);
    } else if (h < 2.0 / 6.0) {
        return vec3(xm, cm, m);
    } else if (h < 3.0 / 6.0) {
        return vec3(m, cm, xm);
    } else if (h < 4.0 / 6.0) {
        return vec3(m, xm, cm);
    } else if (h < 5.0 / 6.0) {
        return vec3(xm, m, cm);
    } else {
        return vec3(cm, m, xm);
    }
}

void main() {
    vec4 color = texture(uTexture, vTextureCoord);
    float a = color.a;
    vec3 hsl = rgbToHsl(color.rgb);
    hsl.x = mod(hsl.x + hue / 360.0, 1.0);
    hsl.y = hsl.y * (1.0 - colorTone.a / 255.0);
    vec3 rgb = hslToRgb(hsl);
    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;
    float r2 = colorTone.r / 255.0;
    float g2 = colorTone.g / 255.0;
    float b2 = colorTone.b / 255.0;
    float r3 = blendColor.r / 255.0;
    float g3 = blendColor.g / 255.0;
    float b3 = blendColor.b / 255.0;
    float i3 = blendColor.a / 255.0;
    float i1 = 1.0 - i3;
    r = clamp((r / a + r2) * a, 0.0, 1.0);
    g = clamp((g / a + g2) * a, 0.0, 1.0);
    b = clamp((b / a + b2) * a, 0.0, 1.0);
    r = clamp(r * i1 + r3 * i3 * a, 0.0, 1.0);
    g = clamp(g * i1 + g3 * i3 * a, 0.0, 1.0);
    b = clamp(b * i1 + b3 * i3 * a, 0.0, 1.0);
    r = r * brightness / 255.0;
    g = g * brightness / 255.0;
    b = b * brightness / 255.0;
    fragColor = vec4(r, g, b, a);
}
`;

var vertex = `#version 300 es
precision mediump float;

in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

void main() {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    gl_Position = vec4((position / uOutputTexture.xy) * 2.0 - 1.0, 0.0, 1.0);
    gl_Position.y = -gl_Position.y;
    vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}
`;

// v8 has a default vertex shader you can use
class ColorFilter extends Filter {
    constructor() {
        super({
            glProgram: new GlProgram({
                fragment,
                vertex,
            }),
            resources: {
                colorUniforms: {
                    hue: { value: 0, type: 'f32' },
                    brightness: { value: 255, type: 'f32' },
                    colorTone: { value: [0, 0, 0, 0], type: 'vec4<f32>' },
                    blendColor: { value: [0, 0, 0, 0], type: 'vec4<f32>' },
                }
            }
        });
    }
    /**
     * Sets the hue rotation value.
     *
     * @param  hue - The hue value (-360, 360).
     */
    setHue(hue) {
        this.resources.colorUniforms.uniforms.hue = Number(hue);
    }
    /**
     * Sets the color tone.
     *
     * @param tone - The color tone [r, g, b, gray].
     */
    setColorTone(tone) {
        if (!(tone instanceof Array))
            throw new Error("Argument must be an array");
        this.resources.colorUniforms.uniforms.colorTone = tone;
    }
    /**
     * Sets the blend color.
     *
     * @param  color - The blend color [r, g, b, a].
     */
    setBlendColor(color) {
        if (!(color instanceof Array))
            throw new Error("Argument must be an array");
        this.resources.colorUniforms.uniforms.blendColor = color;
    }
    /**
     * Sets the brightness.
     *
     * @param {number} brightness - The brightness (0 to 255).
     */
    setBrightness(brightness) {
        this.resources.colorUniforms.uniforms.brightness = Number(brightness);
    }
}

/**
 * The static class that handles the player input.
 */
class Input {
    static registerAction(name, input) {
        if (this._inputMap.has(name)) {
            const inputs = this._inputMap.get(name);
            if (Array.isArray(input)) {
                inputs.push(...input);
            }
            else {
                inputs.push(input);
            }
        }
        else {
            if (input instanceof Array) {
                this._inputMap.set(name, input);
            }
            else {
                this._inputMap.get(name).push(input);
            }
        }
    }
}

/**
 * The static class that handles json with object informations.
 */
class JsonEx {
    /**
     * Converts an object to a JSON string with object information.
     *
     * @param {object} object - The object to be converted.
     * @returns {string} The JSON string.
     */
    static stringify(object) {
        return JSON.stringify(this.encode(object, 0));
    }
    /**
     * Parses a JSON string and reconstructs the corresponding object.
     *
     * @param {string} json - The JSON string.
     * @returns  The reconstructed object.
     */
    static parse(json) {
        return this.decode(JSON.parse(json));
    }
    /**
     * Makes a deep copy of the specified object.
     *
     * @param {object} object - The object to be copied.
     * @returns {object} The copied object.
     */
    static makeDeepCopy(object) {
        return this.parse(this.stringify(object));
    }
    static encode(value, depth = 0) {
        if (depth >= this.maxDepth)
            throw new Error('Object too deep');
        const type = Object.prototype.toString.call(value);
        if (type === "[object Object]" || type === "[object Array]") {
            const constructorName = value.constructor.name;
            if (constructorName !== "Object" && constructorName !== "Array") {
                value["@"] = constructorName;
            }
            for (const key of Object.keys(value)) {
                value[key] = this.encode(value[key], depth + 1);
            }
        }
        return value;
    }
    static decode(value) {
        const type = Object.prototype.toString.call(value);
        if (type === "[object Object]" || type === "[object Array]") {
            if (value["@"]) {
                const constructor = window[value["@"]];
                if (constructor) {
                    // @ts-ignore
                    Object.setPrototypeOf(value, constructor.prototype);
                }
            }
            for (const key of Object.keys(value)) {
                value[key] = this.decode(value[key]);
            }
        }
        return value;
    }
}
/**
 * The maximum depth of objects.
 *
 * @type number
 * @default 100
 */
JsonEx.maxDepth = 100;

class RpgWindow extends Container {
    constructor() {
        super();
        this.initialize(...arguments);
    }
    initialize(...args) {
        this._isWindow = true;
        this._windowskin = null;
    }
}

const BLEND_MODE_MAP = {
    // RPG Maker editor exposed modes
    0: 'normal', // Normal
    1: 'add', // Additive
    2: 'multiply', // Multiply
    3: 'screen', // Screen
    // Extended modes (not in editor but available via plugins)
    4: 'overlay',
    5: 'darken',
    6: 'lighten',
    7: 'color-dodge',
    8: 'color-burn',
    9: 'hard-light',
    10: 'soft-light',
    11: 'difference',
    12: 'exclusion',
    13: 'saturation',
    14: 'color',
    15: 'luminosity',
    16: 'normal-npm',
    17: 'add-npm',
    18: 'screen-npm',
    19: 'subtract',
    20: 'divide',
    21: 'vivid-light',
    22: 'hard-mix',
    23: 'negation',
    24: 'pin-light',
    25: 'linear-burn',
    26: 'linear-dodge',
    27: 'linear-light',
    28: 'erase',
    29: 'none',
    30: 'inherit',
    31: 'min',
    32: 'max'
};
class Sprite extends Sprite$1 {
    constructor(bitmap, ...args) {
        const frame = new Rectangle();
        super({
            texture: Sprite._emptyTexture,
            frame
        });
        this.initialize(...arguments);
    }
    initialize(bitmap, ...args) {
        this._bitmap = bitmap;
        this._frame = new Rectangle();
        this._hue = 0;
        this._blendColor = [0, 0, 0, 0];
        this._colorTone = [0, 0, 0, 0];
        this._colorFilter = null;
        this._hidden = false;
        this.blendMode = 'normal';
        this._onBitmapChange();
    }
    /**
     * The Sprite image.
     * @see {@link Bitmap} for the full bitmap api
     */
    get bitmap() {
        return this._bitmap;
    }
    set bitmap(value) {
        if (this._bitmap === value)
            return;
        this._bitmap = value;
        this._onBitmapChange();
    }
    /**
     * The width of the current frame region in pixels, independent of scale.
     * @remarks Equivalent to the source rectangle width in a traditional sprite batch draw call.
     * Changing this updates which region of the source texture is displayed,
     * but does not affect the texture itself or the rendered scale.
     * @see {@link Sprite#width} For scale-aware width manipulation.
     * @see {@link Sprite#frameHeight} For the equivalent height property.
     */
    get frameWidth() {
        return this._frame.width;
    }
    set frameWidth(value) {
        this._frame.width = value;
        this._refresh();
    }
    /**
     * The height of the current frame region in pixels, independent of scale.
     * @remarks Equivalent to the source rectangle height in a traditional sprite batch draw call.
     * Changing this updates which region of the source texture is displayed,
     * but does not affect the texture itself or the rendered scale.
     * @see {@link Sprite#height} For scale-aware height manipulation.
     * @see {@link Sprite#frameWidth} For the equivalent width property.
     */
    get frameHeight() {
        return this._frame.height;
    }
    set frameHeight(value) {
        this._frame.height = value;
        this._refresh();
    }
    /**
     * The sprite opacity (0 to 255).
     */
    get opacity() {
        return this.alpha * 255;
    }
    set opacity(value) {
        this.alpha = value.clamp(0, 255) / 255;
    }
    /**
     * Sets the blend mode for the sprite.
     * Accepts both legacy numeric blend mode values from PixiJS v5
     * and the new string literal blend modes from PixiJS v8.
     * @param value - The blend mode to apply, either a numeric value (v5) or a string literal (v8).
     * @example
     * ```ts
     * // RPG Maker legacy numeric value
     * sprite.setBlendMode(1); // Additive
     *
     * // PixiJS v8 string literal
     * sprite.setBlendMode('add');
     * ```
     * @see {@link BLEND_MODE_MAP} For the full mapping of numeric to string blend modes.
     * @see {@link Sprite#blendMode} For setting blend modes directly with v8 string literals.
     */
    setBlendMode(value) {
        this.blendMode = typeof value === 'number'
            ? BLEND_MODE_MAP[value] ?? 'normal'
            : value;
    }
    destroy() {
        const options = { children: true, texture: true };
        super.destroy(options);
    }
    update() {
        // no need anymore to do  as children are not allowed in sprites.
    }
    /**
     * Makes the sprite "hidden".
     */
    hide() {
        this._hidden = true;
        this.updateVisibility();
    }
    /**
     * Releases the "hidden" state of the sprite.
     */
    show() {
        this._hidden = false;
        this.updateVisibility();
    }
    updateVisibility() {
        this.visible = !this._hidden;
    }
    /**
     * Sets the x and y at once.
     * @param x - The x coordinate of the sprite.
     * @param y - The y coordinate of the sprite.
     */
    move(x, y) {
        this.x = x;
        this.y = y;
    }
    setFrame(x, y, width, height) {
        this._refreshFrame = false;
        const frame = this._frame;
        if (x !== frame.x ||
            y !== frame.y ||
            width !== frame.width ||
            height !== frame.height) {
            frame.x = x;
            frame.y = y;
            frame.width = width;
            frame.height = height;
            this._refresh(); // single refresh at the end
        }
    }
    /**
     *
     * @param hue - The hue value (-360, 360).
     */
    setHue(hue) {
        if (this._hue !== Number(hue)) {
            this._hue = Number(hue);
            this._updateColorFilter();
        }
    }
    /**
     * Gets the blend color for the sprite.
     *
     * @returns The blend color [r, g, b, a].
     */
    getBlendColor() {
        return this._blendColor.clone();
    }
    /**
     * Sets the blend color for the sprite.
     *
     * @param color - The blend color [r, g, b, a].
     */
    setBlendColor(color) {
        if (!(color instanceof Array)) {
            throw new Error('Argument must be an array');
        }
        if (!this._blendColor.equals(color)) {
            this._blendColor = color.clone();
            this._updateColorFilter();
        }
    }
    /**
     * Gets the color tone for the sprite.
     *
     * @returns {array} The color tone [r, g, b, gray].
     */
    getColorTone() {
        return this._colorTone.clone();
    }
    setColorTone(tone) {
        if (!(tone instanceof Array)) {
            throw new Error('Argument must be an array');
        }
        if (!this._colorTone.equals(tone)) {
            this._colorTone = tone.clone();
            this._updateColorFilter();
        }
    }
    /**
     * Add a filter to the sprites filter list
     * @param filter - the sprite filter to add
     */
    addFilter(filter) {
        if (!Array.isArray(this.filters)) {
            this.filters = [];
        }
        this.filters.push(filter);
    }
    /**
     * remove a filter from the filter list
     * @param filter - the filter to remove
     */
    removeFilter(filter) {
        if (!Array.isArray(this.filters))
            return;
        this.filters = this.filters.filter(f => f !== filter);
    }
    _onBitmapChange() {
        if (this._bitmap) {
            this._refreshFrame = true;
            if (this._bitmap.isReady()) {
                this._onBitmapLoad(this._bitmap);
            }
            else {
                this._bitmap.on("complete", () => this._onBitmapLoad(this._bitmap));
            }
        }
        else {
            this._refreshFrame = false;
            this.texture = Sprite._emptyTexture;
            this._frame = new Rectangle();
        }
    }
    _onBitmapLoad(loadedBitmap) {
        if (loadedBitmap !== this._bitmap)
            return;
        if (this._refreshFrame && this._bitmap) {
            this._refreshFrame = false;
            this._frame.width = this._bitmap.width;
            this._frame.height = this._bitmap.height;
        }
        this._refresh();
    }
    _refresh() {
        const frameX = Math.floor(this._frame.x);
        const frameY = Math.floor(this._frame.y);
        const frameW = Math.floor(this._frame.width);
        const frameH = Math.floor(this._frame.height);
        const textureSource = this._bitmap?.textureSource;
        const sourceW = textureSource ? textureSource.width : 0;
        const sourceH = textureSource ? textureSource.height : 0;
        const realX = frameX.clamp(0, sourceW);
        const realY = frameY.clamp(0, sourceH);
        const realW = (frameW - realX + frameX).clamp(0, sourceW - realX);
        const realH = (frameH - realY + frameY).clamp(0, sourceH - realY);
        const frame = new Rectangle(realX, realY, realW, realH);
        if (!this.texture)
            return;
        this.pivot.x = frameX - realX;
        this.pivot.y = frameY - realY;
        if (!textureSource)
            return;
        const texture = new Texture({
            source: textureSource,
            frame: frame
        });
        this._bitmap.assignTexture(texture);
        this.texture = this._bitmap.texture;
    }
    _createColorFilter() {
        this._colorFilter = new ColorFilter();
        this.addFilter(this._colorFilter);
    }
    _updateColorFilter() {
        if (!this._colorFilter)
            this._createColorFilter();
        this._colorFilter.setHue(this._hue);
        this._colorFilter.setBlendColor(this._blendColor);
        this._colorFilter.setColorTone(this._colorTone);
    }
}
Sprite._emptyTexture = new Texture({
    source: new TextureSource({ width: 1, height: 1 })
});

/**
 * A generic class that implements a stack-like data structure.
 *
 * This class follows the **Last In, First Out (LIFO)** principle, meaning that the most recently added
 * element will always be the first one to be removed.
 *
 * @template T - The type of the elements stored in the stack.
 *
 * @example
 * const stack = new Stack(1, 2, 3);
 * stack.push(4); // Adds 4 to the stack
 * console.log(stack.pop()); // Output: 4 (Most recently added element)
 * console.log(stack.peek()); // Output: 3 (Top element)
 * console.log(stack.size()); // Output: 3 (Stack size)
 */
class Stack {
    /**
     * Creates a new instance of the Stack class.
     *
     * Initializes the stack with the provided elements.
     *
     * @param items - The elements to initialize the stack with.
     */
    constructor(...items) {
        this._items = [...items];
    }
    /**
     * Prints the elements of the stack and other relevant information.
     *
     * @returns {string} - A string representing the stack's elements and its size.
     */
    print() {
        // Using map to construct an array of formatted strings for each element
        const elementsInfo = this._items.map((item, index) => {
            return `Element ${index}: ${item?.constructor?.name || 'Unknown Type'}`;
        });
        // Joining the elements info and adding the stack size at the end
        return [...elementsInfo, `Stack size: ${this._items.length}`].join("\n");
    }
    /**
     * Adds one or more elements to the top of the stack.
     *
     * @param elements - The elements to push onto the stack.
     */
    push(...elements) {
        this._items.push(...elements);
    }
    /**
     * Removes and returns the most recently added element from the stack.
     *
     * @returns {T | undefined} - The top element of the stack, or `undefined` if the stack is empty.
     */
    pop() {
        return this._items.pop();
    }
    /**
     * Returns the most recently added element without removing it.
     *
     * @returns {T} - The top element of the stack.
     * @throws {Error} - Throws an error if the stack is empty.
     */
    peek() {
        if (this.isEmpty()) {
            throw new Error("Stack is empty");
        }
        return this._items[this._items.length - 1];
    }
    /**
     * Checks whether the stack is empty.
     *
     * @returns {boolean} - `true` if the stack is empty, otherwise `false`.
     */
    isEmpty() {
        return this._items.length === 0;
    }
    /**
     * Returns the number of elements currently in the stack.
     *
     * @returns {number} - The size of the stack.
     */
    size() {
        return this._items.length;
    }
    /**
     * Removes all elements from the stack.
     */
    clear() {
        this._items = [];
    }
    /**
     * Creates a shallow copy of the stack and returns it.
     *
     * @returns {Stack<T>} - A new Stack instance with the same elements.
     */
    copy() {
        return new Stack(...this._items);
    }
    /**
     * Converts the stack to an array and returns it as a shallow copy.
     *
     * @returns {Array<T>} - A shallow copy of the stack as an array.
     */
    toArray() {
        return [...this._items];
    }
}

class Stage extends Container {
    constructor() {
        super();
        this.initialize(...arguments);
    }
}

class WebAudio {
    constructor(url, ...args) {
        this.initialize(url, ...args);
    }
    initialize(url, ...args) {
        this.clear();
        this._url = url;
    }
    /**
     * Initializes the audio system.
     *
     * @returns {boolean} True if the audio system is available.
     */
    static initialize() {
        this._context = null;
        this._masterGainNode = null;
        this._masterVolume = 1;
        this.createContext();
        this.createMasterGainNode();
        this.setupEventHandlers();
        return !!this._context;
    }
    /**
     * Sets the master volume for all audio.
     * @param volume - The master volume (0 to 1).
     */
    static setMasterVolume(volume) {
        this._masterVolume = volume;
        this.resetVolume();
    }
    static createContext() {
        try {
            const AudioContext = window.AudioContext;
            this._context = new AudioContext();
        }
        catch (e) {
            this._context = null;
        }
    }
    static currentTime() {
        return this._context ? this._context.currentTime : 0;
    }
    static createMasterGainNode() {
        const context = this._context;
        if (context) {
            this._masterGainNode = context.createGain();
            this.resetVolume();
            this._masterGainNode.connect(context.destination);
        }
    }
    static setupEventHandlers() {
        const onUserGesture = this.onUserGesture.bind(this);
        const onVisibilityChange = this.onVisibilityChange.bind(this);
        document.addEventListener('keydown', onUserGesture);
        document.addEventListener('mousedown', onUserGesture);
        document.addEventListener('touchend', onUserGesture);
        document.addEventListener('visibilitychange', onVisibilityChange);
    }
    static onUserGesture() {
        const context = this._context;
        if (context && context.state === 'suspended') {
            context.resume();
        }
    }
    static onVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            this.onHide();
        }
        else {
            this.onShow();
        }
    }
    static onHide() {
        if (this.shouldMuteOnHide()) {
            this.fadeOut(1);
        }
    }
    static onShow() {
        if (this.shouldMuteOnHide()) {
            this.fadeIn(1);
        }
    }
    static shouldMuteOnHide() {
        return Utils.isMobileDevice() && !window.matchMedia('(display-mode: standalone)').matches;
    }
    static resetVolume() {
        if (this._masterGainNode) {
            const gain = this._masterGainNode.gain;
            const volume = this._masterVolume;
            const currentTime = this.currentTime();
            gain.setValueAtTime(volume, currentTime);
        }
    }
    static fadeIn(duration) {
        if (this._masterGainNode) {
            const gain = this._masterGainNode.gain;
            const volume = this._masterVolume;
            const currentTime = this.currentTime();
            gain.setValueAtTime(0, currentTime);
            gain.linearRampToValueAtTime(volume, currentTime + duration);
        }
    }
    static fadeOut(duration) {
        if (this._masterGainNode) {
            const gain = this._masterGainNode.gain;
            const volume = this._masterVolume;
            const currentTime = this.currentTime();
            gain.setValueAtTime(volume, currentTime);
            gain.linearRampToValueAtTime(0, currentTime + duration);
        }
    }
    clear() {
        this.stop();
        this._data = null;
        this._fetchedSize = 0;
        this._fetchedData = [];
        this._buffers = [];
        this._sourceNodes = [];
        this._gainNode = null;
        this._pannerNode = null;
        this._totalTime = 0;
        this._sampleRate = 0;
        this._loop = 0;
        this._loopStart = 0;
        this._loopLength = 0;
        this._loopStartTime = 0;
        this._loopLengthTime = 0;
        this._startTime = 0;
        this._volume = 1;
        this._pitch = 1;
        this._pan = 0;
        this._endTimer = null;
        this._loadListeners = [];
        this._stopListeners = [];
        this._lastUpdateTime = 0;
        this._isLoaded = false;
        this._isError = false;
        this._isPlaying = false;
        this._decoder = null;
    }
    /**
     * the audio file url
     * @type string
     */
    get url() {
        return this._url;
    }
    /**
     * The volume of the audio.
     *
     * @type number
     * @name WebAudio#volume
     */
    get volume() {
        return this._volume;
    }
    set volume(value) {
        this._volume = value;
        if (this._gainNode) {
            this._gainNode.gain.setValueAtTime(this._volume, WebAudio.currentTime());
        }
    }
    /**
     * The pitch of the audio.
     *
     * @type number
     * @name WebAudio#pitch
     */
    get pitch() {
        return this._pitch;
    }
    set pitch(value) {
        if (this._pitch !== value) {
            this._pitch = value;
            if (this.isPlaying()) {
                this.play(this._loop, 0);
            }
        }
    }
    /**
     * The pan of the audio.
     *
     * @type number
     * @name WebAudio#pan
     */
    get pan() {
        return this._pan;
    }
    set pan(value) {
        this._pan = value;
        this.updatePanner();
    }
    /**
     * Checks whether the audio data is ready to play.
     *
     * @returns {boolean} True if the audio data is ready to play.
     */
    isReady() {
        return this._buffers && this._buffers.length > 0;
    }
    /**
     * Checks whether a loading error has occurred.
     *
     * @returns {boolean} True if a loading error has occurred.
     */
    isError() {
        return this._isError;
    }
    /**
     * Checks whether the audio is playing.
     *
     * @returns {boolean} True if the audio is playing.
     */
    isPlaying() {
        return this._isPlaying;
    }
    /**
     * Plays the audio.
     *
     * @param {boolean} loop - Whether the audio data play in a loop.
     * @param {number} offset - The start position to play in seconds.
     */
    play(loop, offset) {
        this._loop = loop;
        if (this.isReady()) {
            offset = offset || 0;
            this.startPlaying(offset);
        }
        else if (WebAudio._context) {
            this.addLoadListener(() => this.play(loop, offset));
        }
        this._isPlaying = true;
    }
    /**
     * Stop the audio
     */
    stop() {
        this._isPlaying = false;
        this.removeEndTimer();
        this.removeNodes();
        this._loadListeners = [];
        if (this._stopListeners) {
            while (this._stopListeners.length > 0) {
                const listner = this._stopListeners.shift();
                listner();
            }
        }
    }
    /**
     * Destroy the audio
     */
    destroy() {
        this.destroyDecoder();
        this.clear();
    }
    /**
     * Performs the audio fade-in.
     *
     * @param {number} duration - Fade-in time in seconds.
     */
    fadeIn(duration) {
        if (this.isReady()) {
            if (this._gainNode) {
                const gain = this._gainNode.gain;
                const currentTime = WebAudio.currentTime();
                gain.setValueAtTime(0, currentTime);
                gain.linearRampToValueAtTime(this._volume, currentTime + duration);
            }
        }
        else {
            this.addLoadListener(() => this.fadeIn(duration));
        }
    }
    fadeOut(duration) {
        if (this._gainNode) {
            const gain = this._gainNode.gain;
            const currentTime = WebAudio.currentTime();
            gain.setValueAtTime(this._volume, currentTime);
            gain.linearRampToValueAtTime(0, currentTime + duration);
        }
        this._isPlaying = false;
        this._loadListeners = [];
    }
    /**
     * Gets the seek position of the audio.
     */
    seek() {
        if (WebAudio._context) {
            let pos = (WebAudio.currentTime() - this._startTime) * this._pitch;
            if (this._loopLengthTime > 0) {
                while (pos >= this._loopStartTime + this._loopLengthTime) {
                    pos -= this._loopLengthTime;
                }
            }
            return pos;
        }
        else {
            return 0;
        }
    }
    /**
     * Adds a callback function that will be called when the audio data is loaded.
     *
     * @param listner - The callback function.
     */
    addLoadListener(listner) {
        this._loadListeners.push(listner);
    }
    /**
     * Adds a callback function that will be called when the playback is stopped.
     *
     * @param {function} listner - The callback function.
     */
    addStopListener(listner) {
        this._stopListeners.push(listner);
    }
    /**
     * Tries to load the audio again.
     */
    retry() {
        this.startLoading();
        if (this._isPlaying) {
            this.play(this._loop, 0);
        }
    }
    async startLoading() {
        if (WebAudio._context)
            return;
        const url = this.realUrl();
        const currentTime = WebAudio.currentTime();
        this._lastUpdateTime = currentTime - 0.5;
        this._isError = false;
        this._isLoaded = false;
        this.destroyDecoder();
        if (this.shouldUseDecoder()) {
            this.createDecoder();
        }
        if (Utils.isLocal()) {
            this.startNodeLoading(url);
        }
        else {
            this.startFetching(url);
        }
    }
    realUrl() {
        return this._url + (Utils.hasEncryptedAudio() ? "_" : "");
    }
    shouldUseDecoder() {
        return !Utils.canPlayOgg() && typeof VorbisDecoder === "function";
    }
    createDecoder() {
        this._decoder = new VorbisDecoder(WebAudio._context, this.onDecode.bind(this), this.onError.bind(this));
    }
    destroyDecoder() {
        if (!this._decoder)
            return;
        this._decoder.destroy();
        this._decoder = null;
    }
    async startNodeLoading(url) {
        try {
            const arrayBuffer = await Assets.load({
                src: url,
                loadParser: "load"
            });
        }
        finally {
        }
    }
}

var JsonFormatLevel;
(function (JsonFormatLevel) {
    JsonFormatLevel[JsonFormatLevel["MINIFIED"] = 1] = "MINIFIED";
    JsonFormatLevel[JsonFormatLevel["PRETTIFIED"] = 2] = "PRETTIFIED";
})(JsonFormatLevel || (JsonFormatLevel = {}));
var BattleSystem;
(function (BattleSystem) {
    BattleSystem[BattleSystem["TURN_BASED"] = 0] = "TURN_BASED";
    BattleSystem[BattleSystem["ATB_ACTIVE"] = 1] = "ATB_ACTIVE";
    BattleSystem[BattleSystem["ATB_WAIT"] = 2] = "ATB_WAIT";
})(BattleSystem || (BattleSystem = {}));

var TilesetType;
(function (TilesetType) {
    TilesetType[TilesetType["OVERWORLD"] = 0] = "OVERWORLD";
    TilesetType[TilesetType["AREA"] = 0] = "AREA";
})(TilesetType || (TilesetType = {}));

var ItemType;
(function (ItemType) {
    ItemType[ItemType["NONE"] = 0] = "NONE";
    ItemType[ItemType["REGULAR"] = 1] = "REGULAR";
    ItemType[ItemType["KEY"] = 2] = "KEY";
    ItemType[ItemType["HIDDEN_A"] = 3] = "HIDDEN_A";
    ItemType[ItemType["HIDDEN_B"] = 4] = "HIDDEN_B";
})(ItemType || (ItemType = {}));

var DropItemKind;
(function (DropItemKind) {
    DropItemKind[DropItemKind["NONE"] = 0] = "NONE";
    DropItemKind[DropItemKind["ITEM"] = 1] = "ITEM";
    DropItemKind[DropItemKind["WEAPON"] = 2] = "WEAPON";
    DropItemKind[DropItemKind["ARMOR"] = 3] = "ARMOR";
})(DropItemKind || (DropItemKind = {}));

var EventTrigger;
(function (EventTrigger) {
    EventTrigger[EventTrigger["ACTION_BUTTON"] = 0] = "ACTION_BUTTON";
    EventTrigger[EventTrigger["PLAYER_TOUCH"] = 1] = "PLAYER_TOUCH";
    EventTrigger[EventTrigger["EVENT_TOUCH"] = 2] = "EVENT_TOUCH";
    EventTrigger[EventTrigger["AUTORUN"] = 3] = "AUTORUN";
    EventTrigger[EventTrigger["PARALLEL"] = 4] = "PARALLEL";
})(EventTrigger || (EventTrigger = {}));
var CommonEventTrigger;
(function (CommonEventTrigger) {
    CommonEventTrigger[CommonEventTrigger["NONE"] = 0] = "NONE";
    CommonEventTrigger[CommonEventTrigger["AUTORUN"] = 1] = "AUTORUN";
    CommonEventTrigger[CommonEventTrigger["PARALLEL"] = 2] = "PARALLEL";
})(CommonEventTrigger || (CommonEventTrigger = {}));
var OccasionType;
(function (OccasionType) {
    OccasionType[OccasionType["ALWAYS"] = 0] = "ALWAYS";
    OccasionType[OccasionType["BATTLE_SCREEN"] = 1] = "BATTLE_SCREEN";
    OccasionType[OccasionType["MENU_SCREEN"] = 2] = "MENU_SCREEN";
    OccasionType[OccasionType["NEVER"] = 3] = "NEVER";
})(OccasionType || (OccasionType = {}));
var HitType;
(function (HitType) {
    HitType[HitType["CERTAIN"] = 0] = "CERTAIN";
    HitType[HitType["PHYSICAL"] = 1] = "PHYSICAL";
    HitType[HitType["MAGICAL"] = 2] = "MAGICAL";
})(HitType || (HitType = {}));
/**
 * the Scope of item and skills.
 */
var ScopeType;
(function (ScopeType) {
    ScopeType[ScopeType["NONE"] = 0] = "NONE";
    ScopeType[ScopeType["ONE_ENEMY"] = 1] = "ONE_ENEMY";
    ScopeType[ScopeType["ALL_ENEMIES"] = 2] = "ALL_ENEMIES";
    ScopeType[ScopeType["ONE_RANDOM_ENEMY"] = 3] = "ONE_RANDOM_ENEMY";
    ScopeType[ScopeType["TWO_RANDOM_ENEMIES"] = 4] = "TWO_RANDOM_ENEMIES";
    ScopeType[ScopeType["THREE_RANDOM_ENEMIES"] = 5] = "THREE_RANDOM_ENEMIES";
    ScopeType[ScopeType["FOUR_RANDOM_ENEMIES"] = 6] = "FOUR_RANDOM_ENEMIES";
    ScopeType[ScopeType["ONE_ALIVE_ALLY"] = 7] = "ONE_ALIVE_ALLY";
    ScopeType[ScopeType["ALL_ALLIES_ALIVE"] = 8] = "ALL_ALLIES_ALIVE";
    ScopeType[ScopeType["ONE_DEAD_ALLY"] = 9] = "ONE_DEAD_ALLY";
    ScopeType[ScopeType["ALL_ALLIES_DEAD"] = 10] = "ALL_ALLIES_DEAD";
    ScopeType[ScopeType["USER"] = 11] = "USER";
    ScopeType[ScopeType["ONE_ALLY_UNCONDITIONAL"] = 12] = "ONE_ALLY_UNCONDITIONAL";
    ScopeType[ScopeType["ALL_ALLIES_UNCONDITIONAL"] = 13] = "ALL_ALLIES_UNCONDITIONAL";
    ScopeType[ScopeType["ENEMIES_AND_ALLIES"] = 14] = "ENEMIES_AND_ALLIES";
})(ScopeType || (ScopeType = {}));

var MoveType;
(function (MoveType) {
    MoveType[MoveType["FIX"] = 0] = "FIX";
    MoveType[MoveType["RANDOM"] = 1] = "RANDOM";
    MoveType[MoveType["APPROACH"] = 2] = "APPROACH";
    MoveType[MoveType["CUSTOM"] = 3] = "CUSTOM";
})(MoveType || (MoveType = {}));

/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

/* eslint-disable space-unary-ops */

/* Public constants ==========================================================*/
/* ===========================================================================*/


//const Z_FILTERED          = 1;
//const Z_HUFFMAN_ONLY      = 2;
//const Z_RLE               = 3;
const Z_FIXED$1               = 4;
//const Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
const Z_BINARY              = 0;
const Z_TEXT                = 1;
//const Z_ASCII             = 1; // = Z_TEXT
const Z_UNKNOWN$1             = 2;

/*============================================================================*/


function zero$1(buf) { let len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

const STORED_BLOCK = 0;
const STATIC_TREES = 1;
const DYN_TREES    = 2;
/* The three kinds of block type */

const MIN_MATCH$1    = 3;
const MAX_MATCH$1    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

const LENGTH_CODES$1  = 29;
/* number of length codes, not counting the special END_BLOCK code */

const LITERALS$1      = 256;
/* number of literal bytes 0..255 */

const L_CODES$1       = LITERALS$1 + 1 + LENGTH_CODES$1;
/* number of Literal or Length codes, including the END_BLOCK code */

const D_CODES$1       = 30;
/* number of distance codes */

const BL_CODES$1      = 19;
/* number of codes used to transfer the bit lengths */

const HEAP_SIZE$1     = 2 * L_CODES$1 + 1;
/* maximum heap size */

const MAX_BITS$1      = 15;
/* All codes must not exceed MAX_BITS bits */

const Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

const MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

const END_BLOCK   = 256;
/* end of block literal code */

const REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

const REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

const REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
const extra_lbits =   /* extra bits for each length code */
  new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]);

const extra_dbits =   /* extra bits for each distance code */
  new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]);

const extra_blbits =  /* extra bits for each bit length code */
  new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]);

const bl_order =
  new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

const DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
const static_ltree  = new Array((L_CODES$1 + 2) * 2);
zero$1(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

const static_dtree  = new Array(D_CODES$1 * 2);
zero$1(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

const _dist_code    = new Array(DIST_CODE_LEN);
zero$1(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

const _length_code  = new Array(MAX_MATCH$1 - MIN_MATCH$1 + 1);
zero$1(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

const base_length   = new Array(LENGTH_CODES$1);
zero$1(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

const base_dist     = new Array(D_CODES$1);
zero$1(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


let static_l_desc;
let static_d_desc;
let static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



const d_code = (dist) => {

  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
};


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
const put_short = (s, w) => {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
};


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
const send_bits = (s, value, length) => {

  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
};


const send_code = (s, c, tree) => {

  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
};


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
const bi_reverse = (code, len) => {

  let res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
};


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
const bi_flush = (s) => {

  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
};


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
const gen_bitlen = (s, desc) => {
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */

  const tree            = desc.dyn_tree;
  const max_code        = desc.max_code;
  const stree           = desc.stat_desc.static_tree;
  const has_stree       = desc.stat_desc.has_stree;
  const extra           = desc.stat_desc.extra_bits;
  const base            = desc.stat_desc.extra_base;
  const max_length      = desc.stat_desc.max_length;
  let h;              /* heap index */
  let n, m;           /* iterate over the tree elements */
  let bits;           /* bit length */
  let xbits;          /* extra bits */
  let f;              /* frequency */
  let overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Tracev((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Tracev((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
};


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
const gen_codes = (tree, max_code, bl_count) => {
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */

  const next_code = new Array(MAX_BITS$1 + 1); /* next code value for each bit length */
  let code = 0;              /* running code value */
  let bits;                  /* bit index */
  let n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS$1; bits++) {
    code = (code + bl_count[bits - 1]) << 1;
    next_code[bits] = code;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    let len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
};


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
const tr_static_init = () => {

  let n;        /* iterates over tree elements */
  let bits;     /* bit counter */
  let length;   /* length value */
  let code;     /* code value */
  let dist;     /* distance index */
  const bl_count = new Array(MAX_BITS$1 + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES$1 - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES$1; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS$1; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES$1 + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES$1; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS$1 + 1, L_CODES$1, MAX_BITS$1);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES$1, MAX_BITS$1);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES$1, MAX_BL_BITS);

  //static_init_done = true;
};


/* ===========================================================================
 * Initialize a new block.
 */
const init_block = (s) => {

  let n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES$1;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES$1;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES$1; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.sym_next = s.matches = 0;
};


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
const bi_windup = (s) =>
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
};

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
const smaller = (tree, n, m, depth) => {

  const _n2 = n * 2;
  const _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
};

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
const pqdownheap = (s, tree, k) => {
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */

  const v = s.heap[k];
  let j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
};


// inlined manually
// const SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
const compress_block = (s, ltree, dtree) => {
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */

  let dist;           /* distance of matched string */
  let lc;             /* match length or unmatched char (if dist == 0) */
  let sx = 0;         /* running index in sym_buf */
  let code;           /* the code to send */
  let extra;          /* number of extra bits to send */

  if (s.sym_next !== 0) {
    do {
      dist = s.pending_buf[s.sym_buf + sx++] & 0xff;
      dist += (s.pending_buf[s.sym_buf + sx++] & 0xff) << 8;
      lc = s.pending_buf[s.sym_buf + sx++];
      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS$1 + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and sym_buf is ok: */
      //Assert(s->pending < s->lit_bufsize + sx, "pendingBuf overflow");

    } while (sx < s.sym_next);
  }

  send_code(s, END_BLOCK, ltree);
};


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
const build_tree = (s, desc) => {
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */

  const tree     = desc.dyn_tree;
  const stree    = desc.stat_desc.static_tree;
  const has_stree = desc.stat_desc.has_stree;
  const elems    = desc.stat_desc.elems;
  let n, m;          /* iterate over heap elements */
  let max_code = -1; /* largest code with non zero frequency */
  let node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE$1;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
};


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
const scan_tree = (s, tree, max_code) => {
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */

  let n;                     /* iterates over all tree elements */
  let prevlen = -1;          /* last emitted length */
  let curlen;                /* length of current code */

  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  let count = 0;             /* repeat count of the current code */
  let max_count = 7;         /* max repeat count */
  let min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
const send_tree = (s, tree, max_code) => {
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */

  let n;                     /* iterates over all tree elements */
  let prevlen = -1;          /* last emitted length */
  let curlen;                /* length of current code */

  let nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  let count = 0;             /* repeat count of the current code */
  let max_count = 7;         /* max repeat count */
  let min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
};


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
const build_bl_tree = (s) => {

  let max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES$1 - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
};


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
const send_all_trees = (s, lcodes, dcodes, blcodes) => {
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */

  let rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
};


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "block list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "allow list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
const detect_data_type = (s) => {
  /* block_mask is the bit mask of block-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  let block_mask = 0xf3ffc07f;
  let n;

  /* Check for non-textual ("block-listed") bytes. */
  for (n = 0; n <= 31; n++, block_mask >>>= 1) {
    if ((block_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("allow-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS$1; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "block-listed" or "allow-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
};


let static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
const _tr_init$1 = (s) =>
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
};


/* ===========================================================================
 * Send a stored block
 */
const _tr_stored_block$1 = (s, buf, stored_len, last) => {
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */

  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  bi_windup(s);        /* align on byte boundary */
  put_short(s, stored_len);
  put_short(s, ~stored_len);
  if (stored_len) {
    s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
  }
  s.pending += stored_len;
};


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
const _tr_align$1 = (s) => {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
};


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and write out the encoded block.
 */
const _tr_flush_block$1 = (s, buf, stored_len, last) => {
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */

  let opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  let max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN$1) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->sym_next / 3));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block$1(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
};

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
const _tr_tally$1 = (s, dist, lc) => {
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */

  s.pending_buf[s.sym_buf + s.sym_next++] = dist;
  s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
  s.pending_buf[s.sym_buf + s.sym_next++] = lc;
  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

  return (s.sym_next === s.sym_end);
};

var _tr_init_1  = _tr_init$1;
var _tr_stored_block_1 = _tr_stored_block$1;
var _tr_flush_block_1  = _tr_flush_block$1;
var _tr_tally_1 = _tr_tally$1;
var _tr_align_1 = _tr_align$1;

var trees = {
	_tr_init: _tr_init_1,
	_tr_stored_block: _tr_stored_block_1,
	_tr_flush_block: _tr_flush_block_1,
	_tr_tally: _tr_tally_1,
	_tr_align: _tr_align_1
};

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const adler32 = (adler, buf, len, pos) => {
  let s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
};


var adler32_1 = adler32;

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
const makeTable = () => {
  let c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
};

// Create table on load. Just 255 signed longs. Not a problem.
const crcTable = new Uint32Array(makeTable());


const crc32 = (crc, buf, len, pos) => {
  const t = crcTable;
  const end = pos + len;

  crc ^= -1;

  for (let i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
};


var crc32_1 = crc32;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var messages = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var constants$2 = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  Z_MEM_ERROR:       -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = trees;




/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH: Z_NO_FLUSH$2, Z_PARTIAL_FLUSH, Z_FULL_FLUSH: Z_FULL_FLUSH$1, Z_FINISH: Z_FINISH$3, Z_BLOCK: Z_BLOCK$1,
  Z_OK: Z_OK$3, Z_STREAM_END: Z_STREAM_END$3, Z_STREAM_ERROR: Z_STREAM_ERROR$2, Z_DATA_ERROR: Z_DATA_ERROR$2, Z_BUF_ERROR: Z_BUF_ERROR$1,
  Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1,
  Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1,
  Z_UNKNOWN,
  Z_DEFLATED: Z_DEFLATED$2
} = constants$2;

/*============================================================================*/


const MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
const MAX_WBITS$1 = 15;
/* 32K LZ77 window */
const DEF_MEM_LEVEL = 8;


const LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
const LITERALS      = 256;
/* number of literal bytes 0..255 */
const L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
const D_CODES       = 30;
/* number of distance codes */
const BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
const HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */
const MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

const MIN_MATCH = 3;
const MAX_MATCH = 258;
const MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

const PRESET_DICT = 0x20;

const INIT_STATE    =  42;    /* zlib header -> BUSY_STATE */
//#ifdef GZIP
const GZIP_STATE    =  57;    /* gzip header -> BUSY_STATE | EXTRA_STATE */
//#endif
const EXTRA_STATE   =  69;    /* gzip extra block -> NAME_STATE */
const NAME_STATE    =  73;    /* gzip file name -> COMMENT_STATE */
const COMMENT_STATE =  91;    /* gzip comment -> HCRC_STATE */
const HCRC_STATE    = 103;    /* gzip header CRC -> BUSY_STATE */
const BUSY_STATE    = 113;    /* deflate -> FINISH_STATE */
const FINISH_STATE  = 666;    /* stream complete */

const BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
const BS_BLOCK_DONE     = 2; /* block flush performed */
const BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
const BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

const OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

const err = (strm, errorCode) => {
  strm.msg = messages[errorCode];
  return errorCode;
};

const rank = (f) => {
  return ((f) * 2) - ((f) > 4 ? 9 : 0);
};

const zero = (buf) => {
  let len = buf.length; while (--len >= 0) { buf[len] = 0; }
};

/* ===========================================================================
 * Slide the hash table when sliding the window down (could be avoided with 32
 * bit values at the expense of memory usage). We slide even when level == 0 to
 * keep the hash table consistent if we switch back to level > 0 later.
 */
const slide_hash = (s) => {
  let n, m;
  let p;
  let wsize = s.w_size;

  n = s.hash_size;
  p = n;
  do {
    m = s.head[--p];
    s.head[p] = (m >= wsize ? m - wsize : 0);
  } while (--n);
  n = wsize;
//#ifndef FASTEST
  p = n;
  do {
    m = s.prev[--p];
    s.prev[p] = (m >= wsize ? m - wsize : 0);
    /* If n is not on any hash chain, prev[n] is garbage but
     * its value will never be used.
     */
  } while (--n);
//#endif
};

/* eslint-disable new-cap */
let HASH_ZLIB = (s, prev, data) => ((prev << s.hash_shift) ^ data) & s.hash_mask;
// This hash causes less collisions, https://github.com/nodeca/pako/issues/135
// But breaks binary compatibility
//let HASH_FAST = (s, prev, data) => ((prev << 8) + (prev >> 8) + (data << 4)) & s.hash_mask;
let HASH = HASH_ZLIB;


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output, except for
 * some deflate_stored() output, goes through this function so some
 * applications may wish to modify it to avoid allocating a large
 * strm->next_out buffer and copying into it. (See also read_buf()).
 */
const flush_pending = (strm) => {
  const s = strm.state;

  //_tr_flush_bits(s);
  let len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
  strm.next_out  += len;
  s.pending_out  += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending      -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
};


const flush_block_only = (s, last) => {
  _tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
};


const put_byte = (s, b) => {
  s.pending_buf[s.pending++] = b;
};


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
const putShortMSB = (s, b) => {

  //  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
};


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
const read_buf = (strm, buf, start, size) => {

  let len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32_1(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32_1(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
};


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
const longest_match = (s, cur_match) => {

  let chain_length = s.max_chain_length;      /* max hash chain length */
  let scan = s.strstart; /* current string */
  let match;                       /* matched string */
  let len;                           /* length of current match */
  let best_len = s.prev_length;              /* best match length so far */
  let nice_match = s.nice_match;             /* stop if match long enough */
  const limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  const _win = s.window; // shortcut

  const wmask = s.w_mask;
  const prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  const strend = s.strstart + MAX_MATCH;
  let scan_end1  = _win[scan + best_len - 1];
  let scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
};


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
const fill_window = (s) => {

  const _w_size = s.w_size;
  let n, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;
      if (s.insert > s.strstart) {
        s.insert = s.strstart;
      }
      slide_hash(s);
      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    const curr = s.strstart + s.lookahead;
//    let init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
};

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 *
 * In case deflateParams() is used to later switch to a non-zero compression
 * level, s->matches (otherwise unused when storing) keeps track of the number
 * of hash table slides to perform. If s->matches is 1, then one hash table
 * slide will be done when switching. If s->matches is 2, the maximum value
 * allowed here, then the hash table will be cleared, since two or more slides
 * is the same as a clear.
 *
 * deflate_stored() is written to minimize the number of times an input byte is
 * copied. It is most efficient with large input and output buffers, which
 * maximizes the opportunites to have a single copy from next_in to next_out.
 */
const deflate_stored = (s, flush) => {

  /* Smallest worthy block size when not flushing or finishing. By default
   * this is 32K. This can be as small as 507 bytes for memLevel == 1. For
   * large input and output buffers, the stored block size will be larger.
   */
  let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;

  /* Copy as many min_block or larger stored blocks directly to next_out as
   * possible. If flushing, copy the remaining available input to next_out as
   * stored blocks, if there is enough space.
   */
  let len, left, have, last = 0;
  let used = s.strm.avail_in;
  do {
    /* Set len to the maximum size block that we can copy directly with the
     * available input data and output space. Set left to how much of that
     * would be copied from what's left in the window.
     */
    len = 65535/* MAX_STORED */;     /* maximum deflate stored block length */
    have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
    if (s.strm.avail_out < have) {         /* need room for header */
      break;
    }
      /* maximum stored block length that will fit in avail_out: */
    have = s.strm.avail_out - have;
    left = s.strstart - s.block_start;  /* bytes left in window */
    if (len > left + s.strm.avail_in) {
      len = left + s.strm.avail_in;   /* limit len to the input */
    }
    if (len > have) {
      len = have;             /* limit len to the output */
    }

    /* If the stored block would be less than min_block in length, or if
     * unable to copy all of the available input when flushing, then try
     * copying to the window and the pending buffer instead. Also don't
     * write an empty block when flushing -- deflate() does that.
     */
    if (len < min_block && ((len === 0 && flush !== Z_FINISH$3) ||
                        flush === Z_NO_FLUSH$2 ||
                        len !== left + s.strm.avail_in)) {
      break;
    }

    /* Make a dummy stored block in pending to get the header bytes,
     * including any pending bits. This also updates the debugging counts.
     */
    last = flush === Z_FINISH$3 && len === left + s.strm.avail_in ? 1 : 0;
    _tr_stored_block(s, 0, 0, last);

    /* Replace the lengths in the dummy stored block with len. */
    s.pending_buf[s.pending - 4] = len;
    s.pending_buf[s.pending - 3] = len >> 8;
    s.pending_buf[s.pending - 2] = ~len;
    s.pending_buf[s.pending - 1] = ~len >> 8;

    /* Write the stored block header bytes. */
    flush_pending(s.strm);

//#ifdef ZLIB_DEBUG
//    /* Update debugging counts for the data about to be copied. */
//    s->compressed_len += len << 3;
//    s->bits_sent += len << 3;
//#endif

    /* Copy uncompressed bytes from the window to next_out. */
    if (left) {
      if (left > len) {
        left = len;
      }
      //zmemcpy(s->strm->next_out, s->window + s->block_start, left);
      s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
      s.strm.next_out += left;
      s.strm.avail_out -= left;
      s.strm.total_out += left;
      s.block_start += left;
      len -= left;
    }

    /* Copy uncompressed bytes directly from next_in to next_out, updating
     * the check value.
     */
    if (len) {
      read_buf(s.strm, s.strm.output, s.strm.next_out, len);
      s.strm.next_out += len;
      s.strm.avail_out -= len;
      s.strm.total_out += len;
    }
  } while (last === 0);

  /* Update the sliding window with the last s->w_size bytes of the copied
   * data, or append all of the copied data to the existing window if less
   * than s->w_size bytes were copied. Also update the number of bytes to
   * insert in the hash tables, in the event that deflateParams() switches to
   * a non-zero compression level.
   */
  used -= s.strm.avail_in;    /* number of input bytes directly copied */
  if (used) {
    /* If any input was used, then no unused input remains in the window,
     * therefore s->block_start == s->strstart.
     */
    if (used >= s.w_size) {  /* supplant the previous history */
      s.matches = 2;     /* clear hash */
      //zmemcpy(s->window, s->strm->next_in - s->w_size, s->w_size);
      s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
      s.strstart = s.w_size;
      s.insert = s.strstart;
    }
    else {
      if (s.window_size - s.strstart <= used) {
        /* Slide the window down. */
        s.strstart -= s.w_size;
        //zmemcpy(s->window, s->window + s->w_size, s->strstart);
        s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
        if (s.matches < 2) {
          s.matches++;   /* add a pending slide_hash() */
        }
        if (s.insert > s.strstart) {
          s.insert = s.strstart;
        }
      }
      //zmemcpy(s->window + s->strstart, s->strm->next_in - used, used);
      s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
      s.strstart += used;
      s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
    }
    s.block_start = s.strstart;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }

  /* If the last block was written to next_out, then done. */
  if (last) {
    return BS_FINISH_DONE;
  }

  /* If flushing and all input has been consumed, then done. */
  if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 &&
    s.strm.avail_in === 0 && s.strstart === s.block_start) {
    return BS_BLOCK_DONE;
  }

  /* Fill the window with any remaining input. */
  have = s.window_size - s.strstart;
  if (s.strm.avail_in > have && s.block_start >= s.w_size) {
    /* Slide the window down. */
    s.block_start -= s.w_size;
    s.strstart -= s.w_size;
    //zmemcpy(s->window, s->window + s->w_size, s->strstart);
    s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
    if (s.matches < 2) {
      s.matches++;       /* add a pending slide_hash() */
    }
    have += s.w_size;      /* more space now */
    if (s.insert > s.strstart) {
      s.insert = s.strstart;
    }
  }
  if (have > s.strm.avail_in) {
    have = s.strm.avail_in;
  }
  if (have) {
    read_buf(s.strm, s.window, s.strstart, have);
    s.strstart += have;
    s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
  }
  if (s.high_water < s.strstart) {
    s.high_water = s.strstart;
  }

  /* There was not enough avail_out to write a complete worthy or flushed
   * stored block to next_out. Write a stored block to pending instead, if we
   * have enough input for a worthy block, or if flushing and there is enough
   * room for the remaining input as a stored block in the pending buffer.
   */
  have = (s.bi_valid + 42) >> 3;     /* number of header bytes */
    /* maximum stored block length that will fit in pending: */
  have = s.pending_buf_size - have > 65535/* MAX_STORED */ ? 65535/* MAX_STORED */ : s.pending_buf_size - have;
  min_block = have > s.w_size ? s.w_size : have;
  left = s.strstart - s.block_start;
  if (left >= min_block ||
     ((left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 &&
     s.strm.avail_in === 0 && left <= have)) {
    len = left > have ? have : left;
    last = flush === Z_FINISH$3 && s.strm.avail_in === 0 &&
         len === left ? 1 : 0;
    _tr_stored_block(s, s.block_start, len, last);
    s.block_start += len;
    flush_pending(s.strm);
  }

  /* We've done all we can with the available input and output. */
  return last ? BS_FINISH_STARTED : BS_NEED_MORE;
};


/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
const deflate_fast = (s, flush) => {

  let hash_head;        /* head of the hash chain */
  let bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
const deflate_slow = (s, flush) => {

  let hash_head;          /* head of hash chain */
  let bflush;              /* set if current block must be flushed */

  let max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
};


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
const deflate_rle = (s, flush) => {

  let bflush;            /* set if current block must be flushed */
  let prev;              /* byte at distance one to match */
  let scan, strend;      /* scan goes up to strend for length of run */

  const _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = _tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
const deflate_huff = (s, flush) => {

  let bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH$2) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = _tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH$3) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.sym_next) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
};

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {

  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

const configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
const lm_init = (s) => {

  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
};


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED$2; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new Uint16Array(HEAP_SIZE * 2);
  this.dyn_dtree  = new Uint16Array((2 * D_CODES + 1) * 2);
  this.bl_tree    = new Uint16Array((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new Uint16Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new Uint16Array(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new Uint16Array(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.sym_buf = 0;        /* buffer for distances and literals/lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.sym_next = 0;      /* running index in sym_buf */
  this.sym_end = 0;       /* symbol table full when sym_next reaches this */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


/* =========================================================================
 * Check for a valid deflate stream state. Return 0 if ok, 1 if not.
 */
const deflateStateCheck = (strm) => {

  if (!strm) {
    return 1;
  }
  const s = strm.state;
  if (!s || s.strm !== strm || (s.status !== INIT_STATE &&
//#ifdef GZIP
                                s.status !== GZIP_STATE &&
//#endif
                                s.status !== EXTRA_STATE &&
                                s.status !== NAME_STATE &&
                                s.status !== COMMENT_STATE &&
                                s.status !== HCRC_STATE &&
                                s.status !== BUSY_STATE &&
                                s.status !== FINISH_STATE)) {
    return 1;
  }
  return 0;
};


const deflateResetKeep = (strm) => {

  if (deflateStateCheck(strm)) {
    return err(strm, Z_STREAM_ERROR$2);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  const s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status =
//#ifdef GZIP
    s.wrap === 2 ? GZIP_STATE :
//#endif
    s.wrap ? INIT_STATE : BUSY_STATE;
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = -2;
  _tr_init(s);
  return Z_OK$3;
};


const deflateReset = (strm) => {

  const ret = deflateResetKeep(strm);
  if (ret === Z_OK$3) {
    lm_init(strm.state);
  }
  return ret;
};


const deflateSetHeader = (strm, head) => {

  if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
    return Z_STREAM_ERROR$2;
  }
  strm.state.gzhead = head;
  return Z_OK$3;
};


const deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {

  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR$2;
  }
  let wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION$1) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED || (windowBits === 8 && wrap !== 1)) {
    return err(strm, Z_STREAM_ERROR$2);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  const s = new DeflateState();

  strm.state = s;
  s.strm = strm;
  s.status = INIT_STATE;     /* to pass state test in deflateReset() */

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new Uint8Array(s.w_size * 2);
  s.head = new Uint16Array(s.hash_size);
  s.prev = new Uint16Array(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  /* We overlay pending_buf and sym_buf. This works since the average size
   * for length/distance pairs over any compressed block is assured to be 31
   * bits or less.
   *
   * Analysis: The longest fixed codes are a length code of 8 bits plus 5
   * extra bits, for lengths 131 to 257. The longest fixed distance codes are
   * 5 bits plus 13 extra bits, for distances 16385 to 32768. The longest
   * possible fixed-codes length/distance pair is then 31 bits total.
   *
   * sym_buf starts one-fourth of the way into pending_buf. So there are
   * three bytes in sym_buf for every four bytes in pending_buf. Each symbol
   * in sym_buf is three bytes -- two for the distance and one for the
   * literal/length. As each symbol is consumed, the pointer to the next
   * sym_buf value to read moves forward three bytes. From that symbol, up to
   * 31 bits are written to pending_buf. The closest the written pending_buf
   * bits gets to the next sym_buf symbol to read is just before the last
   * code is written. At that time, 31*(n-2) bits have been written, just
   * after 24*(n-2) bits have been consumed from sym_buf. sym_buf starts at
   * 8*n bits into pending_buf. (Note that the symbol buffer fills when n-1
   * symbols are written.) The closest the writing gets to what is unread is
   * then n+14 bits. Here n is lit_bufsize, which is 16384 by default, and
   * can range from 128 to 32768.
   *
   * Therefore, at a minimum, there are 142 bits of space between what is
   * written and what is read in the overlain buffers, so the symbols cannot
   * be overwritten by the compressed data. That space is actually 139 bits,
   * due to the three-bit fixed-code block header.
   *
   * That covers the case where either Z_FIXED is specified, forcing fixed
   * codes, or when the use of fixed codes is chosen, because that choice
   * results in a smaller compressed block than dynamic codes. That latter
   * condition then assures that the above analysis also covers all dynamic
   * blocks. A dynamic-code block will only be chosen to be emitted if it has
   * fewer bits than a fixed-code block would for the same set of symbols.
   * Therefore its average symbol length is assured to be less than 31. So
   * the compressed data for a dynamic block also cannot overwrite the
   * symbols from which it is being constructed.
   */

  s.pending_buf_size = s.lit_bufsize * 4;
  s.pending_buf = new Uint8Array(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->sym_buf = s->pending_buf + s->lit_bufsize;
  s.sym_buf = s.lit_bufsize;

  //s->sym_end = (s->lit_bufsize - 1) * 3;
  s.sym_end = (s.lit_bufsize - 1) * 3;
  /* We avoid equality with lit_bufsize*3 because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
};

const deflateInit = (strm, level) => {

  return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
};


/* ========================================================================= */
const deflate$2 = (strm, flush) => {

  if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
  }

  const s = strm.state;

  if (!strm.output ||
      (strm.avail_in !== 0 && !strm.input) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH$3)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR$1 : Z_STREAM_ERROR$2);
  }

  const old_flush = s.last_flush;
  s.last_flush = flush;

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK$3;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH$3) {
    return err(strm, Z_BUF_ERROR$1);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR$1);
  }

  /* Write the header */
  if (s.status === INIT_STATE && s.wrap === 0) {
    s.status = BUSY_STATE;
  }
  if (s.status === INIT_STATE) {
    /* zlib header */
    let header = (Z_DEFLATED$2 + ((s.w_bits - 8) << 4)) << 8;
    let level_flags = -1;

    if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
      level_flags = 0;
    } else if (s.level < 6) {
      level_flags = 1;
    } else if (s.level === 6) {
      level_flags = 2;
    } else {
      level_flags = 3;
    }
    header |= (level_flags << 6);
    if (s.strstart !== 0) { header |= PRESET_DICT; }
    header += 31 - (header % 31);

    putShortMSB(s, header);

    /* Save the adler32 of the preset dictionary: */
    if (s.strstart !== 0) {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 0xffff);
    }
    strm.adler = 1; // adler32(0L, Z_NULL, 0);
    s.status = BUSY_STATE;

    /* Compression must start with an empty pending buffer */
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
//#ifdef GZIP
  if (s.status === GZIP_STATE) {
    /* gzip header */
    strm.adler = 0;  //crc32(0L, Z_NULL, 0);
    put_byte(s, 31);
    put_byte(s, 139);
    put_byte(s, 8);
    if (!s.gzhead) { // s->gzhead == Z_NULL
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, 0);
      put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                   4 : 0));
      put_byte(s, OS_CODE);
      s.status = BUSY_STATE;

      /* Compression must start with an empty pending buffer */
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return Z_OK$3;
      }
    }
    else {
      put_byte(s, (s.gzhead.text ? 1 : 0) +
                  (s.gzhead.hcrc ? 2 : 0) +
                  (!s.gzhead.extra ? 0 : 4) +
                  (!s.gzhead.name ? 0 : 8) +
                  (!s.gzhead.comment ? 0 : 16)
      );
      put_byte(s, s.gzhead.time & 0xff);
      put_byte(s, (s.gzhead.time >> 8) & 0xff);
      put_byte(s, (s.gzhead.time >> 16) & 0xff);
      put_byte(s, (s.gzhead.time >> 24) & 0xff);
      put_byte(s, s.level === 9 ? 2 :
                  (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                   4 : 0));
      put_byte(s, s.gzhead.os & 0xff);
      if (s.gzhead.extra && s.gzhead.extra.length) {
        put_byte(s, s.gzhead.extra.length & 0xff);
        put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
      }
      if (s.gzhead.hcrc) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
      }
      s.gzindex = 0;
      s.status = EXTRA_STATE;
    }
  }
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let left = (s.gzhead.extra.length & 0xffff) - s.gzindex;
      while (s.pending + left > s.pending_buf_size) {
        let copy = s.pending_buf_size - s.pending;
        // zmemcpy(s.pending_buf + s.pending,
        //    s.gzhead.extra + s.gzindex, copy);
        s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
        s.pending = s.pending_buf_size;
        //--- HCRC_UPDATE(beg) ---//
        if (s.gzhead.hcrc && s.pending > beg) {
          strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
        }
        //---//
        s.gzindex += copy;
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
        beg = 0;
        left -= copy;
      }
      // JS specific: s.gzhead.extra may be TypedArray or Array for backward compatibility
      //              TypedArray.slice and TypedArray.from don't exist in IE10-IE11
      let gzhead_extra = new Uint8Array(s.gzhead.extra);
      // zmemcpy(s->pending_buf + s->pending,
      //     s->gzhead->extra + s->gzindex, left);
      s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
      s.pending += left;
      //--- HCRC_UPDATE(beg) ---//
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      //---//
      s.gzindex = 0;
    }
    s.status = NAME_STATE;
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          //--- HCRC_UPDATE(beg) ---//
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          //---//
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      //--- HCRC_UPDATE(beg) ---//
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      //---//
      s.gzindex = 0;
    }
    s.status = COMMENT_STATE;
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      let beg = s.pending;   /* start of bytes to update crc */
      let val;
      do {
        if (s.pending === s.pending_buf_size) {
          //--- HCRC_UPDATE(beg) ---//
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          //---//
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK$3;
          }
          beg = 0;
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);
      //--- HCRC_UPDATE(beg) ---//
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      //---//
    }
    s.status = HCRC_STATE;
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return Z_OK$3;
        }
      }
      put_byte(s, strm.adler & 0xff);
      put_byte(s, (strm.adler >> 8) & 0xff);
      strm.adler = 0; //crc32(0L, Z_NULL, 0);
    }
    s.status = BUSY_STATE;

    /* Compression must start with an empty pending buffer */
    flush_pending(strm);
    if (s.pending !== 0) {
      s.last_flush = -1;
      return Z_OK$3;
    }
  }
//#endif

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE)) {
    let bstate = s.level === 0 ? deflate_stored(s, flush) :
                 s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) :
                 s.strategy === Z_RLE ? deflate_rle(s, flush) :
                 configuration_table[s.level].func(s, flush);

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK$3;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        _tr_align(s);
      }
      else if (flush !== Z_BLOCK$1) { /* FULL_FLUSH or SYNC_FLUSH */

        _tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH$1) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK$3;
      }
    }
  }

  if (flush !== Z_FINISH$3) { return Z_OK$3; }
  if (s.wrap <= 0) { return Z_STREAM_END$3; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
};


const deflateEnd = (strm) => {

  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }

  const status = strm.state.status;

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
};


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
const deflateSetDictionary = (strm, dictionary) => {

  let dictLength = dictionary.length;

  if (deflateStateCheck(strm)) {
    return Z_STREAM_ERROR$2;
  }

  const s = strm.state;
  const wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR$2;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    let tmpDict = new Uint8Array(s.w_size);
    tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  const avail = strm.avail_in;
  const next = strm.next_in;
  const input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    let str = s.strstart;
    let n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK$3;
};


var deflateInit_1 = deflateInit;
var deflateInit2_1 = deflateInit2;
var deflateReset_1 = deflateReset;
var deflateResetKeep_1 = deflateResetKeep;
var deflateSetHeader_1 = deflateSetHeader;
var deflate_2$1 = deflate$2;
var deflateEnd_1 = deflateEnd;
var deflateSetDictionary_1 = deflateSetDictionary;
var deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
module.exports.deflateBound = deflateBound;
module.exports.deflateCopy = deflateCopy;
module.exports.deflateGetDictionary = deflateGetDictionary;
module.exports.deflateParams = deflateParams;
module.exports.deflatePending = deflatePending;
module.exports.deflatePrime = deflatePrime;
module.exports.deflateTune = deflateTune;
*/

var deflate_1$2 = {
	deflateInit: deflateInit_1,
	deflateInit2: deflateInit2_1,
	deflateReset: deflateReset_1,
	deflateResetKeep: deflateResetKeep_1,
	deflateSetHeader: deflateSetHeader_1,
	deflate: deflate_2$1,
	deflateEnd: deflateEnd_1,
	deflateSetDictionary: deflateSetDictionary_1,
	deflateInfo: deflateInfo
};

const _has = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

var assign = function (obj /*from1, from2, from3, ...*/) {
  const sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    const source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (const p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// Join array of chunks to single array.
var flattenChunks = (chunks) => {
  // calculate data length
  let len = 0;

  for (let i = 0, l = chunks.length; i < l; i++) {
    len += chunks[i].length;
  }

  // join chunks
  const result = new Uint8Array(len);

  for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
    let chunk = chunks[i];
    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
};

var common = {
	assign: assign,
	flattenChunks: flattenChunks
};

// String encode/decode helpers


// Quick check if we can use fast array to bin string conversion
//
// - apply(Array) can fail on Android 2.2
// - apply(Uint8Array) can fail on iOS 5.1 Safari
//
let STR_APPLY_UIA_OK = true;

try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }


// Table with utf8 lengths (calculated by first byte of sequence)
// Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
// because max possible codepoint is 0x10ffff
const _utf8len = new Uint8Array(256);
for (let q = 0; q < 256; q++) {
  _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


// convert string to array (typed, when possible)
var string2buf = (str) => {
  if (typeof TextEncoder === 'function' && TextEncoder.prototype.encode) {
    return new TextEncoder().encode(str);
  }

  let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;

  // count binary size
  for (m_pos = 0; m_pos < str_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  buf = new Uint8Array(buf_len);

  // convert
  for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
    c = str.charCodeAt(m_pos);
    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
      c2 = str.charCodeAt(m_pos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        m_pos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xC0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xE0 | (c >>> 12);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | (c >>> 12 & 0x3f);
      buf[i++] = 0x80 | (c >>> 6 & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
};

// Helper
const buf2binstring = (buf, len) => {
  // On Chrome, the arguments in a function call that are allowed is `65534`.
  // If the length of the buffer is smaller than that, we can use this optimization,
  // otherwise we will take a slower path.
  if (len < 65534) {
    if (buf.subarray && STR_APPLY_UIA_OK) {
      return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
    }
  }

  let result = '';
  for (let i = 0; i < len; i++) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
};


// convert array to string
var buf2string = (buf, max) => {
  const len = max || buf.length;

  if (typeof TextDecoder === 'function' && TextDecoder.prototype.decode) {
    return new TextDecoder().decode(buf.subarray(0, max));
  }

  let i, out;

  // Reserve max possible length (2 words per char)
  // NB: by unknown reasons, Array is significantly faster for
  //     String.fromCharCode.apply than Uint16Array.
  const utf16buf = new Array(len * 2);

  for (out = 0, i = 0; i < len;) {
    let c = buf[i++];
    // quick process ascii
    if (c < 0x80) { utf16buf[out++] = c; continue; }

    let c_len = _utf8len[c];
    // skip 5 & 6 byte codes
    if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }

    // apply mask on first byte
    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
    // join the rest
    while (c_len > 1 && i < len) {
      c = (c << 6) | (buf[i++] & 0x3f);
      c_len--;
    }

    // terminated by end of string?
    if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }

    if (c < 0x10000) {
      utf16buf[out++] = c;
    } else {
      c -= 0x10000;
      utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
      utf16buf[out++] = 0xdc00 | (c & 0x3ff);
    }
  }

  return buf2binstring(utf16buf, out);
};


// Calculate max possible position in utf8 buffer,
// that will not break sequence. If that's not possible
// - (very small limits) return max size as is.
//
// buf[] - utf8 bytes array
// max   - length limit (mandatory);
var utf8border = (buf, max) => {

  max = max || buf.length;
  if (max > buf.length) { max = buf.length; }

  // go back from last position, until start of sequence found
  let pos = max - 1;
  while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }

  // Very small and broken sequence,
  // return max, because we should return something anyway.
  if (pos < 0) { return max; }

  // If we came to start of buffer - that means buffer is too small,
  // return max too.
  if (pos === 0) { return max; }

  return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};

var strings = {
	string2buf: string2buf,
	buf2string: buf2string,
	utf8border: utf8border
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

var zstream = ZStream;

const toString$1 = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH: Z_NO_FLUSH$1, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH: Z_FINISH$2,
  Z_OK: Z_OK$2, Z_STREAM_END: Z_STREAM_END$2,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_STRATEGY,
  Z_DEFLATED: Z_DEFLATED$1
} = constants$2;

/* ===========================================================================*/


/**
 * class Deflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[deflate]],
 * [[deflateRaw]] and [[gzip]].
 **/

/* internal
 * Deflate.chunks -> Array
 *
 * Chunks of output data, if [[Deflate#onData]] not overridden.
 **/

/**
 * Deflate.result -> Uint8Array
 *
 * Compressed result, generated by default [[Deflate#onData]]
 * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Deflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Deflate.err -> Number
 *
 * Error code after deflate finished. 0 (Z_OK) on success.
 * You will not need it in real life, because deflate errors
 * are possible only on wrong options or bad `onData` / `onEnd`
 * custom handlers.
 **/

/**
 * Deflate.msg -> String
 *
 * Error message, if [[Deflate.err]] != 0
 **/


/**
 * new Deflate(options)
 * - options (Object): zlib deflate options.
 *
 * Creates new deflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `level`
 * - `windowBits`
 * - `memLevel`
 * - `strategy`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw deflate
 * - `gzip` (Boolean) - create gzip wrapper
 * - `header` (Object) - custom header for gzip
 *   - `text` (Boolean) - true if compressed data believed to be text
 *   - `time` (Number) - modification time, unix timestamp
 *   - `os` (Number) - operation system code
 *   - `extra` (Array) - array of bytes with extra data (max 65536)
 *   - `name` (String) - file name (binary string)
 *   - `comment` (String) - comment (binary string)
 *   - `hcrc` (Boolean) - true if header crc should be added
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 *   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 *   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const deflate = new pako.Deflate({ level: 3});
 *
 * deflate.push(chunk1, false);
 * deflate.push(chunk2, true);  // true -> last chunk
 *
 * if (deflate.err) { throw new Error(deflate.err); }
 *
 * console.log(deflate.result);
 * ```
 **/
function Deflate$1(options) {
  this.options = common.assign({
    level: Z_DEFAULT_COMPRESSION,
    method: Z_DEFLATED$1,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Z_DEFAULT_STRATEGY
  }, options || {});

  let opt = this.options;

  if (opt.raw && (opt.windowBits > 0)) {
    opt.windowBits = -opt.windowBits;
  }

  else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
    opt.windowBits += 16;
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm = new zstream();
  this.strm.avail_out = 0;

  let status = deflate_1$2.deflateInit2(
    this.strm,
    opt.level,
    opt.method,
    opt.windowBits,
    opt.memLevel,
    opt.strategy
  );

  if (status !== Z_OK$2) {
    throw new Error(messages[status]);
  }

  if (opt.header) {
    deflate_1$2.deflateSetHeader(this.strm, opt.header);
  }

  if (opt.dictionary) {
    let dict;
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      // If we need to compress text, change encoding to utf8.
      dict = strings.string2buf(opt.dictionary);
    } else if (toString$1.call(opt.dictionary) === '[object ArrayBuffer]') {
      dict = new Uint8Array(opt.dictionary);
    } else {
      dict = opt.dictionary;
    }

    status = deflate_1$2.deflateSetDictionary(this.strm, dict);

    if (status !== Z_OK$2) {
      throw new Error(messages[status]);
    }

    this._dict_set = true;
  }
}

/**
 * Deflate#push(data[, flush_mode]) -> Boolean
 * - data (Uint8Array|ArrayBuffer|String): input data. Strings will be
 *   converted to utf8 byte sequence.
 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
 *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
 *
 * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
 * new compressed chunks. Returns `true` on success. The last data block must
 * have `flush_mode` Z_FINISH (or `true`). That will flush internal pending
 * buffers and call [[Deflate#onEnd]].
 *
 * On fail call [[Deflate#onEnd]] with error code and return false.
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Deflate$1.prototype.push = function (data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  let status, _flush_mode;

  if (this.ended) { return false; }

  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;

  // Convert data if needed
  if (typeof data === 'string') {
    // If we need to compress text, change encoding to utf8.
    strm.input = strings.string2buf(data);
  } else if (toString$1.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  for (;;) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    // Make sure avail_out > 6 to avoid repeating markers
    if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }

    status = deflate_1$2.deflate(strm, _flush_mode);

    // Ended => flush and finish
    if (status === Z_STREAM_END$2) {
      if (strm.next_out > 0) {
        this.onData(strm.output.subarray(0, strm.next_out));
      }
      status = deflate_1$2.deflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return status === Z_OK$2;
    }

    // Flush if out buffer full
    if (strm.avail_out === 0) {
      this.onData(strm.output);
      continue;
    }

    // Flush if requested and has data
    if (_flush_mode > 0 && strm.next_out > 0) {
      this.onData(strm.output.subarray(0, strm.next_out));
      strm.avail_out = 0;
      continue;
    }

    if (strm.avail_in === 0) break;
  }

  return true;
};


/**
 * Deflate#onData(chunk) -> Void
 * - chunk (Uint8Array): output data.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Deflate$1.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Deflate#onEnd(status) -> Void
 * - status (Number): deflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called once after you tell deflate that the input stream is
 * complete (Z_FINISH). By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Deflate$1.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK$2) {
    this.result = common.flattenChunks(this.chunks);
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * deflate(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * Compress `data` with deflate algorithm and `options`.
 *
 * Supported options are:
 *
 * - level
 * - windowBits
 * - memLevel
 * - strategy
 * - dictionary
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
 *
 * console.log(pako.deflate(data));
 * ```
 **/
function deflate$1(input, options) {
  const deflator = new Deflate$1(options);

  deflator.push(input, true);

  // That will never happens, if you don't cheat with options :)
  if (deflator.err) { throw deflator.msg || messages[deflator.err]; }

  return deflator.result;
}


/**
 * deflateRaw(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function deflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return deflate$1(input, options);
}


/**
 * gzip(data[, options]) -> Uint8Array
 * - data (Uint8Array|ArrayBuffer|String): input data to compress.
 * - options (Object): zlib deflate options.
 *
 * The same as [[deflate]], but create gzip wrapper instead of
 * deflate one.
 **/
function gzip$1(input, options) {
  options = options || {};
  options.gzip = true;
  return deflate$1(input, options);
}


var Deflate_1$1 = Deflate$1;
var deflate_2 = deflate$1;
var deflateRaw_1$1 = deflateRaw$1;
var gzip_1$1 = gzip$1;

var deflate_1$1 = {
	Deflate: Deflate_1$1,
	deflate: deflate_2,
	deflateRaw: deflateRaw_1$1,
	gzip: gzip_1$1};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
const BAD$1 = 16209;       /* got a data error -- remain here until reset */
const TYPE$1 = 16191;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
var inffast = function inflate_fast(strm, start) {
  let _in;                    /* local strm.input */
  let last;                   /* have enough input while in < last */
  let _out;                   /* local strm.output */
  let beg;                    /* inflate()'s initial strm.output */
  let end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  let dmax;                   /* maximum distance from zlib header */
//#endif
  let wsize;                  /* window size or zero if not using window */
  let whave;                  /* valid bytes in the window */
  let wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  let s_window;               /* allocated sliding window, if wsize != 0 */
  let hold;                   /* local strm.hold */
  let bits;                   /* local strm.bits */
  let lcode;                  /* local strm.lencode */
  let dcode;                  /* local strm.distcode */
  let lmask;                  /* mask for first level of length codes */
  let dmask;                  /* mask for first level of distance codes */
  let here;                   /* retrieved table entry */
  let op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  let len;                    /* match length, unused bytes */
  let dist;                   /* match distance */
  let from;                   /* where to copy match from */
  let from_source;


  let input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  const state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD$1;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD$1;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD$1;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE$1;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD$1;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

const MAXBITS = 15;
const ENOUGH_LENS$1 = 852;
const ENOUGH_DISTS$1 = 592;
//const ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

const CODES$1 = 0;
const LENS$1 = 1;
const DISTS$1 = 2;

const lbase = new Uint16Array([ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
]);

const lext = new Uint8Array([ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
]);

const dbase = new Uint16Array([ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
]);

const dext = new Uint8Array([ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
]);

const inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) =>
{
  const bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  let len = 0;               /* a code's length in bits */
  let sym = 0;               /* index of code symbols */
  let min = 0, max = 0;          /* minimum and maximum code lengths */
  let root = 0;              /* number of index bits for root table */
  let curr = 0;              /* number of index bits for current table */
  let drop = 0;              /* code bits to drop for sub-table */
  let left = 0;                   /* number of prefix codes available */
  let used = 0;              /* code entries in table used */
  let huff = 0;              /* Huffman code */
  let incr;              /* for incrementing code, index */
  let fill;              /* index for replicating entries */
  let low;               /* low bits for current root entry */
  let mask;              /* mask for low root bits */
  let next;             /* next available space in table */
  let base = null;     /* base value table to use */
//  let shoextra;    /* extra bits table to use */
  let match;                  /* use base and extra for symbol >= match */
  const count = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  const offs = new Uint16Array(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  let extra = null;

  let here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES$1 || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES$1) {
    base = extra = work;    /* dummy value--not used */
    match = 20;

  } else if (type === LENS$1) {
    base = lbase;
    extra = lext;
    match = 257;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    match = 0;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
    (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] + 1 < match) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] >= match) {
      here_op = extra[work[sym] - match];
      here_val = base[work[sym] - match];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS$1 && used > ENOUGH_LENS$1) ||
        (type === DISTS$1 && used > ENOUGH_DISTS$1)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};


var inftrees = inflate_table;

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.






const CODES = 0;
const LENS = 1;
const DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_FINISH: Z_FINISH$1, Z_BLOCK, Z_TREES,
  Z_OK: Z_OK$1, Z_STREAM_END: Z_STREAM_END$1, Z_NEED_DICT: Z_NEED_DICT$1, Z_STREAM_ERROR: Z_STREAM_ERROR$1, Z_DATA_ERROR: Z_DATA_ERROR$1, Z_MEM_ERROR: Z_MEM_ERROR$1, Z_BUF_ERROR,
  Z_DEFLATED
} = constants$2;


/* STATES ====================================================================*/
/* ===========================================================================*/


const    HEAD = 16180;       /* i: waiting for magic header */
const    FLAGS = 16181;      /* i: waiting for method and flags (gzip) */
const    TIME = 16182;       /* i: waiting for modification time (gzip) */
const    OS = 16183;         /* i: waiting for extra flags and operating system (gzip) */
const    EXLEN = 16184;      /* i: waiting for extra length (gzip) */
const    EXTRA = 16185;      /* i: waiting for extra bytes (gzip) */
const    NAME = 16186;       /* i: waiting for end of file name (gzip) */
const    COMMENT = 16187;    /* i: waiting for end of comment (gzip) */
const    HCRC = 16188;       /* i: waiting for header crc (gzip) */
const    DICTID = 16189;    /* i: waiting for dictionary check value */
const    DICT = 16190;      /* waiting for inflateSetDictionary() call */
const        TYPE = 16191;      /* i: waiting for type bits, including last-flag bit */
const        TYPEDO = 16192;    /* i: same, but skip check to exit inflate on new block */
const        STORED = 16193;    /* i: waiting for stored size (length and complement) */
const        COPY_ = 16194;     /* i/o: same as COPY below, but only first time in */
const        COPY = 16195;      /* i/o: waiting for input or output to copy stored block */
const        TABLE = 16196;     /* i: waiting for dynamic block table lengths */
const        LENLENS = 16197;   /* i: waiting for code length code lengths */
const        CODELENS = 16198;  /* i: waiting for length/lit and distance code lengths */
const            LEN_ = 16199;      /* i: same as LEN below, but only first time in */
const            LEN = 16200;       /* i: waiting for length/lit/eob code */
const            LENEXT = 16201;    /* i: waiting for length extra bits */
const            DIST = 16202;      /* i: waiting for distance code */
const            DISTEXT = 16203;   /* i: waiting for distance extra bits */
const            MATCH = 16204;     /* o: waiting for output space to copy string */
const            LIT = 16205;       /* o: waiting for output space to write literal */
const    CHECK = 16206;     /* i: waiting for 32-bit check value */
const    LENGTH = 16207;    /* i: waiting for 32-bit length (gzip) */
const    DONE = 16208;      /* finished check, done -- remain here until reset */
const    BAD = 16209;       /* got a data error -- remain here until reset */
const    MEM = 16210;       /* got an inflate() memory error -- remain here until reset */
const    SYNC = 16211;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



const ENOUGH_LENS = 852;
const ENOUGH_DISTS = 592;
//const ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

const MAX_WBITS = 15;
/* 32K LZ77 window */
const DEF_WBITS = MAX_WBITS;


const zswap32 = (q) => {

  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
};


function InflateState() {
  this.strm = null;           /* pointer back to this zlib stream */
  this.mode = 0;              /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip,
                                 bit 2 true to validate check value */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib), or
                                 -1 if raw or no header yet */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new Uint16Array(320); /* temporary storage for code lengths */
  this.work = new Uint16Array(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new Int32Array(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}


const inflateStateCheck = (strm) => {

  if (!strm) {
    return 1;
  }
  const state = strm.state;
  if (!state || state.strm !== strm ||
    state.mode < HEAD || state.mode > SYNC) {
    return 1;
  }
  return 0;
};


const inflateResetKeep = (strm) => {

  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.flags = -1;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
  state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK$1;
};


const inflateReset = (strm) => {

  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

};


const inflateReset2 = (strm, windowBits) => {
  let wrap;

  /* get the state */
  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 5;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR$1;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
};


const inflateInit2 = (strm, windowBits) => {

  if (!strm) { return Z_STREAM_ERROR$1; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  const state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.strm = strm;
  state.window = null/*Z_NULL*/;
  state.mode = HEAD;     /* to pass state test in inflateReset2() */
  const ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK$1) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
};


const inflateInit = (strm) => {

  return inflateInit2(strm, DEF_WBITS);
};


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
let virgin = true;

let lenfix, distfix; // We have no pointers in JS, so keep tables separate


const fixedtables = (state) => {

  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    lenfix = new Int32Array(512);
    distfix = new Int32Array(32);

    /* literal/length table */
    let sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inftrees(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inftrees(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
};


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
const updatewindow = (strm, src, end, copy) => {

  let dist;
  const state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new Uint8Array(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    state.window.set(src.subarray(end - state.wsize, end), 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      state.window.set(src.subarray(end - copy, end), 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
};


const inflate$2 = (strm, flush) => {

  let state;
  let input, output;          // input/output buffers
  let next;                   /* next input INDEX */
  let put;                    /* next output INDEX */
  let have, left;             /* available input and output */
  let hold;                   /* bit buffer */
  let bits;                   /* bits in bit buffer */
  let _in, _out;              /* save starting available input and output */
  let copy;                   /* number of stored or match bytes to copy */
  let from;                   /* where to copy match bytes from */
  let from_source;
  let here = 0;               /* current decoding table entry */
  let here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //let last;                   /* parent table entry */
  let last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  let len;                    /* length to copy for repeats, bits to drop */
  let ret;                    /* return code */
  const hbuf = new Uint8Array(4);    /* buffer for gzip header crc calculation */
  let opts;

  let n; // temporary variable for NEED_BITS

  const order = /* permutation of code lengths */
    new Uint8Array([ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ]);


  if (inflateStateCheck(strm) || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR$1;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK$1;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          if (state.wbits === 0) {
            state.wbits = 15;
          }
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        if (len > 15 || len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD;
          break;
        }

        // !!! pako patch. Force use `options.windowBits` if passed.
        // Required to always use max window size by default.
        state.dmax = 1 << state.wbits;
        //state.dmax = 1 << len;

        state.flags = 0;               /* indicate zlib header */
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if ((state.flags & 0x0200) && (state.wrap & 4)) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if ((state.flags & 0x0200) && (state.wrap & 4)) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32_1(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if ((state.flags & 0x0200) && (state.wrap & 4)) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32_1(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if ((state.flags & 0x0200) && (state.wrap & 4)) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32_1(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Uint8Array(state.head.extra_len);
              }
              state.head.extra.set(
                input.subarray(
                  next,
                  // extra field is limited to 65536 bytes
                  // - no need for additional size check
                  next + copy
                ),
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if ((state.flags & 0x0200) && (state.wrap & 4)) {
              state.check = crc32_1(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if ((state.flags & 0x0200) && (state.wrap & 4)) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if ((state.flags & 0x0200) && (state.wrap & 4)) {
            state.check = crc32_1(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if ((state.wrap & 4) && hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT$1;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE;
        /* falls through */
      case TYPE:
        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          output.set(input.subarray(next, next + copy), put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inffast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if ((state.wrap & 4) && _out) {
            strm.adler = state.check =
                /*UPDATE_CHECK(state.check, put - _out, _out);*/
                (state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.wrap & 4) && (state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if ((state.wrap & 4) && hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END$1;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR$1;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR$1;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR$1;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH$1))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) ;
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if ((state.wrap & 4) && _out) {
    strm.adler = state.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH$1) && ret === Z_OK$1) {
    ret = Z_BUF_ERROR;
  }
  return ret;
};


const inflateEnd = (strm) => {

  if (inflateStateCheck(strm)) {
    return Z_STREAM_ERROR$1;
  }

  let state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK$1;
};


const inflateGetHeader = (strm, head) => {

  /* check state */
  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  const state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR$1; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK$1;
};


const inflateSetDictionary = (strm, dictionary) => {
  const dictLength = dictionary.length;

  let state;
  let dictid;
  let ret;

  /* check state */
  if (inflateStateCheck(strm)) { return Z_STREAM_ERROR$1; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR$1;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32_1(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR$1;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR$1;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK$1;
};


var inflateReset_1 = inflateReset;
var inflateReset2_1 = inflateReset2;
var inflateResetKeep_1 = inflateResetKeep;
var inflateInit_1 = inflateInit;
var inflateInit2_1 = inflateInit2;
var inflate_2$1 = inflate$2;
var inflateEnd_1 = inflateEnd;
var inflateGetHeader_1 = inflateGetHeader;
var inflateSetDictionary_1 = inflateSetDictionary;
var inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
module.exports.inflateCodesUsed = inflateCodesUsed;
module.exports.inflateCopy = inflateCopy;
module.exports.inflateGetDictionary = inflateGetDictionary;
module.exports.inflateMark = inflateMark;
module.exports.inflatePrime = inflatePrime;
module.exports.inflateSync = inflateSync;
module.exports.inflateSyncPoint = inflateSyncPoint;
module.exports.inflateUndermine = inflateUndermine;
module.exports.inflateValidate = inflateValidate;
*/

var inflate_1$2 = {
	inflateReset: inflateReset_1,
	inflateReset2: inflateReset2_1,
	inflateResetKeep: inflateResetKeep_1,
	inflateInit: inflateInit_1,
	inflateInit2: inflateInit2_1,
	inflate: inflate_2$1,
	inflateEnd: inflateEnd_1,
	inflateGetHeader: inflateGetHeader_1,
	inflateSetDictionary: inflateSetDictionary_1,
	inflateInfo: inflateInfo
};

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function GZheader() {
  /* true if compressed data believed to be text */
  this.text       = 0;
  /* modification time */
  this.time       = 0;
  /* extra flags (not used when writing a gzip file) */
  this.xflags     = 0;
  /* operating system */
  this.os         = 0;
  /* pointer to extra field or Z_NULL if none */
  this.extra      = null;
  /* extra field length (valid if extra != Z_NULL) */
  this.extra_len  = 0; // Actually, we don't need it in JS,
                       // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // this.extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  this.name       = '';
  /* space at name (only when reading header) */
  // this.name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  this.comment    = '';
  /* space at comment (only when reading header) */
  // this.comm_max   = 0;
  /* true if there was or will be a header crc */
  this.hcrc       = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  this.done       = false;
}

var gzheader = GZheader;

const toString = Object.prototype.toString;

/* Public constants ==========================================================*/
/* ===========================================================================*/

const {
  Z_NO_FLUSH, Z_FINISH,
  Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_STREAM_ERROR, Z_DATA_ERROR, Z_MEM_ERROR
} = constants$2;

/* ===========================================================================*/


/**
 * class Inflate
 *
 * Generic JS-style wrapper for zlib calls. If you don't need
 * streaming behaviour - use more simple functions: [[inflate]]
 * and [[inflateRaw]].
 **/

/* internal
 * inflate.chunks -> Array
 *
 * Chunks of output data, if [[Inflate#onData]] not overridden.
 **/

/**
 * Inflate.result -> Uint8Array|String
 *
 * Uncompressed result, generated by default [[Inflate#onData]]
 * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
 * (call [[Inflate#push]] with `Z_FINISH` / `true` param).
 **/

/**
 * Inflate.err -> Number
 *
 * Error code after inflate finished. 0 (Z_OK) on success.
 * Should be checked if broken data possible.
 **/

/**
 * Inflate.msg -> String
 *
 * Error message, if [[Inflate.err]] != 0
 **/


/**
 * new Inflate(options)
 * - options (Object): zlib inflate options.
 *
 * Creates new inflator instance with specified params. Throws exception
 * on bad params. Supported options:
 *
 * - `windowBits`
 * - `dictionary`
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information on these.
 *
 * Additional options, for internal needs:
 *
 * - `chunkSize` - size of generated data chunks (16K by default)
 * - `raw` (Boolean) - do raw inflate
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 * By default, when no options set, autodetect deflate/gzip data format via
 * wrapper header.
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako')
 * const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
 * const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
 *
 * const inflate = new pako.Inflate({ level: 3});
 *
 * inflate.push(chunk1, false);
 * inflate.push(chunk2, true);  // true -> last chunk
 *
 * if (inflate.err) { throw new Error(inflate.err); }
 *
 * console.log(inflate.result);
 * ```
 **/
function Inflate$1(options) {
  this.options = common.assign({
    chunkSize: 1024 * 64,
    windowBits: 15,
    to: ''
  }, options || {});

  const opt = this.options;

  // Force window size for `raw` data, if not set directly,
  // because we have no header for autodetect.
  if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
    opt.windowBits = -opt.windowBits;
    if (opt.windowBits === 0) { opt.windowBits = -15; }
  }

  // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
  if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)) {
    opt.windowBits += 32;
  }

  // Gzip header has no info about windows size, we can do autodetect only
  // for deflate. So, if window size not set, force it to max when gzip possible
  if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
    // bit 3 (16) -> gzipped data
    // bit 4 (32) -> autodetect gzip/deflate
    if ((opt.windowBits & 15) === 0) {
      opt.windowBits |= 15;
    }
  }

  this.err    = 0;      // error code, if happens (0 = Z_OK)
  this.msg    = '';     // error message
  this.ended  = false;  // used to avoid multiple onEnd() calls
  this.chunks = [];     // chunks of compressed data

  this.strm   = new zstream();
  this.strm.avail_out = 0;

  let status  = inflate_1$2.inflateInit2(
    this.strm,
    opt.windowBits
  );

  if (status !== Z_OK) {
    throw new Error(messages[status]);
  }

  this.header = new gzheader();

  inflate_1$2.inflateGetHeader(this.strm, this.header);

  // Setup dictionary
  if (opt.dictionary) {
    // Convert data if needed
    if (typeof opt.dictionary === 'string') {
      opt.dictionary = strings.string2buf(opt.dictionary);
    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
      opt.dictionary = new Uint8Array(opt.dictionary);
    }
    if (opt.raw) { //In raw mode we need to set the dictionary early
      status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
      if (status !== Z_OK) {
        throw new Error(messages[status]);
      }
    }
  }
}

/**
 * Inflate#push(data[, flush_mode]) -> Boolean
 * - data (Uint8Array|ArrayBuffer): input data
 * - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
 *   flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
 *   `true` means Z_FINISH.
 *
 * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
 * new output chunks. Returns `true` on success. If end of stream detected,
 * [[Inflate#onEnd]] will be called.
 *
 * `flush_mode` is not needed for normal operation, because end of stream
 * detected automatically. You may try to use it for advanced things, but
 * this functionality was not tested.
 *
 * On fail call [[Inflate#onEnd]] with error code and return false.
 *
 * ##### Example
 *
 * ```javascript
 * push(chunk, false); // push one of data chunks
 * ...
 * push(chunk, true);  // push last chunk
 * ```
 **/
Inflate$1.prototype.push = function (data, flush_mode) {
  const strm = this.strm;
  const chunkSize = this.options.chunkSize;
  const dictionary = this.options.dictionary;
  let status, _flush_mode, last_avail_out;

  if (this.ended) return false;

  if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
  else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;

  // Convert data if needed
  if (toString.call(data) === '[object ArrayBuffer]') {
    strm.input = new Uint8Array(data);
  } else {
    strm.input = data;
  }

  strm.next_in = 0;
  strm.avail_in = strm.input.length;

  for (;;) {
    if (strm.avail_out === 0) {
      strm.output = new Uint8Array(chunkSize);
      strm.next_out = 0;
      strm.avail_out = chunkSize;
    }

    status = inflate_1$2.inflate(strm, _flush_mode);

    if (status === Z_NEED_DICT && dictionary) {
      status = inflate_1$2.inflateSetDictionary(strm, dictionary);

      if (status === Z_OK) {
        status = inflate_1$2.inflate(strm, _flush_mode);
      } else if (status === Z_DATA_ERROR) {
        // Replace code with more verbose
        status = Z_NEED_DICT;
      }
    }

    // Skip snyc markers if more data follows and not raw mode
    while (strm.avail_in > 0 &&
           status === Z_STREAM_END &&
           strm.state.wrap > 0 &&
           data[strm.next_in] !== 0)
    {
      inflate_1$2.inflateReset(strm);
      status = inflate_1$2.inflate(strm, _flush_mode);
    }

    switch (status) {
      case Z_STREAM_ERROR:
      case Z_DATA_ERROR:
      case Z_NEED_DICT:
      case Z_MEM_ERROR:
        this.onEnd(status);
        this.ended = true;
        return false;
    }

    // Remember real `avail_out` value, because we may patch out buffer content
    // to align utf8 strings boundaries.
    last_avail_out = strm.avail_out;

    if (strm.next_out) {
      if (strm.avail_out === 0 || status === Z_STREAM_END) {

        if (this.options.to === 'string') {

          let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

          let tail = strm.next_out - next_out_utf8;
          let utf8str = strings.buf2string(strm.output, next_out_utf8);

          // move tail & realign counters
          strm.next_out = tail;
          strm.avail_out = chunkSize - tail;
          if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);

          this.onData(utf8str);

        } else {
          this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
        }
      }
    }

    // Must repeat iteration if out buffer is full
    if (status === Z_OK && last_avail_out === 0) continue;

    // Finalize if end of stream reached.
    if (status === Z_STREAM_END) {
      status = inflate_1$2.inflateEnd(this.strm);
      this.onEnd(status);
      this.ended = true;
      return true;
    }

    if (strm.avail_in === 0) break;
  }

  return true;
};


/**
 * Inflate#onData(chunk) -> Void
 * - chunk (Uint8Array|String): output data. When string output requested,
 *   each chunk will be string.
 *
 * By default, stores data blocks in `chunks[]` property and glue
 * those in `onEnd`. Override this handler, if you need another behaviour.
 **/
Inflate$1.prototype.onData = function (chunk) {
  this.chunks.push(chunk);
};


/**
 * Inflate#onEnd(status) -> Void
 * - status (Number): inflate status. 0 (Z_OK) on success,
 *   other if not.
 *
 * Called either after you tell inflate that the input stream is
 * complete (Z_FINISH). By default - join collected chunks,
 * free memory and fill `results` / `err` properties.
 **/
Inflate$1.prototype.onEnd = function (status) {
  // On success - join
  if (status === Z_OK) {
    if (this.options.to === 'string') {
      this.result = this.chunks.join('');
    } else {
      this.result = common.flattenChunks(this.chunks);
    }
  }
  this.chunks = [];
  this.err = status;
  this.msg = this.strm.msg;
};


/**
 * inflate(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Decompress `data` with inflate/ungzip and `options`. Autodetect
 * format via wrapper header by default. That's why we don't provide
 * separate `ungzip` method.
 *
 * Supported options are:
 *
 * - windowBits
 *
 * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
 * for more information.
 *
 * Sugar (options):
 *
 * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
 *   negative windowBits implicitly.
 * - `to` (String) - if equal to 'string', then result will be converted
 *   from utf8 to utf16 (javascript) string. When string output requested,
 *   chunk length can differ from `chunkSize`, depending on content.
 *
 *
 * ##### Example:
 *
 * ```javascript
 * const pako = require('pako');
 * const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
 * let output;
 *
 * try {
 *   output = pako.inflate(input);
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 **/
function inflate$1(input, options) {
  const inflator = new Inflate$1(options);

  inflator.push(input);

  // That will never happens, if you don't cheat with options :)
  if (inflator.err) throw inflator.msg || messages[inflator.err];

  return inflator.result;
}


/**
 * inflateRaw(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * The same as [[inflate]], but creates raw data, without wrapper
 * (header and adler32 crc).
 **/
function inflateRaw$1(input, options) {
  options = options || {};
  options.raw = true;
  return inflate$1(input, options);
}


/**
 * ungzip(data[, options]) -> Uint8Array|String
 * - data (Uint8Array|ArrayBuffer): input data to decompress.
 * - options (Object): zlib inflate options.
 *
 * Just shortcut to [[inflate]], because it autodetects format
 * by header.content. Done for convenience.
 **/


var Inflate_1$1 = Inflate$1;
var inflate_2 = inflate$1;
var inflateRaw_1$1 = inflateRaw$1;
var ungzip$1 = inflate$1;

var inflate_1$1 = {
	Inflate: Inflate_1$1,
	inflate: inflate_2,
	inflateRaw: inflateRaw_1$1,
	ungzip: ungzip$1};

const { Deflate, deflate, deflateRaw, gzip } = deflate_1$1;

const { Inflate, inflate, inflateRaw, ungzip } = inflate_1$1;



var Deflate_1 = Deflate;
var deflate_1 = deflate;
var deflateRaw_1 = deflateRaw;
var gzip_1 = gzip;
var Inflate_1 = Inflate;
var inflate_1 = inflate;
var inflateRaw_1 = inflateRaw;
var ungzip_1 = ungzip;
var constants_1 = constants$2;

var pako = {
	Deflate: Deflate_1,
	deflate: deflate_1,
	deflateRaw: deflateRaw_1,
	gzip: gzip_1,
	Inflate: Inflate_1,
	inflate: inflate_1,
	inflateRaw: inflateRaw_1,
	ungzip: ungzip_1,
	constants: constants_1
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var localforage$1 = {exports: {}};

/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/

var hasRequiredLocalforage;

function requireLocalforage () {
	if (hasRequiredLocalforage) return localforage$1.exports;
	hasRequiredLocalforage = 1;
	(function (module, exports) {
		(function(f){{module.exports=f();}})(function(){return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof commonjsRequire=="function"&&commonjsRequire;if(!u&&a)return a(o,true);if(i)return i(o,true);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r);}return n[o].exports}var i=typeof commonjsRequire=="function"&&commonjsRequire;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
		(function (global){
		var Mutation = global.MutationObserver || global.WebKitMutationObserver;

		var scheduleDrain;

		{
		  if (Mutation) {
		    var called = 0;
		    var observer = new Mutation(nextTick);
		    var element = global.document.createTextNode('');
		    observer.observe(element, {
		      characterData: true
		    });
		    scheduleDrain = function () {
		      element.data = (called = ++called % 2);
		    };
		  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
		    var channel = new global.MessageChannel();
		    channel.port1.onmessage = nextTick;
		    scheduleDrain = function () {
		      channel.port2.postMessage(0);
		    };
		  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
		    scheduleDrain = function () {

		      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
		      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
		      var scriptEl = global.document.createElement('script');
		      scriptEl.onreadystatechange = function () {
		        nextTick();

		        scriptEl.onreadystatechange = null;
		        scriptEl.parentNode.removeChild(scriptEl);
		        scriptEl = null;
		      };
		      global.document.documentElement.appendChild(scriptEl);
		    };
		  } else {
		    scheduleDrain = function () {
		      setTimeout(nextTick, 0);
		    };
		  }
		}

		var draining;
		var queue = [];
		//named nextTick for less confusing stack traces
		function nextTick() {
		  draining = true;
		  var i, oldQueue;
		  var len = queue.length;
		  while (len) {
		    oldQueue = queue;
		    queue = [];
		    i = -1;
		    while (++i < len) {
		      oldQueue[i]();
		    }
		    len = queue.length;
		  }
		  draining = false;
		}

		module.exports = immediate;
		function immediate(task) {
		  if (queue.push(task) === 1 && !draining) {
		    scheduleDrain();
		  }
		}

		}).call(this,typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		},{}],2:[function(_dereq_,module,exports){
		var immediate = _dereq_(1);

		/* istanbul ignore next */
		function INTERNAL() {}

		var handlers = {};

		var REJECTED = ['REJECTED'];
		var FULFILLED = ['FULFILLED'];
		var PENDING = ['PENDING'];

		module.exports = Promise;

		function Promise(resolver) {
		  if (typeof resolver !== 'function') {
		    throw new TypeError('resolver must be a function');
		  }
		  this.state = PENDING;
		  this.queue = [];
		  this.outcome = void 0;
		  if (resolver !== INTERNAL) {
		    safelyResolveThenable(this, resolver);
		  }
		}

		Promise.prototype["catch"] = function (onRejected) {
		  return this.then(null, onRejected);
		};
		Promise.prototype.then = function (onFulfilled, onRejected) {
		  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
		    typeof onRejected !== 'function' && this.state === REJECTED) {
		    return this;
		  }
		  var promise = new this.constructor(INTERNAL);
		  if (this.state !== PENDING) {
		    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
		    unwrap(promise, resolver, this.outcome);
		  } else {
		    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
		  }

		  return promise;
		};
		function QueueItem(promise, onFulfilled, onRejected) {
		  this.promise = promise;
		  if (typeof onFulfilled === 'function') {
		    this.onFulfilled = onFulfilled;
		    this.callFulfilled = this.otherCallFulfilled;
		  }
		  if (typeof onRejected === 'function') {
		    this.onRejected = onRejected;
		    this.callRejected = this.otherCallRejected;
		  }
		}
		QueueItem.prototype.callFulfilled = function (value) {
		  handlers.resolve(this.promise, value);
		};
		QueueItem.prototype.otherCallFulfilled = function (value) {
		  unwrap(this.promise, this.onFulfilled, value);
		};
		QueueItem.prototype.callRejected = function (value) {
		  handlers.reject(this.promise, value);
		};
		QueueItem.prototype.otherCallRejected = function (value) {
		  unwrap(this.promise, this.onRejected, value);
		};

		function unwrap(promise, func, value) {
		  immediate(function () {
		    var returnValue;
		    try {
		      returnValue = func(value);
		    } catch (e) {
		      return handlers.reject(promise, e);
		    }
		    if (returnValue === promise) {
		      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
		    } else {
		      handlers.resolve(promise, returnValue);
		    }
		  });
		}

		handlers.resolve = function (self, value) {
		  var result = tryCatch(getThen, value);
		  if (result.status === 'error') {
		    return handlers.reject(self, result.value);
		  }
		  var thenable = result.value;

		  if (thenable) {
		    safelyResolveThenable(self, thenable);
		  } else {
		    self.state = FULFILLED;
		    self.outcome = value;
		    var i = -1;
		    var len = self.queue.length;
		    while (++i < len) {
		      self.queue[i].callFulfilled(value);
		    }
		  }
		  return self;
		};
		handlers.reject = function (self, error) {
		  self.state = REJECTED;
		  self.outcome = error;
		  var i = -1;
		  var len = self.queue.length;
		  while (++i < len) {
		    self.queue[i].callRejected(error);
		  }
		  return self;
		};

		function getThen(obj) {
		  // Make sure we only access the accessor once as required by the spec
		  var then = obj && obj.then;
		  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
		    return function appyThen() {
		      then.apply(obj, arguments);
		    };
		  }
		}

		function safelyResolveThenable(self, thenable) {
		  // Either fulfill, reject or reject with error
		  var called = false;
		  function onError(value) {
		    if (called) {
		      return;
		    }
		    called = true;
		    handlers.reject(self, value);
		  }

		  function onSuccess(value) {
		    if (called) {
		      return;
		    }
		    called = true;
		    handlers.resolve(self, value);
		  }

		  function tryToUnwrap() {
		    thenable(onSuccess, onError);
		  }

		  var result = tryCatch(tryToUnwrap);
		  if (result.status === 'error') {
		    onError(result.value);
		  }
		}

		function tryCatch(func, value) {
		  var out = {};
		  try {
		    out.value = func(value);
		    out.status = 'success';
		  } catch (e) {
		    out.status = 'error';
		    out.value = e;
		  }
		  return out;
		}

		Promise.resolve = resolve;
		function resolve(value) {
		  if (value instanceof this) {
		    return value;
		  }
		  return handlers.resolve(new this(INTERNAL), value);
		}

		Promise.reject = reject;
		function reject(reason) {
		  var promise = new this(INTERNAL);
		  return handlers.reject(promise, reason);
		}

		Promise.all = all;
		function all(iterable) {
		  var self = this;
		  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
		    return this.reject(new TypeError('must be an array'));
		  }

		  var len = iterable.length;
		  var called = false;
		  if (!len) {
		    return this.resolve([]);
		  }

		  var values = new Array(len);
		  var resolved = 0;
		  var i = -1;
		  var promise = new this(INTERNAL);

		  while (++i < len) {
		    allResolver(iterable[i], i);
		  }
		  return promise;
		  function allResolver(value, i) {
		    self.resolve(value).then(resolveFromAll, function (error) {
		      if (!called) {
		        called = true;
		        handlers.reject(promise, error);
		      }
		    });
		    function resolveFromAll(outValue) {
		      values[i] = outValue;
		      if (++resolved === len && !called) {
		        called = true;
		        handlers.resolve(promise, values);
		      }
		    }
		  }
		}

		Promise.race = race;
		function race(iterable) {
		  var self = this;
		  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
		    return this.reject(new TypeError('must be an array'));
		  }

		  var len = iterable.length;
		  var called = false;
		  if (!len) {
		    return this.resolve([]);
		  }

		  var i = -1;
		  var promise = new this(INTERNAL);

		  while (++i < len) {
		    resolver(iterable[i]);
		  }
		  return promise;
		  function resolver(value) {
		    self.resolve(value).then(function (response) {
		      if (!called) {
		        called = true;
		        handlers.resolve(promise, response);
		      }
		    }, function (error) {
		      if (!called) {
		        called = true;
		        handlers.reject(promise, error);
		      }
		    });
		  }
		}

		},{"1":1}],3:[function(_dereq_,module,exports){
		(function (global){
		if (typeof global.Promise !== 'function') {
		  global.Promise = _dereq_(2);
		}

		}).call(this,typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		},{"2":2}],4:[function(_dereq_,module,exports){

		var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

		function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

		function getIDB() {
		    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
		    try {
		        if (typeof indexedDB !== 'undefined') {
		            return indexedDB;
		        }
		        if (typeof webkitIndexedDB !== 'undefined') {
		            return webkitIndexedDB;
		        }
		        if (typeof mozIndexedDB !== 'undefined') {
		            return mozIndexedDB;
		        }
		        if (typeof OIndexedDB !== 'undefined') {
		            return OIndexedDB;
		        }
		        if (typeof msIndexedDB !== 'undefined') {
		            return msIndexedDB;
		        }
		    } catch (e) {
		        return;
		    }
		}

		var idb = getIDB();

		function isIndexedDBValid() {
		    try {
		        // Initialize IndexedDB; fall back to vendor-prefixed versions
		        // if needed.
		        if (!idb || !idb.open) {
		            return false;
		        }
		        // We mimic PouchDB here;
		        //
		        // We test for openDatabase because IE Mobile identifies itself
		        // as Safari. Oh the lulz...
		        var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);

		        var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1;

		        // Safari <10.1 does not meet our requirements for IDB support
		        // (see: https://github.com/pouchdb/pouchdb/issues/5572).
		        // Safari 10.1 shipped with fetch, we can use that to detect it.
		        // Note: this creates issues with `window.fetch` polyfills and
		        // overrides; see:
		        // https://github.com/localForage/localForage/issues/856
		        return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' &&
		        // some outdated implementations of IDB that appear on Samsung
		        // and HTC Android devices <4.4 are missing IDBKeyRange
		        // See: https://github.com/mozilla/localForage/issues/128
		        // See: https://github.com/mozilla/localForage/issues/272
		        typeof IDBKeyRange !== 'undefined';
		    } catch (e) {
		        return false;
		    }
		}

		// Abstracts constructing a Blob object, so it also works in older
		// browsers that don't support the native Blob constructor. (i.e.
		// old QtWebKit versions, at least).
		// Abstracts constructing a Blob object, so it also works in older
		// browsers that don't support the native Blob constructor. (i.e.
		// old QtWebKit versions, at least).
		function createBlob(parts, properties) {
		    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
		    parts = parts || [];
		    properties = properties || {};
		    try {
		        return new Blob(parts, properties);
		    } catch (e) {
		        if (e.name !== 'TypeError') {
		            throw e;
		        }
		        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
		        var builder = new Builder();
		        for (var i = 0; i < parts.length; i += 1) {
		            builder.append(parts[i]);
		        }
		        return builder.getBlob(properties.type);
		    }
		}

		// This is CommonJS because lie is an external dependency, so Rollup
		// can just ignore it.
		if (typeof Promise === 'undefined') {
		    // In the "nopromises" build this will just throw if you don't have
		    // a global promise object, but it would throw anyway later.
		    _dereq_(3);
		}
		var Promise$1 = Promise;

		function executeCallback(promise, callback) {
		    if (callback) {
		        promise.then(function (result) {
		            callback(null, result);
		        }, function (error) {
		            callback(error);
		        });
		    }
		}

		function executeTwoCallbacks(promise, callback, errorCallback) {
		    if (typeof callback === 'function') {
		        promise.then(callback);
		    }

		    if (typeof errorCallback === 'function') {
		        promise["catch"](errorCallback);
		    }
		}

		function normalizeKey(key) {
		    // Cast the key to a string, as that's all we can set as a key.
		    if (typeof key !== 'string') {
		        console.warn(key + ' used as a key, but it is not a string.');
		        key = String(key);
		    }

		    return key;
		}

		function getCallback() {
		    if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
		        return arguments[arguments.length - 1];
		    }
		}

		// Some code originally from async_storage.js in
		// [Gaia](https://github.com/mozilla-b2g/gaia).

		var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
		var supportsBlobs = void 0;
		var dbContexts = {};
		var toString = Object.prototype.toString;

		// Transaction Modes
		var READ_ONLY = 'readonly';
		var READ_WRITE = 'readwrite';

		// Transform a binary string to an array buffer, because otherwise
		// weird stuff happens when you try to work with the binary string directly.
		// It is known.
		// From http://stackoverflow.com/questions/14967647/ (continues on next line)
		// encode-decode-image-with-base64-breaks-image (2013-04-21)
		function _binStringToArrayBuffer(bin) {
		    var length = bin.length;
		    var buf = new ArrayBuffer(length);
		    var arr = new Uint8Array(buf);
		    for (var i = 0; i < length; i++) {
		        arr[i] = bin.charCodeAt(i);
		    }
		    return buf;
		}

		//
		// Blobs are not supported in all versions of IndexedDB, notably
		// Chrome <37 and Android <5. In those versions, storing a blob will throw.
		//
		// Various other blob bugs exist in Chrome v37-42 (inclusive).
		// Detecting them is expensive and confusing to users, and Chrome 37-42
		// is at very low usage worldwide, so we do a hacky userAgent check instead.
		//
		// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
		// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
		// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
		//
		// Code borrowed from PouchDB. See:
		// https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
		//
		function _checkBlobSupportWithoutCaching(idb) {
		    return new Promise$1(function (resolve) {
		        var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
		        var blob = createBlob(['']);
		        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

		        txn.onabort = function (e) {
		            // If the transaction aborts now its due to not being able to
		            // write to the database, likely due to the disk being full
		            e.preventDefault();
		            e.stopPropagation();
		            resolve(false);
		        };

		        txn.oncomplete = function () {
		            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
		            var matchedEdge = navigator.userAgent.match(/Edge\//);
		            // MS Edge pretends to be Chrome 42:
		            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
		            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
		        };
		    })["catch"](function () {
		        return false; // error, so assume unsupported
		    });
		}

		function _checkBlobSupport(idb) {
		    if (typeof supportsBlobs === 'boolean') {
		        return Promise$1.resolve(supportsBlobs);
		    }
		    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
		        supportsBlobs = value;
		        return supportsBlobs;
		    });
		}

		function _deferReadiness(dbInfo) {
		    var dbContext = dbContexts[dbInfo.name];

		    // Create a deferred object representing the current database operation.
		    var deferredOperation = {};

		    deferredOperation.promise = new Promise$1(function (resolve, reject) {
		        deferredOperation.resolve = resolve;
		        deferredOperation.reject = reject;
		    });

		    // Enqueue the deferred operation.
		    dbContext.deferredOperations.push(deferredOperation);

		    // Chain its promise to the database readiness.
		    if (!dbContext.dbReady) {
		        dbContext.dbReady = deferredOperation.promise;
		    } else {
		        dbContext.dbReady = dbContext.dbReady.then(function () {
		            return deferredOperation.promise;
		        });
		    }
		}

		function _advanceReadiness(dbInfo) {
		    var dbContext = dbContexts[dbInfo.name];

		    // Dequeue a deferred operation.
		    var deferredOperation = dbContext.deferredOperations.pop();

		    // Resolve its promise (which is part of the database readiness
		    // chain of promises).
		    if (deferredOperation) {
		        deferredOperation.resolve();
		        return deferredOperation.promise;
		    }
		}

		function _rejectReadiness(dbInfo, err) {
		    var dbContext = dbContexts[dbInfo.name];

		    // Dequeue a deferred operation.
		    var deferredOperation = dbContext.deferredOperations.pop();

		    // Reject its promise (which is part of the database readiness
		    // chain of promises).
		    if (deferredOperation) {
		        deferredOperation.reject(err);
		        return deferredOperation.promise;
		    }
		}

		function _getConnection(dbInfo, upgradeNeeded) {
		    return new Promise$1(function (resolve, reject) {
		        dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

		        if (dbInfo.db) {
		            if (upgradeNeeded) {
		                _deferReadiness(dbInfo);
		                dbInfo.db.close();
		            } else {
		                return resolve(dbInfo.db);
		            }
		        }

		        var dbArgs = [dbInfo.name];

		        if (upgradeNeeded) {
		            dbArgs.push(dbInfo.version);
		        }

		        var openreq = idb.open.apply(idb, dbArgs);

		        if (upgradeNeeded) {
		            openreq.onupgradeneeded = function (e) {
		                var db = openreq.result;
		                try {
		                    db.createObjectStore(dbInfo.storeName);
		                    if (e.oldVersion <= 1) {
		                        // Added when support for blob shims was added
		                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
		                    }
		                } catch (ex) {
		                    if (ex.name === 'ConstraintError') {
		                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
		                    } else {
		                        throw ex;
		                    }
		                }
		            };
		        }

		        openreq.onerror = function (e) {
		            e.preventDefault();
		            reject(openreq.error);
		        };

		        openreq.onsuccess = function () {
		            var db = openreq.result;
		            db.onversionchange = function (e) {
		                // Triggered when the database is modified (e.g. adding an objectStore) or
		                // deleted (even when initiated by other sessions in different tabs).
		                // Closing the connection here prevents those operations from being blocked.
		                // If the database is accessed again later by this instance, the connection
		                // will be reopened or the database recreated as needed.
		                e.target.close();
		            };
		            resolve(db);
		            _advanceReadiness(dbInfo);
		        };
		    });
		}

		function _getOriginalConnection(dbInfo) {
		    return _getConnection(dbInfo, false);
		}

		function _getUpgradedConnection(dbInfo) {
		    return _getConnection(dbInfo, true);
		}

		function _isUpgradeNeeded(dbInfo, defaultVersion) {
		    if (!dbInfo.db) {
		        return true;
		    }

		    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
		    var isDowngrade = dbInfo.version < dbInfo.db.version;
		    var isUpgrade = dbInfo.version > dbInfo.db.version;

		    if (isDowngrade) {
		        // If the version is not the default one
		        // then warn for impossible downgrade.
		        if (dbInfo.version !== defaultVersion) {
		            console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
		        }
		        // Align the versions to prevent errors.
		        dbInfo.version = dbInfo.db.version;
		    }

		    if (isUpgrade || isNewStore) {
		        // If the store is new then increment the version (if needed).
		        // This will trigger an "upgradeneeded" event which is required
		        // for creating a store.
		        if (isNewStore) {
		            var incVersion = dbInfo.db.version + 1;
		            if (incVersion > dbInfo.version) {
		                dbInfo.version = incVersion;
		            }
		        }

		        return true;
		    }

		    return false;
		}

		// encode a blob for indexeddb engines that don't support blobs
		function _encodeBlob(blob) {
		    return new Promise$1(function (resolve, reject) {
		        var reader = new FileReader();
		        reader.onerror = reject;
		        reader.onloadend = function (e) {
		            var base64 = btoa(e.target.result || '');
		            resolve({
		                __local_forage_encoded_blob: true,
		                data: base64,
		                type: blob.type
		            });
		        };
		        reader.readAsBinaryString(blob);
		    });
		}

		// decode an encoded blob
		function _decodeBlob(encodedBlob) {
		    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
		    return createBlob([arrayBuff], { type: encodedBlob.type });
		}

		// is this one of our fancy encoded blobs?
		function _isEncodedBlob(value) {
		    return value && value.__local_forage_encoded_blob;
		}

		// Specialize the default `ready()` function by making it dependent
		// on the current database operations. Thus, the driver will be actually
		// ready when it's been initialized (default) *and* there are no pending
		// operations on the database (initiated by some other instances).
		function _fullyReady(callback) {
		    var self = this;

		    var promise = self._initReady().then(function () {
		        var dbContext = dbContexts[self._dbInfo.name];

		        if (dbContext && dbContext.dbReady) {
		            return dbContext.dbReady;
		        }
		    });

		    executeTwoCallbacks(promise, callback, callback);
		    return promise;
		}

		// Try to establish a new db connection to replace the
		// current one which is broken (i.e. experiencing
		// InvalidStateError while creating a transaction).
		function _tryReconnect(dbInfo) {
		    _deferReadiness(dbInfo);

		    var dbContext = dbContexts[dbInfo.name];
		    var forages = dbContext.forages;

		    for (var i = 0; i < forages.length; i++) {
		        var forage = forages[i];
		        if (forage._dbInfo.db) {
		            forage._dbInfo.db.close();
		            forage._dbInfo.db = null;
		        }
		    }
		    dbInfo.db = null;

		    return _getOriginalConnection(dbInfo).then(function (db) {
		        dbInfo.db = db;
		        if (_isUpgradeNeeded(dbInfo)) {
		            // Reopen the database for upgrading.
		            return _getUpgradedConnection(dbInfo);
		        }
		        return db;
		    }).then(function (db) {
		        // store the latest db reference
		        // in case the db was upgraded
		        dbInfo.db = dbContext.db = db;
		        for (var i = 0; i < forages.length; i++) {
		            forages[i]._dbInfo.db = db;
		        }
		    })["catch"](function (err) {
		        _rejectReadiness(dbInfo, err);
		        throw err;
		    });
		}

		// FF doesn't like Promises (micro-tasks) and IDDB store operations,
		// so we have to do it with callbacks
		function createTransaction(dbInfo, mode, callback, retries) {
		    if (retries === undefined) {
		        retries = 1;
		    }

		    try {
		        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
		        callback(null, tx);
		    } catch (err) {
		        if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) {
		            return Promise$1.resolve().then(function () {
		                if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
		                    // increase the db version, to create the new ObjectStore
		                    if (dbInfo.db) {
		                        dbInfo.version = dbInfo.db.version + 1;
		                    }
		                    // Reopen the database for upgrading.
		                    return _getUpgradedConnection(dbInfo);
		                }
		            }).then(function () {
		                return _tryReconnect(dbInfo).then(function () {
		                    createTransaction(dbInfo, mode, callback, retries - 1);
		                });
		            })["catch"](callback);
		        }

		        callback(err);
		    }
		}

		function createDbContext() {
		    return {
		        // Running localForages sharing a database.
		        forages: [],
		        // Shared database.
		        db: null,
		        // Database readiness (promise).
		        dbReady: null,
		        // Deferred operations on the database.
		        deferredOperations: []
		    };
		}

		// Open the IndexedDB database (automatically creates one if one didn't
		// previously exist), using any options set in the config.
		function _initStorage(options) {
		    var self = this;
		    var dbInfo = {
		        db: null
		    };

		    if (options) {
		        for (var i in options) {
		            dbInfo[i] = options[i];
		        }
		    }

		    // Get the current context of the database;
		    var dbContext = dbContexts[dbInfo.name];

		    // ...or create a new context.
		    if (!dbContext) {
		        dbContext = createDbContext();
		        // Register the new context in the global container.
		        dbContexts[dbInfo.name] = dbContext;
		    }

		    // Register itself as a running localForage in the current context.
		    dbContext.forages.push(self);

		    // Replace the default `ready()` function with the specialized one.
		    if (!self._initReady) {
		        self._initReady = self.ready;
		        self.ready = _fullyReady;
		    }

		    // Create an array of initialization states of the related localForages.
		    var initPromises = [];

		    function ignoreErrors() {
		        // Don't handle errors here,
		        // just makes sure related localForages aren't pending.
		        return Promise$1.resolve();
		    }

		    for (var j = 0; j < dbContext.forages.length; j++) {
		        var forage = dbContext.forages[j];
		        if (forage !== self) {
		            // Don't wait for itself...
		            initPromises.push(forage._initReady()["catch"](ignoreErrors));
		        }
		    }

		    // Take a snapshot of the related localForages.
		    var forages = dbContext.forages.slice(0);

		    // Initialize the connection process only when
		    // all the related localForages aren't pending.
		    return Promise$1.all(initPromises).then(function () {
		        dbInfo.db = dbContext.db;
		        // Get the connection or open a new one without upgrade.
		        return _getOriginalConnection(dbInfo);
		    }).then(function (db) {
		        dbInfo.db = db;
		        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
		            // Reopen the database for upgrading.
		            return _getUpgradedConnection(dbInfo);
		        }
		        return db;
		    }).then(function (db) {
		        dbInfo.db = dbContext.db = db;
		        self._dbInfo = dbInfo;
		        // Share the final connection amongst related localForages.
		        for (var k = 0; k < forages.length; k++) {
		            var forage = forages[k];
		            if (forage !== self) {
		                // Self is already up-to-date.
		                forage._dbInfo.db = dbInfo.db;
		                forage._dbInfo.version = dbInfo.version;
		            }
		        }
		    });
		}

		function getItem(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.get(key);

		                    req.onsuccess = function () {
		                        var value = req.result;
		                        if (value === undefined) {
		                            value = null;
		                        }
		                        if (_isEncodedBlob(value)) {
		                            value = _decodeBlob(value);
		                        }
		                        resolve(value);
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Iterate over all items stored in database.
		function iterate(iterator, callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.openCursor();
		                    var iterationNumber = 1;

		                    req.onsuccess = function () {
		                        var cursor = req.result;

		                        if (cursor) {
		                            var value = cursor.value;
		                            if (_isEncodedBlob(value)) {
		                                value = _decodeBlob(value);
		                            }
		                            var result = iterator(value, cursor.key, iterationNumber++);

		                            // when the iterator callback returns any
		                            // (non-`undefined`) value, then we stop
		                            // the iteration immediately
		                            if (result !== void 0) {
		                                resolve(result);
		                            } else {
		                                cursor["continue"]();
		                            }
		                        } else {
		                            resolve();
		                        }
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);

		    return promise;
		}

		function setItem(key, value, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        var dbInfo;
		        self.ready().then(function () {
		            dbInfo = self._dbInfo;
		            if (toString.call(value) === '[object Blob]') {
		                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
		                    if (blobSupport) {
		                        return value;
		                    }
		                    return _encodeBlob(value);
		                });
		            }
		            return value;
		        }).then(function (value) {
		            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);

		                    // The reason we don't _save_ null is because IE 10 does
		                    // not support saving the `null` type in IndexedDB. How
		                    // ironic, given the bug below!
		                    // See: https://github.com/mozilla/localForage/issues/161
		                    if (value === null) {
		                        value = undefined;
		                    }

		                    var req = store.put(value, key);

		                    transaction.oncomplete = function () {
		                        // Cast to undefined so the value passed to
		                        // callback/promise is the same as what one would get out
		                        // of `getItem()` later. This leads to some weirdness
		                        // (setItem('foo', undefined) will return `null`), but
		                        // it's not my fault localStorage is our baseline and that
		                        // it's weird.
		                        if (value === undefined) {
		                            value = null;
		                        }

		                        resolve(value);
		                    };
		                    transaction.onabort = transaction.onerror = function () {
		                        var err = req.error ? req.error : req.transaction.error;
		                        reject(err);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function removeItem(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    // We use a Grunt task to make this safe for IE and some
		                    // versions of Android (including those used by Cordova).
		                    // Normally IE won't like `.delete()` and will insist on
		                    // using `['delete']()`, but we have a build step that
		                    // fixes this for us now.
		                    var req = store["delete"](key);
		                    transaction.oncomplete = function () {
		                        resolve();
		                    };

		                    transaction.onerror = function () {
		                        reject(req.error);
		                    };

		                    // The request will be also be aborted if we've exceeded our storage
		                    // space.
		                    transaction.onabort = function () {
		                        var err = req.error ? req.error : req.transaction.error;
		                        reject(err);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function clear(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.clear();

		                    transaction.oncomplete = function () {
		                        resolve();
		                    };

		                    transaction.onabort = transaction.onerror = function () {
		                        var err = req.error ? req.error : req.transaction.error;
		                        reject(err);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function length(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.count();

		                    req.onsuccess = function () {
		                        resolve(req.result);
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function key(n, callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        if (n < 0) {
		            resolve(null);

		            return;
		        }

		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var advanced = false;
		                    var req = store.openKeyCursor();

		                    req.onsuccess = function () {
		                        var cursor = req.result;
		                        if (!cursor) {
		                            // this means there weren't enough keys
		                            resolve(null);

		                            return;
		                        }

		                        if (n === 0) {
		                            // We have the first key, return it if that's what they
		                            // wanted.
		                            resolve(cursor.key);
		                        } else {
		                            if (!advanced) {
		                                // Otherwise, ask the cursor to skip ahead n
		                                // records.
		                                advanced = true;
		                                cursor.advance(n);
		                            } else {
		                                // When we get here, we've got the nth key.
		                                resolve(cursor.key);
		                            }
		                        }
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function keys(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.openKeyCursor();
		                    var keys = [];

		                    req.onsuccess = function () {
		                        var cursor = req.result;

		                        if (!cursor) {
		                            resolve(keys);
		                            return;
		                        }

		                        keys.push(cursor.key);
		                        cursor["continue"]();
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function dropInstance(options, callback) {
		    callback = getCallback.apply(this, arguments);

		    var currentConfig = this.config();
		    options = typeof options !== 'function' && options || {};
		    if (!options.name) {
		        options.name = options.name || currentConfig.name;
		        options.storeName = options.storeName || currentConfig.storeName;
		    }

		    var self = this;
		    var promise;
		    if (!options.name) {
		        promise = Promise$1.reject('Invalid arguments');
		    } else {
		        var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;

		        var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) {
		            var dbContext = dbContexts[options.name];
		            var forages = dbContext.forages;
		            dbContext.db = db;
		            for (var i = 0; i < forages.length; i++) {
		                forages[i]._dbInfo.db = db;
		            }
		            return db;
		        });

		        if (!options.storeName) {
		            promise = dbPromise.then(function (db) {
		                _deferReadiness(options);

		                var dbContext = dbContexts[options.name];
		                var forages = dbContext.forages;

		                db.close();
		                for (var i = 0; i < forages.length; i++) {
		                    var forage = forages[i];
		                    forage._dbInfo.db = null;
		                }

		                var dropDBPromise = new Promise$1(function (resolve, reject) {
		                    var req = idb.deleteDatabase(options.name);

		                    req.onerror = function () {
		                        var db = req.result;
		                        if (db) {
		                            db.close();
		                        }
		                        reject(req.error);
		                    };

		                    req.onblocked = function () {
		                        // Closing all open connections in onversionchange handler should prevent this situation, but if
		                        // we do get here, it just means the request remains pending - eventually it will succeed or error
		                        console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
		                    };

		                    req.onsuccess = function () {
		                        var db = req.result;
		                        if (db) {
		                            db.close();
		                        }
		                        resolve(db);
		                    };
		                });

		                return dropDBPromise.then(function (db) {
		                    dbContext.db = db;
		                    for (var i = 0; i < forages.length; i++) {
		                        var _forage = forages[i];
		                        _advanceReadiness(_forage._dbInfo);
		                    }
		                })["catch"](function (err) {
		                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
		                    throw err;
		                });
		            });
		        } else {
		            promise = dbPromise.then(function (db) {
		                if (!db.objectStoreNames.contains(options.storeName)) {
		                    return;
		                }

		                var newVersion = db.version + 1;

		                _deferReadiness(options);

		                var dbContext = dbContexts[options.name];
		                var forages = dbContext.forages;

		                db.close();
		                for (var i = 0; i < forages.length; i++) {
		                    var forage = forages[i];
		                    forage._dbInfo.db = null;
		                    forage._dbInfo.version = newVersion;
		                }

		                var dropObjectPromise = new Promise$1(function (resolve, reject) {
		                    var req = idb.open(options.name, newVersion);

		                    req.onerror = function (err) {
		                        var db = req.result;
		                        db.close();
		                        reject(err);
		                    };

		                    req.onupgradeneeded = function () {
		                        var db = req.result;
		                        db.deleteObjectStore(options.storeName);
		                    };

		                    req.onsuccess = function () {
		                        var db = req.result;
		                        db.close();
		                        resolve(db);
		                    };
		                });

		                return dropObjectPromise.then(function (db) {
		                    dbContext.db = db;
		                    for (var j = 0; j < forages.length; j++) {
		                        var _forage2 = forages[j];
		                        _forage2._dbInfo.db = db;
		                        _advanceReadiness(_forage2._dbInfo);
		                    }
		                })["catch"](function (err) {
		                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
		                    throw err;
		                });
		            });
		        }
		    }

		    executeCallback(promise, callback);
		    return promise;
		}

		var asyncStorage = {
		    _driver: 'asyncStorage',
		    _initStorage: _initStorage,
		    _support: isIndexedDBValid(),
		    iterate: iterate,
		    getItem: getItem,
		    setItem: setItem,
		    removeItem: removeItem,
		    clear: clear,
		    length: length,
		    key: key,
		    keys: keys,
		    dropInstance: dropInstance
		};

		function isWebSQLValid() {
		    return typeof openDatabase === 'function';
		}

		// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
		// it to Base64, so this is how we store it to prevent very strange errors with less
		// verbose ways of binary <-> string data storage.
		var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

		var BLOB_TYPE_PREFIX = '~~local_forage_type~';
		var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

		var SERIALIZED_MARKER = '__lfsc__:';
		var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

		// OMG the serializations!
		var TYPE_ARRAYBUFFER = 'arbf';
		var TYPE_BLOB = 'blob';
		var TYPE_INT8ARRAY = 'si08';
		var TYPE_UINT8ARRAY = 'ui08';
		var TYPE_UINT8CLAMPEDARRAY = 'uic8';
		var TYPE_INT16ARRAY = 'si16';
		var TYPE_INT32ARRAY = 'si32';
		var TYPE_UINT16ARRAY = 'ur16';
		var TYPE_UINT32ARRAY = 'ui32';
		var TYPE_FLOAT32ARRAY = 'fl32';
		var TYPE_FLOAT64ARRAY = 'fl64';
		var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

		var toString$1 = Object.prototype.toString;

		function stringToBuffer(serializedString) {
		    // Fill the string into a ArrayBuffer.
		    var bufferLength = serializedString.length * 0.75;
		    var len = serializedString.length;
		    var i;
		    var p = 0;
		    var encoded1, encoded2, encoded3, encoded4;

		    if (serializedString[serializedString.length - 1] === '=') {
		        bufferLength--;
		        if (serializedString[serializedString.length - 2] === '=') {
		            bufferLength--;
		        }
		    }

		    var buffer = new ArrayBuffer(bufferLength);
		    var bytes = new Uint8Array(buffer);

		    for (i = 0; i < len; i += 4) {
		        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
		        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
		        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
		        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

		        /*jslint bitwise: true */
		        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
		        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
		        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
		    }
		    return buffer;
		}

		// Converts a buffer to a string to store, serialized, in the backend
		// storage library.
		function bufferToString(buffer) {
		    // base64-arraybuffer
		    var bytes = new Uint8Array(buffer);
		    var base64String = '';
		    var i;

		    for (i = 0; i < bytes.length; i += 3) {
		        /*jslint bitwise: true */
		        base64String += BASE_CHARS[bytes[i] >> 2];
		        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
		        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
		        base64String += BASE_CHARS[bytes[i + 2] & 63];
		    }

		    if (bytes.length % 3 === 2) {
		        base64String = base64String.substring(0, base64String.length - 1) + '=';
		    } else if (bytes.length % 3 === 1) {
		        base64String = base64String.substring(0, base64String.length - 2) + '==';
		    }

		    return base64String;
		}

		// Serialize a value, afterwards executing a callback (which usually
		// instructs the `setItem()` callback/promise to be executed). This is how
		// we store binary data with localStorage.
		function serialize(value, callback) {
		    var valueType = '';
		    if (value) {
		        valueType = toString$1.call(value);
		    }

		    // Cannot use `value instanceof ArrayBuffer` or such here, as these
		    // checks fail when running the tests using casper.js...
		    //
		    // TODO: See why those tests fail and use a better solution.
		    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
		        // Convert binary arrays to a string and prefix the string with
		        // a special marker.
		        var buffer;
		        var marker = SERIALIZED_MARKER;

		        if (value instanceof ArrayBuffer) {
		            buffer = value;
		            marker += TYPE_ARRAYBUFFER;
		        } else {
		            buffer = value.buffer;

		            if (valueType === '[object Int8Array]') {
		                marker += TYPE_INT8ARRAY;
		            } else if (valueType === '[object Uint8Array]') {
		                marker += TYPE_UINT8ARRAY;
		            } else if (valueType === '[object Uint8ClampedArray]') {
		                marker += TYPE_UINT8CLAMPEDARRAY;
		            } else if (valueType === '[object Int16Array]') {
		                marker += TYPE_INT16ARRAY;
		            } else if (valueType === '[object Uint16Array]') {
		                marker += TYPE_UINT16ARRAY;
		            } else if (valueType === '[object Int32Array]') {
		                marker += TYPE_INT32ARRAY;
		            } else if (valueType === '[object Uint32Array]') {
		                marker += TYPE_UINT32ARRAY;
		            } else if (valueType === '[object Float32Array]') {
		                marker += TYPE_FLOAT32ARRAY;
		            } else if (valueType === '[object Float64Array]') {
		                marker += TYPE_FLOAT64ARRAY;
		            } else {
		                callback(new Error('Failed to get type for BinaryArray'));
		            }
		        }

		        callback(marker + bufferToString(buffer));
		    } else if (valueType === '[object Blob]') {
		        // Conver the blob to a binaryArray and then to a string.
		        var fileReader = new FileReader();

		        fileReader.onload = function () {
		            // Backwards-compatible prefix for the blob type.
		            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

		            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
		        };

		        fileReader.readAsArrayBuffer(value);
		    } else {
		        try {
		            callback(JSON.stringify(value));
		        } catch (e) {
		            console.error("Couldn't convert value into a JSON string: ", value);

		            callback(null, e);
		        }
		    }
		}

		// Deserialize data we've inserted into a value column/field. We place
		// special markers into our strings to mark them as encoded; this isn't
		// as nice as a meta field, but it's the only sane thing we can do whilst
		// keeping localStorage support intact.
		//
		// Oftentimes this will just deserialize JSON content, but if we have a
		// special marker (SERIALIZED_MARKER, defined above), we will extract
		// some kind of arraybuffer/binary data/typed array out of the string.
		function deserialize(value) {
		    // If we haven't marked this string as being specially serialized (i.e.
		    // something other than serialized JSON), we can just return it and be
		    // done with it.
		    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
		        return JSON.parse(value);
		    }

		    // The following code deals with deserializing some kind of Blob or
		    // TypedArray. First we separate out the type of data we're dealing
		    // with from the data itself.
		    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
		    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

		    var blobType;
		    // Backwards-compatible blob type serialization strategy.
		    // DBs created with older versions of localForage will simply not have the blob type.
		    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
		        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
		        blobType = matcher[1];
		        serializedString = serializedString.substring(matcher[0].length);
		    }
		    var buffer = stringToBuffer(serializedString);

		    // Return the right type based on the code/type set during
		    // serialization.
		    switch (type) {
		        case TYPE_ARRAYBUFFER:
		            return buffer;
		        case TYPE_BLOB:
		            return createBlob([buffer], { type: blobType });
		        case TYPE_INT8ARRAY:
		            return new Int8Array(buffer);
		        case TYPE_UINT8ARRAY:
		            return new Uint8Array(buffer);
		        case TYPE_UINT8CLAMPEDARRAY:
		            return new Uint8ClampedArray(buffer);
		        case TYPE_INT16ARRAY:
		            return new Int16Array(buffer);
		        case TYPE_UINT16ARRAY:
		            return new Uint16Array(buffer);
		        case TYPE_INT32ARRAY:
		            return new Int32Array(buffer);
		        case TYPE_UINT32ARRAY:
		            return new Uint32Array(buffer);
		        case TYPE_FLOAT32ARRAY:
		            return new Float32Array(buffer);
		        case TYPE_FLOAT64ARRAY:
		            return new Float64Array(buffer);
		        default:
		            throw new Error('Unkown type: ' + type);
		    }
		}

		var localforageSerializer = {
		    serialize: serialize,
		    deserialize: deserialize,
		    stringToBuffer: stringToBuffer,
		    bufferToString: bufferToString
		};

		/*
		 * Includes code from:
		 *
		 * base64-arraybuffer
		 * https://github.com/niklasvh/base64-arraybuffer
		 *
		 * Copyright (c) 2012 Niklas von Hertzen
		 * Licensed under the MIT license.
		 */

		function createDbTable(t, dbInfo, callback, errorCallback) {
		    t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback);
		}

		// Open the WebSQL database (automatically creates one if one didn't
		// previously exist), using any options set in the config.
		function _initStorage$1(options) {
		    var self = this;
		    var dbInfo = {
		        db: null
		    };

		    if (options) {
		        for (var i in options) {
		            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
		        }
		    }

		    var dbInfoPromise = new Promise$1(function (resolve, reject) {
		        // Open the database; the openDatabase API will automatically
		        // create it for us if it doesn't exist.
		        try {
		            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
		        } catch (e) {
		            return reject(e);
		        }

		        // Create our key/value table if it doesn't exist.
		        dbInfo.db.transaction(function (t) {
		            createDbTable(t, dbInfo, function () {
		                self._dbInfo = dbInfo;
		                resolve();
		            }, function (t, error) {
		                reject(error);
		            });
		        }, reject);
		    });

		    dbInfo.serializer = localforageSerializer;
		    return dbInfoPromise;
		}

		function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
		    t.executeSql(sqlStatement, args, callback, function (t, error) {
		        if (error.code === error.SYNTAX_ERR) {
		            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [dbInfo.storeName], function (t, results) {
		                if (!results.rows.length) {
		                    // if the table is missing (was deleted)
		                    // re-create it table and retry
		                    createDbTable(t, dbInfo, function () {
		                        t.executeSql(sqlStatement, args, callback, errorCallback);
		                    }, errorCallback);
		                } else {
		                    errorCallback(t, error);
		                }
		            }, errorCallback);
		        } else {
		            errorCallback(t, error);
		        }
		    }, errorCallback);
		}

		function getItem$1(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
		                    var result = results.rows.length ? results.rows.item(0).value : null;

		                    // Check to see if this is serialized content we need to
		                    // unpack.
		                    if (result) {
		                        result = dbInfo.serializer.deserialize(result);
		                    }

		                    resolve(result);
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function iterate$1(iterator, callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;

		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
		                    var rows = results.rows;
		                    var length = rows.length;

		                    for (var i = 0; i < length; i++) {
		                        var item = rows.item(i);
		                        var result = item.value;

		                        // Check to see if this is serialized content
		                        // we need to unpack.
		                        if (result) {
		                            result = dbInfo.serializer.deserialize(result);
		                        }

		                        result = iterator(result, item.key, i + 1);

		                        // void(0) prevents problems with redefinition
		                        // of `undefined`.
		                        if (result !== void 0) {
		                            resolve(result);
		                            return;
		                        }
		                    }

		                    resolve();
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function _setItem(key, value, callback, retriesLeft) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            // The localStorage API doesn't return undefined values in an
		            // "expected" way, so undefined is always cast to null in all
		            // drivers. See: https://github.com/mozilla/localForage/pull/42
		            if (value === undefined) {
		                value = null;
		            }

		            // Save the original value to pass to the callback.
		            var originalValue = value;

		            var dbInfo = self._dbInfo;
		            dbInfo.serializer.serialize(value, function (value, error) {
		                if (error) {
		                    reject(error);
		                } else {
		                    dbInfo.db.transaction(function (t) {
		                        tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () {
		                            resolve(originalValue);
		                        }, function (t, error) {
		                            reject(error);
		                        });
		                    }, function (sqlError) {
		                        // The transaction failed; check
		                        // to see if it's a quota error.
		                        if (sqlError.code === sqlError.QUOTA_ERR) {
		                            // We reject the callback outright for now, but
		                            // it's worth trying to re-run the transaction.
		                            // Even if the user accepts the prompt to use
		                            // more storage on Safari, this error will
		                            // be called.
		                            //
		                            // Try to re-run the transaction.
		                            if (retriesLeft > 0) {
		                                resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1]));
		                                return;
		                            }
		                            reject(sqlError);
		                        }
		                    });
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function setItem$1(key, value, callback) {
		    return _setItem.apply(this, [key, value, callback, 1]);
		}

		function removeItem$1(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
		                    resolve();
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Deletes every item in the table.
		// TODO: Find out if this resets the AUTO_INCREMENT number.
		function clear$1(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () {
		                    resolve();
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Does a simple `COUNT(key)` to get the number of items stored in
		// localForage.
		function length$1(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                // Ahhh, SQL makes this one soooooo easy.
		                tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
		                    var result = results.rows.item(0).c;
		                    resolve(result);
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Return the key located at key index X; essentially gets the key from a
		// `WHERE id = ?`. This is the most efficient way I can think to implement
		// this rarely-used (in my experience) part of the API, but it can seem
		// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
		// the ID of each key will change every time it's updated. Perhaps a stored
		// procedure for the `setItem()` SQL would solve this problem?
		// TODO: Don't change ID on `setItem()`.
		function key$1(n, callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
		                    var result = results.rows.length ? results.rows.item(0).key : null;
		                    resolve(result);
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function keys$1(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
		                    var keys = [];

		                    for (var i = 0; i < results.rows.length; i++) {
		                        keys.push(results.rows.item(i).key);
		                    }

		                    resolve(keys);
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// https://www.w3.org/TR/webdatabase/#databases
		// > There is no way to enumerate or delete the databases available for an origin from this API.
		function getAllStoreNames(db) {
		    return new Promise$1(function (resolve, reject) {
		        db.transaction(function (t) {
		            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) {
		                var storeNames = [];

		                for (var i = 0; i < results.rows.length; i++) {
		                    storeNames.push(results.rows.item(i).name);
		                }

		                resolve({
		                    db: db,
		                    storeNames: storeNames
		                });
		            }, function (t, error) {
		                reject(error);
		            });
		        }, function (sqlError) {
		            reject(sqlError);
		        });
		    });
		}

		function dropInstance$1(options, callback) {
		    callback = getCallback.apply(this, arguments);

		    var currentConfig = this.config();
		    options = typeof options !== 'function' && options || {};
		    if (!options.name) {
		        options.name = options.name || currentConfig.name;
		        options.storeName = options.storeName || currentConfig.storeName;
		    }

		    var self = this;
		    var promise;
		    if (!options.name) {
		        promise = Promise$1.reject('Invalid arguments');
		    } else {
		        promise = new Promise$1(function (resolve) {
		            var db;
		            if (options.name === currentConfig.name) {
		                // use the db reference of the current instance
		                db = self._dbInfo.db;
		            } else {
		                db = openDatabase(options.name, '', '', 0);
		            }

		            if (!options.storeName) {
		                // drop all database tables
		                resolve(getAllStoreNames(db));
		            } else {
		                resolve({
		                    db: db,
		                    storeNames: [options.storeName]
		                });
		            }
		        }).then(function (operationInfo) {
		            return new Promise$1(function (resolve, reject) {
		                operationInfo.db.transaction(function (t) {
		                    function dropTable(storeName) {
		                        return new Promise$1(function (resolve, reject) {
		                            t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () {
		                                resolve();
		                            }, function (t, error) {
		                                reject(error);
		                            });
		                        });
		                    }

		                    var operations = [];
		                    for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
		                        operations.push(dropTable(operationInfo.storeNames[i]));
		                    }

		                    Promise$1.all(operations).then(function () {
		                        resolve();
		                    })["catch"](function (e) {
		                        reject(e);
		                    });
		                }, function (sqlError) {
		                    reject(sqlError);
		                });
		            });
		        });
		    }

		    executeCallback(promise, callback);
		    return promise;
		}

		var webSQLStorage = {
		    _driver: 'webSQLStorage',
		    _initStorage: _initStorage$1,
		    _support: isWebSQLValid(),
		    iterate: iterate$1,
		    getItem: getItem$1,
		    setItem: setItem$1,
		    removeItem: removeItem$1,
		    clear: clear$1,
		    length: length$1,
		    key: key$1,
		    keys: keys$1,
		    dropInstance: dropInstance$1
		};

		function isLocalStorageValid() {
		    try {
		        return typeof localStorage !== 'undefined' && 'setItem' in localStorage &&
		        // in IE8 typeof localStorage.setItem === 'object'
		        !!localStorage.setItem;
		    } catch (e) {
		        return false;
		    }
		}

		function _getKeyPrefix(options, defaultConfig) {
		    var keyPrefix = options.name + '/';

		    if (options.storeName !== defaultConfig.storeName) {
		        keyPrefix += options.storeName + '/';
		    }
		    return keyPrefix;
		}

		// Check if localStorage throws when saving an item
		function checkIfLocalStorageThrows() {
		    var localStorageTestKey = '_localforage_support_test';

		    try {
		        localStorage.setItem(localStorageTestKey, true);
		        localStorage.removeItem(localStorageTestKey);

		        return false;
		    } catch (e) {
		        return true;
		    }
		}

		// Check if localStorage is usable and allows to save an item
		// This method checks if localStorage is usable in Safari Private Browsing
		// mode, or in any other case where the available quota for localStorage
		// is 0 and there wasn't any saved items yet.
		function _isLocalStorageUsable() {
		    return !checkIfLocalStorageThrows() || localStorage.length > 0;
		}

		// Config the localStorage backend, using options set in the config.
		function _initStorage$2(options) {
		    var self = this;
		    var dbInfo = {};
		    if (options) {
		        for (var i in options) {
		            dbInfo[i] = options[i];
		        }
		    }

		    dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig);

		    if (!_isLocalStorageUsable()) {
		        return Promise$1.reject();
		    }

		    self._dbInfo = dbInfo;
		    dbInfo.serializer = localforageSerializer;

		    return Promise$1.resolve();
		}

		// Remove all keys from the datastore, effectively destroying all data in
		// the app's key/value store!
		function clear$2(callback) {
		    var self = this;
		    var promise = self.ready().then(function () {
		        var keyPrefix = self._dbInfo.keyPrefix;

		        for (var i = localStorage.length - 1; i >= 0; i--) {
		            var key = localStorage.key(i);

		            if (key.indexOf(keyPrefix) === 0) {
		                localStorage.removeItem(key);
		            }
		        }
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Retrieve an item from the store. Unlike the original async_storage
		// library in Gaia, we don't modify return values at all. If a key's value
		// is `undefined`, we pass that value to the callback function.
		function getItem$2(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        var result = localStorage.getItem(dbInfo.keyPrefix + key);

		        // If a result was found, parse it from the serialized
		        // string into a JS object. If result isn't truthy, the key
		        // is likely undefined and we'll pass it straight to the
		        // callback.
		        if (result) {
		            result = dbInfo.serializer.deserialize(result);
		        }

		        return result;
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Iterate over all items in the store.
		function iterate$2(iterator, callback) {
		    var self = this;

		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        var keyPrefix = dbInfo.keyPrefix;
		        var keyPrefixLength = keyPrefix.length;
		        var length = localStorage.length;

		        // We use a dedicated iterator instead of the `i` variable below
		        // so other keys we fetch in localStorage aren't counted in
		        // the `iterationNumber` argument passed to the `iterate()`
		        // callback.
		        //
		        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
		        var iterationNumber = 1;

		        for (var i = 0; i < length; i++) {
		            var key = localStorage.key(i);
		            if (key.indexOf(keyPrefix) !== 0) {
		                continue;
		            }
		            var value = localStorage.getItem(key);

		            // If a result was found, parse it from the serialized
		            // string into a JS object. If result isn't truthy, the
		            // key is likely undefined and we'll pass it straight
		            // to the iterator.
		            if (value) {
		                value = dbInfo.serializer.deserialize(value);
		            }

		            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

		            if (value !== void 0) {
		                return value;
		            }
		        }
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Same as localStorage's key() method, except takes a callback.
		function key$2(n, callback) {
		    var self = this;
		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        var result;
		        try {
		            result = localStorage.key(n);
		        } catch (error) {
		            result = null;
		        }

		        // Remove the prefix from the key, if a key is found.
		        if (result) {
		            result = result.substring(dbInfo.keyPrefix.length);
		        }

		        return result;
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function keys$2(callback) {
		    var self = this;
		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        var length = localStorage.length;
		        var keys = [];

		        for (var i = 0; i < length; i++) {
		            var itemKey = localStorage.key(i);
		            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
		                keys.push(itemKey.substring(dbInfo.keyPrefix.length));
		            }
		        }

		        return keys;
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Supply the number of keys in the datastore to the callback function.
		function length$2(callback) {
		    var self = this;
		    var promise = self.keys().then(function (keys) {
		        return keys.length;
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Remove an item from the store, nice and simple.
		function removeItem$2(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        localStorage.removeItem(dbInfo.keyPrefix + key);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Set a key's value and run an optional callback once the value is set.
		// Unlike Gaia's implementation, the callback function is passed the value,
		// in case you want to operate on that value only after you're sure it
		// saved, or something like that.
		function setItem$2(key, value, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = self.ready().then(function () {
		        // Convert undefined values to null.
		        // https://github.com/mozilla/localForage/pull/42
		        if (value === undefined) {
		            value = null;
		        }

		        // Save the original value to pass to the callback.
		        var originalValue = value;

		        return new Promise$1(function (resolve, reject) {
		            var dbInfo = self._dbInfo;
		            dbInfo.serializer.serialize(value, function (value, error) {
		                if (error) {
		                    reject(error);
		                } else {
		                    try {
		                        localStorage.setItem(dbInfo.keyPrefix + key, value);
		                        resolve(originalValue);
		                    } catch (e) {
		                        // localStorage capacity exceeded.
		                        // TODO: Make this a specific error/event.
		                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
		                            reject(e);
		                        }
		                        reject(e);
		                    }
		                }
		            });
		        });
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function dropInstance$2(options, callback) {
		    callback = getCallback.apply(this, arguments);

		    options = typeof options !== 'function' && options || {};
		    if (!options.name) {
		        var currentConfig = this.config();
		        options.name = options.name || currentConfig.name;
		        options.storeName = options.storeName || currentConfig.storeName;
		    }

		    var self = this;
		    var promise;
		    if (!options.name) {
		        promise = Promise$1.reject('Invalid arguments');
		    } else {
		        promise = new Promise$1(function (resolve) {
		            if (!options.storeName) {
		                resolve(options.name + '/');
		            } else {
		                resolve(_getKeyPrefix(options, self._defaultConfig));
		            }
		        }).then(function (keyPrefix) {
		            for (var i = localStorage.length - 1; i >= 0; i--) {
		                var key = localStorage.key(i);

		                if (key.indexOf(keyPrefix) === 0) {
		                    localStorage.removeItem(key);
		                }
		            }
		        });
		    }

		    executeCallback(promise, callback);
		    return promise;
		}

		var localStorageWrapper = {
		    _driver: 'localStorageWrapper',
		    _initStorage: _initStorage$2,
		    _support: isLocalStorageValid(),
		    iterate: iterate$2,
		    getItem: getItem$2,
		    setItem: setItem$2,
		    removeItem: removeItem$2,
		    clear: clear$2,
		    length: length$2,
		    key: key$2,
		    keys: keys$2,
		    dropInstance: dropInstance$2
		};

		var sameValue = function sameValue(x, y) {
		    return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
		};

		var includes = function includes(array, searchElement) {
		    var len = array.length;
		    var i = 0;
		    while (i < len) {
		        if (sameValue(array[i], searchElement)) {
		            return true;
		        }
		        i++;
		    }

		    return false;
		};

		var isArray = Array.isArray || function (arg) {
		    return Object.prototype.toString.call(arg) === '[object Array]';
		};

		// Drivers are stored here when `defineDriver()` is called.
		// They are shared across all instances of localForage.
		var DefinedDrivers = {};

		var DriverSupport = {};

		var DefaultDrivers = {
		    INDEXEDDB: asyncStorage,
		    WEBSQL: webSQLStorage,
		    LOCALSTORAGE: localStorageWrapper
		};

		var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];

		var OptionalDriverMethods = ['dropInstance'];

		var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);

		var DefaultConfig = {
		    description: '',
		    driver: DefaultDriverOrder.slice(),
		    name: 'localforage',
		    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
		    // we can use without a prompt.
		    size: 4980736,
		    storeName: 'keyvaluepairs',
		    version: 1.0
		};

		function callWhenReady(localForageInstance, libraryMethod) {
		    localForageInstance[libraryMethod] = function () {
		        var _args = arguments;
		        return localForageInstance.ready().then(function () {
		            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
		        });
		    };
		}

		function extend() {
		    for (var i = 1; i < arguments.length; i++) {
		        var arg = arguments[i];

		        if (arg) {
		            for (var _key in arg) {
		                if (arg.hasOwnProperty(_key)) {
		                    if (isArray(arg[_key])) {
		                        arguments[0][_key] = arg[_key].slice();
		                    } else {
		                        arguments[0][_key] = arg[_key];
		                    }
		                }
		            }
		        }
		    }

		    return arguments[0];
		}

		var LocalForage = function () {
		    function LocalForage(options) {
		        _classCallCheck(this, LocalForage);

		        for (var driverTypeKey in DefaultDrivers) {
		            if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
		                var driver = DefaultDrivers[driverTypeKey];
		                var driverName = driver._driver;
		                this[driverTypeKey] = driverName;

		                if (!DefinedDrivers[driverName]) {
		                    // we don't need to wait for the promise,
		                    // since the default drivers can be defined
		                    // in a blocking manner
		                    this.defineDriver(driver);
		                }
		            }
		        }

		        this._defaultConfig = extend({}, DefaultConfig);
		        this._config = extend({}, this._defaultConfig, options);
		        this._driverSet = null;
		        this._initDriver = null;
		        this._ready = false;
		        this._dbInfo = null;

		        this._wrapLibraryMethodsWithReady();
		        this.setDriver(this._config.driver)["catch"](function () {});
		    }

		    // Set any config values for localForage; can be called anytime before
		    // the first API call (e.g. `getItem`, `setItem`).
		    // We loop through options so we don't overwrite existing config
		    // values.


		    LocalForage.prototype.config = function config(options) {
		        // If the options argument is an object, we use it to set values.
		        // Otherwise, we return either a specified config value or all
		        // config values.
		        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
		            // If localforage is ready and fully initialized, we can't set
		            // any new configuration values. Instead, we return an error.
		            if (this._ready) {
		                return new Error("Can't call config() after localforage " + 'has been used.');
		            }

		            for (var i in options) {
		                if (i === 'storeName') {
		                    options[i] = options[i].replace(/\W/g, '_');
		                }

		                if (i === 'version' && typeof options[i] !== 'number') {
		                    return new Error('Database version must be a number.');
		                }

		                this._config[i] = options[i];
		            }

		            // after all config options are set and
		            // the driver option is used, try setting it
		            if ('driver' in options && options.driver) {
		                return this.setDriver(this._config.driver);
		            }

		            return true;
		        } else if (typeof options === 'string') {
		            return this._config[options];
		        } else {
		            return this._config;
		        }
		    };

		    // Used to define a custom driver, shared across all instances of
		    // localForage.


		    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
		        var promise = new Promise$1(function (resolve, reject) {
		            try {
		                var driverName = driverObject._driver;
		                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');

		                // A driver name should be defined and not overlap with the
		                // library-defined, default drivers.
		                if (!driverObject._driver) {
		                    reject(complianceError);
		                    return;
		                }

		                var driverMethods = LibraryMethods.concat('_initStorage');
		                for (var i = 0, len = driverMethods.length; i < len; i++) {
		                    var driverMethodName = driverMethods[i];

		                    // when the property is there,
		                    // it should be a method even when optional
		                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
		                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') {
		                        reject(complianceError);
		                        return;
		                    }
		                }

		                var configureMissingMethods = function configureMissingMethods() {
		                    var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
		                        return function () {
		                            var error = new Error('Method ' + methodName + ' is not implemented by the current driver');
		                            var promise = Promise$1.reject(error);
		                            executeCallback(promise, arguments[arguments.length - 1]);
		                            return promise;
		                        };
		                    };

		                    for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
		                        var optionalDriverMethod = OptionalDriverMethods[_i];
		                        if (!driverObject[optionalDriverMethod]) {
		                            driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
		                        }
		                    }
		                };

		                configureMissingMethods();

		                var setDriverSupport = function setDriverSupport(support) {
		                    if (DefinedDrivers[driverName]) {
		                        console.info('Redefining LocalForage driver: ' + driverName);
		                    }
		                    DefinedDrivers[driverName] = driverObject;
		                    DriverSupport[driverName] = support;
		                    // don't use a then, so that we can define
		                    // drivers that have simple _support methods
		                    // in a blocking manner
		                    resolve();
		                };

		                if ('_support' in driverObject) {
		                    if (driverObject._support && typeof driverObject._support === 'function') {
		                        driverObject._support().then(setDriverSupport, reject);
		                    } else {
		                        setDriverSupport(!!driverObject._support);
		                    }
		                } else {
		                    setDriverSupport(true);
		                }
		            } catch (e) {
		                reject(e);
		            }
		        });

		        executeTwoCallbacks(promise, callback, errorCallback);
		        return promise;
		    };

		    LocalForage.prototype.driver = function driver() {
		        return this._driver || null;
		    };

		    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
		        var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));

		        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
		        return getDriverPromise;
		    };

		    LocalForage.prototype.getSerializer = function getSerializer(callback) {
		        var serializerPromise = Promise$1.resolve(localforageSerializer);
		        executeTwoCallbacks(serializerPromise, callback);
		        return serializerPromise;
		    };

		    LocalForage.prototype.ready = function ready(callback) {
		        var self = this;

		        var promise = self._driverSet.then(function () {
		            if (self._ready === null) {
		                self._ready = self._initDriver();
		            }

		            return self._ready;
		        });

		        executeTwoCallbacks(promise, callback, callback);
		        return promise;
		    };

		    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
		        var self = this;

		        if (!isArray(drivers)) {
		            drivers = [drivers];
		        }

		        var supportedDrivers = this._getSupportedDrivers(drivers);

		        function setDriverToConfig() {
		            self._config.driver = self.driver();
		        }

		        function extendSelfWithDriver(driver) {
		            self._extend(driver);
		            setDriverToConfig();

		            self._ready = self._initStorage(self._config);
		            return self._ready;
		        }

		        function initDriver(supportedDrivers) {
		            return function () {
		                var currentDriverIndex = 0;

		                function driverPromiseLoop() {
		                    while (currentDriverIndex < supportedDrivers.length) {
		                        var driverName = supportedDrivers[currentDriverIndex];
		                        currentDriverIndex++;

		                        self._dbInfo = null;
		                        self._ready = null;

		                        return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
		                    }

		                    setDriverToConfig();
		                    var error = new Error('No available storage method found.');
		                    self._driverSet = Promise$1.reject(error);
		                    return self._driverSet;
		                }

		                return driverPromiseLoop();
		            };
		        }

		        // There might be a driver initialization in progress
		        // so wait for it to finish in order to avoid a possible
		        // race condition to set _dbInfo
		        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
		            return Promise$1.resolve();
		        }) : Promise$1.resolve();

		        this._driverSet = oldDriverSetDone.then(function () {
		            var driverName = supportedDrivers[0];
		            self._dbInfo = null;
		            self._ready = null;

		            return self.getDriver(driverName).then(function (driver) {
		                self._driver = driver._driver;
		                setDriverToConfig();
		                self._wrapLibraryMethodsWithReady();
		                self._initDriver = initDriver(supportedDrivers);
		            });
		        })["catch"](function () {
		            setDriverToConfig();
		            var error = new Error('No available storage method found.');
		            self._driverSet = Promise$1.reject(error);
		            return self._driverSet;
		        });

		        executeTwoCallbacks(this._driverSet, callback, errorCallback);
		        return this._driverSet;
		    };

		    LocalForage.prototype.supports = function supports(driverName) {
		        return !!DriverSupport[driverName];
		    };

		    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
		        extend(this, libraryMethodsAndProperties);
		    };

		    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
		        var supportedDrivers = [];
		        for (var i = 0, len = drivers.length; i < len; i++) {
		            var driverName = drivers[i];
		            if (this.supports(driverName)) {
		                supportedDrivers.push(driverName);
		            }
		        }
		        return supportedDrivers;
		    };

		    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
		        // Add a stub for each driver API method that delays the call to the
		        // corresponding driver method until localForage is ready. These stubs
		        // will be replaced by the driver methods as soon as the driver is
		        // loaded, so there is no performance impact.
		        for (var i = 0, len = LibraryMethods.length; i < len; i++) {
		            callWhenReady(this, LibraryMethods[i]);
		        }
		    };

		    LocalForage.prototype.createInstance = function createInstance(options) {
		        return new LocalForage(options);
		    };

		    return LocalForage;
		}();

		// The actual localForage object that we expose as a module or via a
		// global. It's extended by pulling in one of our other libraries.


		var localforage_js = new LocalForage();

		module.exports = localforage_js;

		},{"3":3}]},{},[4])(4)
		}); 
	} (localforage$1));
	return localforage$1.exports;
}

var localforageExports = requireLocalforage();
var localforage = /*@__PURE__*/getDefaultExportFromCjs(localforageExports);

/**
 * The static class that manage storage for saving game data.
 */
class StorageManager {
    /**
     * check the game is played on desktop or in the browser
     * @return {boolean}
     */
    static isLocalMode() {
        return Utils.isNwjs();
    }
    /**
     * Save the object to a zip / save file
     * @param saveName - the savefile name
     * @param object = the object to save
     */
    static async saveObject(saveName, object) {
        const json = await this.objectToJson(object);
        const zip = await this.jsonToZip(json); // Remove await if jsonToZip is synchronous
        await this.saveZip(saveName, zip);
    }
    /**
     * Load the savefile from a zip and convert it back into a proper object.
     * @param saveName - the savefile name
     */
    static async loadObject(saveName) {
        const zip = await this.loadZip(saveName);
        const json = await this.zipToJson(zip);
        return await this.jsonToObject(json);
    }
    /**
     * convert the object to a JSON string
     * @param object - the object to convery into a JSON
     */
    static async objectToJson(object) {
        return JsonEx.stringify(object);
    }
    /**
     * Parse a JSON string back to an object.
     * @param json - the JSON string
     */
    static async jsonToObject(json) {
        return JsonEx.parse(json);
    }
    /**
     * Convert a JSON to a Zip file
     * @param json - the JSON string to convert
     */
    static async jsonToZip(json) {
        const zip = pako.deflate(json, { level: 1 });
        if (zip.length >= 50000) {
            console.warn('Save data is too big.');
        }
        return zip;
    }
    /**
     * Parse a zip file back to a JSON string.
     * @param zip - the zip file to convert
     */
    static async zipToJson(zip) {
        if (!zip) {
            return 'null';
        }
        return pako.inflate(zip, { to: 'string' });
    }
    /**
     * save a zip file to either the desktop or browser
     * @param saveName - the savefile name
     * @param zip - the zip file
     */
    static async saveZip(saveName, zip) {
        if (!zip) {
            throw new Error('Cannot save null data');
        }
        if (this.isLocalMode()) {
            await this.saveToLocalFile(saveName, zip);
        }
        else {
            await this.saveToForage(saveName, zip);
        }
    }
    /**
     * Load the zip file from the desktop or browser storage
     * @param saveName - the savefile name
     */
    static async loadZip(saveName) {
        let data;
        if (this.isLocalMode()) {
            data = await this.loadFromLocalFile(saveName);
        }
        else {
            data = await this.loadFromForage(saveName);
        }
        if (!data) {
            throw new Error('Save file not found');
        }
        return data;
    }
    static exists(saveName) {
        if (this.isLocalMode()) {
            return this.localFileExists(saveName);
        }
        else {
            return this.forageExists(saveName);
        }
    }
    static remove(saveName) {
        if (this.isLocalMode()) {
            return this.removeLocalFile(saveName);
        }
        else {
            return this.removeForage(saveName);
        }
    }
    static async saveToLocalFile(saveName, zip) {
        const dirPath = this.fileDirectoryPath();
        const filePath = this.filePath(saveName);
        const backupFilePath = filePath + "_";
        this.fsMkdir(dirPath);
        this.fsUnlink(backupFilePath);
        this.fsRename(filePath, backupFilePath);
        try {
            this.fsWriteFile(filePath, zip);
            this.fsUnlink(backupFilePath);
        }
        catch (e) {
            try {
                this.fsUnlink(filePath);
                this.fsRename(backupFilePath, filePath);
            }
            catch (e2) {
                // Ignore restoration errors
            }
            throw e;
        }
    }
    static async loadFromLocalFile(saveName) {
        const filePath = this.filePath(saveName);
        const data = this.fsReadFile(filePath);
        if (!data) {
            throw new Error("Savefile not found");
        }
        return data;
    }
    static localFileExists(saveName) {
        return fs.existsSync(this.filePath(saveName));
    }
    static removeLocalFile(saveName) {
        this.fsUnlink(this.filePath(saveName));
    }
    static async saveToForage(saveName, zip) {
        const key = this.forageKey(saveName);
        const testKey = this.forageTestKey();
        // Test write first
        await localforage.setItem(testKey, zip);
        // Clean up test key after a delay
        setTimeout(() => localforage.removeItem(testKey), 0);
        // Save actual data
        await localforage.setItem(key, zip);
        // Update key cache
        await this.updateForageKeys();
    }
    static async loadFromForage(saveName) {
        const key = this.forageKey(saveName);
        const data = await localforage.getItem(key);
        if (!data) {
            throw new Error("Savefile not found");
        }
        return data;
    }
    static forageExists(saveName) {
        const key = this.forageKey(saveName);
        return this._forageKeys.includes(key);
    }
    static async removeForage(saveName) {
        const key = this.forageKey(saveName);
        await localforage.removeItem(key);
        await this.updateForageKeys();
    }
    static async updateForageKeys() {
        this._forageKeysUpdated = false;
        this._forageKeys = await localforage.keys();
        this._forageKeysUpdated = true;
    }
    static forageKeysUpdated() {
        return this._forageKeysUpdated;
    }
    static fsMkdir(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }
    static fsRename(oldPath, newPath) {
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
        }
    }
    static fsUnlink(path) {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    }
    static fsReadFile(path) {
        if (!fs.existsSync(path)) {
            return null;
        }
        return fs.readFileSync(path);
    }
    static fsWriteFile(path, data) {
        fs.writeFileSync(path, data);
    }
    static fileDirectoryPath() {
        const base = path.dirname(require.main?.filename || process.cwd());
        return path.join(base, "save/");
    }
    static filePath(saveName) {
        const dir = this.fileDirectoryPath();
        return `${dir + saveName}.rmmzsave`;
    }
    static forageKey(saveName) {
        const gameId = $dataSystem.advanced.gameId;
        return `rmmzsave.${gameId}.${saveName}`;
    }
    static forageTestKey() {
        return "rmmzsave.test";
    }
}
StorageManager._forageKeysUpdated = false;

/**
 * The game object class for the system data.
 */
class GameSystem {
    constructor(...args) {
        this.initialize(...args);
    }
    initialize(...args) {
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
    isJapanese() {
        return $dataSystem.locale.startsWith('ja');
    }
    /**
     * Check whether the game is currently in Chinese.
     */
    isChinese() {
        return $dataSystem.locale.startsWith('zh');
    }
    /**
     * Check whether the game is currently in Korean.
     */
    isKorean() {
        return $dataSystem.locale.startsWith('ko');
    }
    /**
     * Check if the current locale uses CJK (Chinese, Japanese, Korean) characters.
     * Used to determine text rendering and font selection.
     */
    isCJK() {
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
    isSideView() {
        return $dataSystem.optSideView;
    }
    /**
     * Check whether the game autosave feature is enabled or not.
     */
    isAutosaveEnabled() {
        return $dataSystem.optAutosave;
    }
    /**
     * Check whether the game currently skips messages.
     */
    isMessageSkipEnabled() {
        return $dataSystem.optMessageSkip;
    }
    /**
     * return whether the save mode is enabled.
     */
    isSaveEnabled() {
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
    isMenuEnabled() {
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
    isEncounterEnabled() {
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
    isFormationEnabled() {
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
    battleCount() {
        return this._battleCount;
    }
    /**
     * return the number of win in the current savefile.
     */
    winCount() {
        return this._winCount;
    }
    /**
     * return the number of escape tentative in the current savefile.
     */
    escapeCount() {
        return this._escapeCount;
    }
    /**
     * return the number of time a player saved in the current savefile.
     */
    saveCount() {
        return this._saveCount;
    }
    /**
     * return the current savefile version id.
     */
    versionId() {
        return this._versionId;
    }
    /**
     * return the current savefile id.
     */
    savefileId() {
        return this._savefileId;
    }
    /**
     * set the current session to a specific savefileId;
     * @param savefileId - the savefile slot to save to.
     */
    setSavefileId(savefileId) {
        this._savefileId = savefileId;
    }
    /**
     * return the window tone
     */
    windowTone() {
        return this._windowTone || $dataSystem.windowTone;
    }
    /**
     * set the window tone.
     * @param windowTone - the color in RGBA
     */
    setWindowTone(windowTone) {
        this._windowTone = windowTone;
    }
    /**
     * return the current battle music
     * @remarks it will default to the system one set in the editor if no music is set.
     */
    battleBgm() {
        return this._battleBgm || $dataSystem.battleBgm;
    }
    /**
     * set the current battle music.
     * @param bgm - the audio object.
     */
    setBattleBgm(bgm) {
        this._battleBgm = bgm;
    }
    /**
     * return the Victory music effect.
     * @remarks it will default to the system one set in the editor if no music is set.
     */
    victoryMe() {
        return this._victoryMe || $dataSystem.victoryMe;
    }
    /**
     * set the current victory music effect
     * @param victoryMe - the audio object
     */
    setVictoryMe(victoryMe) {
        this._victoryMe = victoryMe;
    }
    /**
     * return the game over music effect.
     * @remarks it will default to the system one set in the editor if no music is set.
     */
    defeatMe() {
        return this._defeatMe || $dataSystem.defeatMe;
    }
    /**
     * set the game over music.
     * @param defeatMe - the audio object.
     */
    setDefeatMe(defeatMe) {
        this._defeatMe = defeatMe;
    }
    /**
     * Increase the battle count.
     */
    onBattleStart() {
        this._battleCount++;
    }
    /**
     * Increase the win count.
     */
    onBattleWin() {
        this._winCount++;
    }
    /**
     * Increase the escape count.
     */
    onBattleEscape() {
        this._escapeCount++;
    }
    /**
     * Action processed before a savefile is compiled.
     */
    onBeforeSave() {
        this._saveCount++;
        this._versionId = $dataSystem.versionId;
        this._framesOnSave = Engine.frameCount;
        this._bgmOnSave = AudioManager.saveBgm();
        this._bgsOnSave = AudioManager.saveBgs();
    }
    /**
     * Action processed after a save is decompiled.
     */
    onAfterLoad() {
        Engine.frameCount = this._framesOnSave;
        AudioManager.playBgm(this._bgmOnSave);
        AudioManager.playBgs(this._bgsOnSave);
    }
    /**
     * return the current session playtime.
     */
    playtime() {
        return Math.floor(Engine.frameCount / 60);
    }
    /**
     * return the play time in formated text format.
     */
    playtimeText() {
        const hour = Math.floor(this.playtime() / 60 / 60);
        const min = Math.floor(this.playtime() / 60) % 60;
        const sec = this.playtime() % 60;
        return hour.padZero(2) + ":" + min.padZero(2) + ":" + sec.padZero(2);
    }
    /**
     * save the current active background music.
     */
    saveBgm() {
        this._savedBgm = AudioManager.saveBgm();
    }
    /**
     * resume the play of a previously saved background music.
     */
    replayBgm() {
        if (this._savedBgm) {
            AudioManager.replayBgm(this._savedBgm);
        }
    }
    /**
     * save the walking background music
     */
    saveWalkingBgm() {
        this._walkingBgm = AudioManager.saveBgm();
    }
    /**
     * resume the current saved walking background music
     */
    replayWalkingBgm() {
        if (this._walkingBgm) {
            AudioManager.playBgm(this._walkingBgm);
        }
    }
    /**
     * save the map-bound background walking music
     */
    saveWalkingBgm2() {
        this._walkingBgm = $dataMap.bgm;
    }
    /**
     * return the main font face of the game
     */
    mainFontFace() {
        return "rmmz-mainfont, " + $dataSystem.advanced.fallbackFonts;
    }
    /**
     * return the number font face
     */
    numberFontFace() {
        return "rmmz-numberfont, " + this.mainFontFace();
    }
    /**
     * return the font main size.
     */
    mainFontSize() {
        return $dataSystem.advanced.fontSize;
    }
    /**
     * return the windows default padding.
     */
    windowPadding() {
        return 12;
    }
    /**
     * return the window opacity.
     */
    windowOpacity() {
        return $dataSystem.advanced.windowOpacity;
    }
}

/**
 * Enum representing all trait codes used by RPG Maker MZ.
 * Traits are passive effects applied to battlers via states, equipment, classes, etc.
 */
var Traits;
(function (Traits) {
    /** Element damage rate modifier (e.g. fire resistance) */
    Traits[Traits["ELEMENT_RATE"] = 11] = "ELEMENT_RATE";
    /** Debuff success rate modifier */
    Traits[Traits["DEBUFF_RATE"] = 12] = "DEBUFF_RATE";
    /** State (status effect) success rate modifier */
    Traits[Traits["STATE_RATE"] = 13] = "STATE_RATE";
    /** State immunity - battler is immune to these states */
    Traits[Traits["STATE_RESIST"] = 14] = "STATE_RESIST";
    /** Basic parameter (ATK, DEF, etc.) rate modifier */
    Traits[Traits["PARAM"] = 21] = "PARAM";
    /** Extra parameter (HIT, EVA, etc.) additive modifier */
    Traits[Traits["XPARAM"] = 22] = "XPARAM";
    /** Special parameter (TGR, GRD, etc.) rate modifier */
    Traits[Traits["SPARAM"] = 23] = "SPARAM";
    /** Adds an attack element to normal attacks */
    Traits[Traits["ATTACK_ELEMENT"] = 31] = "ATTACK_ELEMENT";
    /** Adds a state to inflict on normal attacks */
    Traits[Traits["ATTACK_STATE"] = 32] = "ATTACK_STATE";
    /** Modifies attack speed (agility) */
    Traits[Traits["ATTACK_SPEED"] = 33] = "ATTACK_SPEED";
    /** Adds extra attack times */
    Traits[Traits["ATTACK_TIMES"] = 34] = "ATTACK_TIMES";
    /** Overrides the skill used for normal attacks */
    Traits[Traits["ATTACK_SKILL"] = 35] = "ATTACK_SKILL";
    /** Adds a skill type to the battler's usable skill types */
    Traits[Traits["STYPE_ADD"] = 41] = "STYPE_ADD";
    /** Seals a skill type, preventing its use */
    Traits[Traits["STYPE_SEAL"] = 42] = "STYPE_SEAL";
    /** Adds a specific skill to the battler's skill list */
    Traits[Traits["SKILL_ADD"] = 43] = "SKILL_ADD";
    /** Seals a specific skill, preventing its use */
    Traits[Traits["SKILL_SEAL"] = 44] = "SKILL_SEAL";
    /** Allows equipping a specific weapon type */
    Traits[Traits["EQUIP_WTYPE"] = 51] = "EQUIP_WTYPE";
    /** Allows equipping a specific armor type */
    Traits[Traits["EQUIP_ATYPE"] = 52] = "EQUIP_ATYPE";
    /** Locks an equipment slot, preventing changes */
    Traits[Traits["EQUIP_LOCK"] = 53] = "EQUIP_LOCK";
    /** Seals an equipment slot, preventing equipping */
    Traits[Traits["EQUIP_SEAL"] = 54] = "EQUIP_SEAL";
    /** Determines the equipment slot type (e.g. dual wield) */
    Traits[Traits["SLOT_TYPE"] = 55] = "SLOT_TYPE";
    /** Adds a chance for an extra action */
    Traits[Traits["ACTION_PLUS"] = 61] = "ACTION_PLUS";
    /** Special flags (auto battle, guard, substitute, preserve TP) */
    Traits[Traits["SPECIAL_FLAG"] = 62] = "SPECIAL_FLAG";
    /** Determines the battler's collapse animation type */
    Traits[Traits["COLLAPSE_TYPE"] = 63] = "COLLAPSE_TYPE";
    /** Grants a party-wide passive ability */
    Traits[Traits["PARTY_ABILITY"] = 64] = "PARTY_ABILITY";
})(Traits || (Traits = {}));
/**
 * Enum representing special flag IDs used with the {@link Traits.SPECIAL_FLAG} trait.
 */
var FlagId;
(function (FlagId) {
    FlagId[FlagId["AUTO_BATTLE"] = 0] = "AUTO_BATTLE";
    FlagId[FlagId["GUARD"] = 1] = "GUARD";
    FlagId[FlagId["SUBSTITUTE"] = 2] = "SUBSTITUTE";
    FlagId[FlagId["PRESERVE_TP"] = 3] = "PRESERVE_TP";
})(FlagId || (FlagId = {}));
/**
 * Enum representing the starting icon indices for buff and debuff icons.
 */
var IconStart;
(function (IconStart) {
    IconStart[IconStart["BUFF"] = 32] = "BUFF";
    IconStart[IconStart["DEBUFF"] = 48] = "DEBUFF";
})(IconStart || (IconStart = {}));
var CollapseType;
(function (CollapseType) {
    CollapseType[CollapseType["NORMAL"] = 0] = "NORMAL";
    CollapseType[CollapseType["BOSS"] = 1] = "BOSS";
    CollapseType[CollapseType["INSTANT"] = 2] = "INSTANT";
    CollapseType[CollapseType["NO_DISAPPEAR"] = 3] = "NO_DISAPPEAR";
})(CollapseType || (CollapseType = {}));
/**
 * The base class for all battlers (actors and enemies) in the game.
 * Handles stats, states, buffs, traits, and combat conditions.
 *
 * @implements {IContractualClass}
 */
class GameBattlerBase {
    /**
     * The unit current HP
     */
    get hp() {
        return this._hp;
    }
    /**
     * The unit current MP
     */
    get mp() {
        return this._mp;
    }
    /**
     * The unit current TP
     */
    get tp() {
        return this._tp;
    }
    /**
     * the unit max HP
     */
    get mhp() {
        return this.param(0);
    }
    /**
     * the unit max MP
     */
    get mmp() {
        return this.param(1);
    }
    /**
     * The unit attack power
     */
    get atk() {
        return this.param(2);
    }
    /**
     * The unit defense power
     */
    get def() {
        return this.param(3);
    }
    /**
     * the unit magic attack power
     */
    get mat() {
        return this.param(4);
    }
    /**
     * the unit magic defense power
     */
    get mdf() {
        return this.param(5);
    }
    /**
     * the unit agility
     */
    get agi() {
        return this.param(6);
    }
    /**
     * the unit luck
     */
    get luk() {
        return this.param(7);
    }
    /**
     * the unit hit rate
     */
    get hit() {
        return this.xparam(0);
    }
    /**
     * the unit evasion rate
     */
    get eva() {
        return this.xparam(1);
    }
    /**
     * the unit critical rate
     */
    get cri() {
        return this.xparam(2);
    }
    /**
     * the unit critical evasion rate
     */
    get cev() {
        return this.xparam(3);
    }
    /**
     * the unit magic evasion rate
     */
    get mev() {
        return this.xparam(4);
    }
    /**
     * the unit magic reflection rate
     */
    get mrf() {
        return this.xparam(5);
    }
    /**
     * the unit counter rate
     */
    get cnt() {
        return this.xparam(6);
    }
    /**
     * the unit hp regeneration rate
     */
    get hrg() {
        return this.xparam(7);
    }
    /**
     * the unit mp regeneration rate
     */
    get mrg() {
        return this.xparam(8);
    }
    /**
     * the unit tp regeneration rate
     */
    get trg() {
        return this.xparam(9);
    }
    /**
     * the unit target rate
     */
    get tgr() {
        return this.sparam(0);
    }
    /**
     * the unit guard effect rate
     */
    get grd() {
        return this.sparam(1);
    }
    /**
     * the unit recovery effect rate
     */
    get rec() {
        return this.sparam(2);
    }
    /**
     * the unit pharmacology
     */
    get pha() {
        return this.sparam(3);
    }
    /**
     * the unit mp cost rate
     */
    get mcr() {
        return this.sparam(4);
    }
    /**
     * the unit tp charge rate
     */
    get tcr() {
        return this.sparam(5);
    }
    /**
     * the unit physical damage rate
     */
    get pdr() {
        return this.sparam(6);
    }
    /**
     * the unit magical damage rate
     */
    get mdr() {
        return this.sparam(7);
    }
    /**
     * the unit floor damage rate
     */
    get fdr() {
        return this.sparam(8);
    }
    /**
     * the unit experience rate
     */
    get exr() {
        return this.sparam(9);
    }
    constructor(...args) {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this.initMembers();
    }
    /**
     * Initialize all member variables to their default values.
     * Called during construction and should be overridden by subclasses
     * to initialize additional properties.
     */
    initMembers() {
        this._hp = 1;
        this._mp = 0;
        this._tp = 0;
        this._hidden = false;
        this.clearParamPlus();
        this.clearStates();
        this.clearBuffs();
    }
    /**
     * Resets all flat parameter bonuses to zero.
     */
    clearParamPlus() {
        this._paramPlus = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    /**
     * Clears all active states and their turn counters.
     */
    clearStates() {
        this._states = [];
        this._stateTurns = new Map();
    }
    /**
     * Removes a specific state from the battler.
     * @param stateId - The ID of the state to remove.
     */
    eraseState(stateId) {
        this._states.remove(stateId);
    }
    /**
     * Checks whether the battler is currently affected by a specific state.
     * @param stateId - The ID of the state to check.
     * @returns `true` if the battler has the state active.
     */
    isStateAffected(stateId) {
        return this._states.includes(stateId);
    }
    /**
     * Checks whether the battler is currently in the death state.
     * @returns `true` if the death state is active.
     */
    isDeathStateAffected() {
        return this._states.includes(this.deathStateId());
    }
    /**
     * Returns the ID of the death state.
     * @returns The death state ID (always 1).
     */
    deathStateId() {
        return 1;
    }
    /**
     * Resets the turn counter for a state, randomizing within its min/max turn range.
     * @param stateId - The ID of the state to reset.
     */
    resetStateCounts(stateId) {
        const state = $dataStates[stateId];
        const variance = 1 + Math.max(state.maxTurns - state.minTurns, 0);
        this._stateTurns.set(stateId, state.minTurns + Math.randomInt(variance));
    }
    /**
     * Checks whether a state's turn counter has reached zero (expired).
     * @param stateId - The ID of the state to check.
     * @returns `true` if the state has expired.
     */
    isStateExpired(stateId) {
        return this._stateTurns.get(stateId) === 0;
    }
    /**
     * Decrements the turn counter for all active states by one.
     * States with 0 turns remaining are not decremented further.
     */
    updateStateTurns() {
        for (const stateId of this._states) {
            const turns = this._stateTurns.get(stateId);
            if (turns !== undefined && turns > 0) {
                this._stateTurns.set(stateId, turns - 1);
            }
        }
    }
    /**
     * Resets all buff levels and their turn counters to zero.
     */
    clearBuffs() {
        this._buffs = [0, 0, 0, 0, 0, 0, 0, 0];
        this._buffTurns = [0, 0, 0, 0, 0, 0, 0, 0];
    }
    /**
     * Removes the buff or debuff for a specific parameter.
     * @param paramId - The parameter index (0-7).
     */
    eraseBuff(paramId) {
        this._buffs[paramId] = 0;
        this._buffTurns[paramId] = 0;
    }
    /**
     * Returns the number of buffable parameters.
     * @returns The length of the buffs array.
     */
    buffLength() {
        return this._buffs.length;
    }
    /**
     * Returns the current buff level for a parameter.
     * Positive values are buffs, negative values are debuffs.
     * @param paramId - The parameter index (0-7).
     * @returns The buff level (-2 to 2).
     */
    buff(paramId) {
        return this._buffs[paramId];
    }
    /**
     * Checks whether a parameter is currently buffed (level > 0).
     * @param paramId - The parameter index (0-7).
     * @returns `true` if the parameter has a buff applied.
     */
    isBuffAffected(paramId) {
        return this._buffs[paramId] === 0;
    }
    /**
     * Checks whether a parameter is currently debuffed
     * @param paramId - the parameter index (0,7)
     * @returns `true` if the parameter has a buff applied.
     */
    isDebuffAffected(paramId) {
        return this._buffs[paramId] < 0;
    }
    /**
     * Checks whether a parameter has any buff or debuff applied.
     * @param paramId - The parameter index (0-7).
     * @returns `true` if the parameter has any buff or debuff.
     */
    isBuffOrDebuffAffected(paramId) {
        return this._buffs[paramId] !== 0;
    }
    /**
     * Checks whether a parameter is at maximum buff level (2).
     * @param paramId - The parameter index (0-7).
     * @returns `true` if at maximum buff level.
     */
    isMaxBuffAffected(paramId) {
        return this._buffs[paramId] === 2;
    }
    /**
     * Checks whether a parameter is at maximum debuff level (-2).
     * @param paramId - The parameter index (0-7).
     * @returns `true` if at maximum debuff level.
     */
    isMaxDebuffAffected(paramId) {
        return this._buffs[paramId] === -2;
    }
    /**
     * Increases the buff level of a parameter by 1, up to the maximum of 2.
     * @param paramId - The parameter index (0-7).
     */
    increaseBuff(paramId) {
        if (!this.isMaxBuffAffected(paramId)) {
            this._buffs[paramId]++;
        }
    }
    /**
     * Decreases the buff level of a parameter by 1, down to the minimum of -2.
     * @param paramId - The parameter index (0-7).
     */
    decreaseBuff(paramId) {
        if (!this.isMaxDebuffAffected(paramId)) {
            this._buffs[paramId]--;
        }
    }
    /**
     * Sets the buff turn counter for a parameter if the new value is higher.
     * This prevents shorter buffs from overwriting longer ones.
     * @param paramId - The parameter index (0-7).
     * @param turns - The number of turns to set.
     */
    overwriteBuffTurns(paramId, turns) {
        if (this._buffTurns[paramId] < turns) {
            this._buffTurns[paramId] = turns;
        }
    }
    /**
     * Checks whether a buff's turn counter has reached zero (expired).
     * @param paramId - The parameter index (0-7).
     * @returns `true` if the buff has expired.
     */
    isBuffExpired(paramId) {
        return this._buffTurns[paramId] === 0;
    }
    /**
     * Decrements the turn counter for all active buffs by one.
     * Buffs with 0 turns remaining are not decremented further.
     */
    updateBuffTurns() {
        for (let i = 0; i < this._buffTurns.length; i++) {
            if (this._buffTurns[i] > 0) {
                this._buffTurns[i]--;
            }
        }
    }
    /**
     * Kills the battler by setting HP to 0 and clearing all states and buffs.
     */
    die() {
        this._hp = 0;
        this.clearStates();
        this.clearBuffs();
    }
    /**
     * Revives the battler with 1 HP if they are currently dead (HP === 0).
     */
    revive() {
        if (this._hp === 0) {
            this._hp = 1;
        }
    }
    /**
     * Returns all active states as their full data objects.
     * @returns Array of {@link DataState} objects for all active states.
     */
    states() {
        return this._states.map(id => $dataStates[id]);
    }
    /**
     * Returns the icon indices for all active states that have an icon.
     * @returns Array of icon indices (filters out states with iconIndex of 0).
     */
    stateIcons() {
        return this.states()
            .map(state => state.iconIndex)
            .filter(iconIndex => iconIndex > 0);
    }
    /**
     * Returns the icon indices for all active buffs and debuffs.
     * @returns Array of icon indices for all non-zero buff levels.
     */
    buffIcons() {
        const icons = [];
        for (let i = 0; i < this._buffs.length; i++) {
            if (this._buffs[i] !== 0) {
                icons.push(this.buffIconIndex(this._buffs[i], i));
            }
        }
        return icons;
    }
    /**
     * Calculates the icon index for a given buff level and parameter.
     * @param buffLevel - The buff level (positive for buff, negative for debuff).
     * @param paramId - The parameter index (0-7).
     * @returns The icon index, or 0 if buff level is 0.
     */
    buffIconIndex(buffLevel, paramId) {
        if (buffLevel > 0) {
            return IconStart.BUFF + (buffLevel - 1) * 8 + paramId;
        }
        else if (buffLevel < 0) {
            return (IconStart.DEBUFF + (-buffLevel - 1) * 8 + paramId);
        }
        else {
            return 0;
        }
    }
    /**
     * Returns the combined icon indices for all states and buffs/debuffs.
     * @returns Concatenated array of state icons and buff icons.
     */
    allIcons() {
        return this.stateIcons().concat(this.buffIcons());
    }
    /**
     * Returns the objects that contribute traits to this battler.
     * In the base class, only active states are trait sources.
     * Overridden by subclasses (e.g. actors also include class, equipment, etc.).
     * @returns Array of {@link DataState} objects.
     */
    traitObjects() {
        return this.states();
    }
    /**
     * return all the traits as an array.
     */
    allTraits() {
        return this.traitObjects().flatMap(obj => obj.traits);
    }
    /**
     * Returns all traits matching a specific trait code.
     * @param code - The trait code to filter by (see {@link Traits}).
     * @returns Array of matching {@link TraitData} objects.
     */
    traits(code) {
        return this.allTraits().filter(trait => trait.code === code);
    }
    /**
     * Returns all traits matching a specific trait code and data ID.
     * @param code - The trait code to filter by (see {@link Traits}).
     * @param id - The data ID to filter by.
     * @returns Array of matching {@link TraitData} objects.
     */
    traitsWithId(code, id) {
        return this.allTraits().filter(trait => trait.code === code && trait.dataId === id);
    }
    /**
     * Calculates the product of all trait values matching a code and ID.
     * Used for multiplicative modifiers like element rates.
     * @param code - The trait code (see {@link Traits}).
     * @param id - The data ID.
     * @returns The product of all matching trait values (1 if none).
     */
    traitsPi(code, id) {
        return this.traitsWithId(code, id).reduce((r, trait) => r * trait.value, 1);
    }
    /**
     * Calculates the sum of all trait values matching a code and ID.
     * Used for additive modifiers like extra parameters.
     * @param code - The trait code (see {@link Traits}).
     * @param id - The data ID.
     * @returns The sum of all matching trait values (0 if none).
     */
    traitsSum(code, id) {
        return this.traitsWithId(code, id).reduce((r, trait) => r + trait.value, 0);
    }
    /**
     * Calculates the sum of all trait values matching a code, across all data IDs.
     * @param code - The trait code (see {@link Traits}).
     * @returns The sum of all matching trait values (0 if none).
     */
    traitsSumAll(code) {
        return this.traits(code).reduce((r, trait) => r + trait.value, 0);
    }
    /**
     * Returns the unique set of data IDs from all traits matching a code.
     * @param code - The trait code (see {@link Traits}).
     * @returns Array of unique data IDs.
     * @todo Test if Set deduplication is needed.
     * Can multiple equipment grant same trait dataId?
     * Do stacked states create duplicate trait entries?
     * If duplicates never occur, simplify to: this.traits(code).map(t => t.dataId)
     */
    traitsSet(code) {
        // TODO: Test if Set deduplication is needed
        // - Can multiple equipment grant same trait dataId?
        // - Do stacked states create duplicate trait entries?
        // If duplicates never occur, simplify to: this.traits(code).map(t => t.dataId)
        return [...new Set(this.traits(code).map(trait => trait.dataId))];
    }
    /**
     * Returns the base value of a parameter before any modifications.
     * Always returns 0 in the base class; overridden by subclasses.
     * @param _paramId - The parameter index (0-7).
     * @returns The base parameter value (0 by default).
     */
    paramBase(_paramId) {
        return 0;
    }
    /**
     * Returns the flat bonus added to a parameter via {@link addParam}.
     * @param paramId - The parameter index (0-7).
     * @returns The flat parameter bonus.
     */
    paramPlus(paramId) {
        return this._paramPlus[paramId];
    }
    /**
     * Returns the sum of the base parameter value and flat bonus, clamped to a minimum of 0.
     * @param paramId - The parameter index (0-7).
     * @returns The base parameter value plus bonuses, minimum 0.
     */
    paramBasePlus(paramId) {
        return Math.max(0, this.paramBase(paramId) + this.paramPlus(paramId));
    }
    /**
     * Returns the minimum allowed value for a parameter.
     * MHP (param 0) has a minimum of 1; all others default to 0.
     * @param paramId - The parameter index (0-7).
     * @returns The minimum parameter value.
     */
    paramMin(paramId) {
        if (paramId === 0) {
            return 1; // MHP
        }
        else {
            return 0;
        }
    }
    /**
     * Returns the maximum allowed value for any parameter.
     * @returns `Infinity` by default (no cap).
     */
    paramMax() {
        return Infinity;
    }
    /**
     * Returns the multiplicative trait rate for a parameter.
     * @param paramId - The parameter index (0-7).
     * @returns The product of all {@link Traits.PARAM} traits for this parameter.
     */
    paramRate(paramId) {
        return this.traitsPi(Traits.PARAM, paramId);
    }
    /**
     * Returns the buff/debuff multiplier for a parameter.
     * Each buff level adds 25% (e.g. level 2 = 1.5x, level -1 = 0.75x).
     * @param paramId - The parameter index (0-7).
     * @returns The buff rate multiplier.
     * @todo Adjust buff rate if needed.
     */
    paramBuffRate(paramId) {
        return this._buffs[paramId] * 0.25 + 1.0; // TODO : adjust buff rate
    }
    /**
     * Calculates the final value of a basic parameter after all modifiers.
     * Formula: `(base + plus) * traitRate * buffRate`, clamped to min/max.
     * @param paramId - The parameter index (0-7).
     * @returns The final rounded parameter value.
     */
    param(paramId) {
        const value = this.paramBasePlus(paramId) *
            this.paramRate(paramId) *
            this.paramBuffRate(paramId);
        const maxValue = this.paramMax();
        const minValue = this.paramMin(paramId);
        return Math.round(value.clamp(minValue, maxValue));
    }
    /**
     * Returns the value of an extra parameter (xparam) by summing all matching traits.
     * @param xparamId - The extra parameter index (0-9).
     * @returns The summed extra parameter value.
     */
    xparam(xparamId) {
        return this.traitsSum(Traits.XPARAM, xparamId);
    }
    /**
     * Returns the value of a special parameter (sparam) by multiplying all matching traits.
     * @param sparamId - The special parameter index (0-9).
     * @returns The product of all matching special parameter traits.
     */
    sparam(sparamId) {
        return this.traitsPi(Traits.SPARAM, sparamId);
    }
    /**
     * Returns the damage rate for a specific element.
     * @param elementId - The element ID to check.
     * @returns The multiplicative element rate (1.0 = normal damage).
     */
    elementRate(elementId) {
        return this.traitsPi(Traits.ELEMENT_RATE, elementId);
    }
    /**
     * Returns the debuff success rate for a specific parameter.
     * @param paramId - The parameter index (0-7).
     * @returns The multiplicative debuff rate.
     */
    debuffRate(paramId) {
        return this.traitsPi(Traits.DEBUFF_RATE, paramId);
    }
    /**
     * Returns the state (status effect) success rate for a specific state.
     * @param stateId - The state ID to check.
     * @returns The multiplicative state rate.
     */
    stateRate(stateId) {
        return this.traitsPi(Traits.STATE_RATE, stateId);
    }
    /**
     * Returns the set of state IDs the battler is immune to.
     * @returns Array of state IDs the battler resists.
     */
    stateResistSet() {
        return this.traitsSet(Traits.STATE_RESIST);
    }
    /**
     * Checks whether the battler is immune to a specific state.
     * @param stateId - The state ID to check.
     * @returns `true` if the battler resists the state.
     */
    isStateResist(stateId) {
        return this.stateResistSet().includes(stateId);
    }
    /**
     * Returns the set of element IDs added to normal attacks.
     * @returns Array of attack element IDs.
     */
    attackElements() {
        return this.traitsSet(Traits.ATTACK_ELEMENT);
    }
    /**
     * Returns the set of state IDs that can be inflicted by normal attacks.
     * @returns Array of attack state IDs.
     */
    attackStates() {
        return this.traitsSet(Traits.ATTACK_STATE);
    }
    /**
     * Returns the rate at which a specific state is applied on normal attacks.
     * @param stateId - The state ID to check.
     * @returns The summed attack state rate.
     */
    attackStatesRate(stateId) {
        return this.traitsSum(Traits.ATTACK_STATE, stateId);
    }
    /**
     * Returns the total attack speed bonus from traits.
     * @returns The summed attack speed modifier.
     */
    attackSpeed() {
        return this.traitsSumAll(Traits.ATTACK_SPEED);
    }
    /**
     * Returns the total number of additional attacks per action (minimum 0).
     * @returns The summed attack times bonus, clamped to 0.
     */
    attackTimesAdd() {
        return Math.max(this.traitsSumAll(Traits.ATTACK_TIMES), 0);
    }
    /**
     * Returns the skill ID used for normal attacks.
     * Uses the highest attack skill ID from traits, defaulting to skill 1.
     * @returns The attack skill ID.
     */
    attackSkillId() {
        const set = this.traitsSet(Traits.ATTACK_SKILL);
        return set.length > 0 ? Math.max(...set) : 1;
    }
    /**
     * Returns the set of skill type IDs added to the battler's usable skill types.
     * @returns Array of added skill type IDs.
     */
    addedSkillTypes() {
        return this.traitsSet(Traits.STYPE_ADD);
    }
    /**
     * Checks whether a skill type is sealed (cannot be used).
     * @param stypeId - The skill type ID to check.
     * @returns `true` if the skill type is sealed.
     */
    isSkillTypeSealed(stypeId) {
        return this.traitsSet(Traits.STYPE_SEAL).includes(stypeId);
    }
    /**
     * Returns the set of skill type IDs added to the battler's usable skill types.
     * @returns Array of added skill type IDs.
     */
    addedSkills() {
        return this.traitsSet(Traits.SKILL_ADD);
    }
    /**
     * Checks whether a specific skill is sealed (cannot be used).
     * @param skillId - The skill ID to check.
     * @returns `true` if the skill is sealed.
     */
    isSkillSealed(skillId) {
        return this.traitsSet(Traits.SKILL_SEAL).includes(skillId);
    }
    /**
     * Checks whether the battler can equip a specific weapon type.
     * @param wtypeId - The weapon type ID to check.
     * @returns `true` if the weapon type is allowed.
     */
    isEquipWtypeOk(wtypeId) {
        return this.traitsSet(Traits.EQUIP_WTYPE).includes(wtypeId);
    }
    /**
     * Checks whether the battler can equip a specific armor type.
     * @param atypeId - The armor type ID to check.
     * @returns `true` if the armor type is allowed.
     */
    isEquipAtypeOk(atypeId) {
        return this.traitsSet(Traits.EQUIP_ATYPE).includes(atypeId);
    }
    /**
     * Checks whether an equipment slot type is locked (cannot be changed).
     * @param etypeId - The equipment type ID to check.
     * @returns `true` if the slot is locked.
     */
    isEquipTypeLocked(etypeId) {
        return this.traitsSet(Traits.EQUIP_LOCK).includes(etypeId);
    }
    /**
     * Checks whether an equipment slot type is sealed (cannot be equipped).
     * @param etypeId - The equipment type ID to check.
     * @returns `true` if the slot is sealed.
     */
    isEquipTypeSealed(etypeId) {
        return this.traitsSet(Traits.EQUIP_SEAL).includes(etypeId);
    }
    /**
     * Returns the battler's equipment slot type.
     * Uses the highest slot type value from traits, defaulting to 0 (normal).
     * @returns The slot type (0 = normal, 1 = dual wield).
     */
    slotType() {
        const set = this.traitsSet(Traits.SLOT_TYPE);
        return set.length > 0 ? Math.max(...set) : 0;
    }
    /**
     * Checks whether the battler is in dual wield mode (slot type 1).
     * @returns `true` if dual wielding.
     */
    isDualWield() {
        return this.slotType() === 1;
    }
    /**
     * Returns the set of extra action chance values from traits.
     * Used to determine the probability of performing additional actions.
     * @returns Array of action plus values.
     */
    actionPlusSet() {
        return this.traits(Traits.ACTION_PLUS).map(trait => trait.value);
    }
    /**
     * Checks whether a special flag is active on the battler.
     * @param flagId - The flag ID to check (see {@link FlagId}).
     * @returns `true` if the flag is active.
     */
    specialFlag(flagId) {
        return this.traits(Traits.SPECIAL_FLAG).some(trait => trait.dataId === flagId);
    }
    /**
     * Returns the battler's collapse (death) animation type.
     * Uses the highest collapse type value from traits, defaulting to 0.
     * @returns The collapse type ID.
     */
    collapseType() {
        const set = this.traitsSet(Traits.COLLAPSE_TYPE);
        return set.length > 0 ? Math.max(...set) : 0;
    }
    /**
     * Checks whether the battler has a specific party ability active.
     * @param abilityId - The party ability ID to check.
     * @returns `true` if the party ability is active.
     */
    partyAbility(abilityId) {
        return this.traits(Traits.PARTY_ABILITY).some(trait => trait.dataId === abilityId);
    }
    /**
     * Checks whether the battler is in auto-battle mode.
     * @returns `true` if the auto-battle flag is active.
     */
    isAutoBattle() {
        return this.specialFlag(FlagId.AUTO_BATTLE);
    }
    /**
     * Checks whether the battler is currently guarding.
     * Requires both the guard flag and the ability to move.
     * @returns `true` if the battler is guarding.
     */
    isGuard() {
        return this.specialFlag(FlagId.GUARD) && this.canMove();
    }
    /**
     * Checks whether the battler can substitute for low-HP allies.
     * Requires both the substitute flag and the ability to move.
     * @returns `true` if the battler can substitute.
     */
    isSubstitute() {
        return (this.specialFlag(FlagId.SUBSTITUTE) && this.canMove());
    }
    /**
     * Checks whether the battler retains TP between battles.
     * @returns `true` if the preserve TP flag is active.
     */
    isPreserveTp() {
        return this.specialFlag(FlagId.PRESERVE_TP);
    }
    /**
     * Adds a flat bonus to a parameter and refreshes the battler.
     * @param paramId - The parameter index (0-7).
     * @param value - The value to add to the parameter bonus.
     */
    addParam(paramId, value) {
        this._paramPlus[paramId] += value;
        this.refresh();
    }
    /**
     * Sets the battler's HP and triggers a refresh.
     * @param hp - The new HP value.
     */
    setHp(hp) {
        this._hp = hp;
        this.refresh();
    }
    /**
     * Sets the battler's MP and triggers a refresh.
     * @param hp - The new MP value.
     */
    setMp(hp) {
        this._mp = hp;
        this.refresh();
    }
    /**
     * Sets the battler's TP and triggers a refresh.
     * @param hp - The new TP value.
     */
    setTp(hp) {
        this._tp = hp;
        this.refresh();
    }
    /**
     * Returns the maximum TP value.
     * @returns Always 100 in the base class.
     */
    maxTp() {
        return 100;
    }
    /**
     * Refreshes the battler's stats, removing resisted states and clamping HP/MP/TP.
     */
    refresh() {
        for (const stateId of this.stateResistSet()) {
            this.eraseState(stateId);
        }
        this._hp = this._hp.clamp(0, this.mhp);
        this._mp = this._mp.clamp(0, this.mmp);
        this._tp = this._tp.clamp(0, this.maxTp());
    }
    /**
     * Fully recovers the battler by clearing all states and restoring HP/MP to maximum.
     */
    recoverAll() {
        this.clearStates();
        this._hp = this.mhp;
        this._mp = this.mmp;
    }
    /**
     * Returns the battler's current HP as a ratio of max HP.
     * @returns A value between 0.0 and 1.0.
     */
    hpRate() {
        return this.hp / this.mhp;
    }
    /**
     * Returns the battler's current MP as a ratio of max MP.
     * Returns 0 if max MP is 0 to avoid division by zero.
     * @returns A value between 0.0 and 1.0.
     */
    mpRate() {
        return this.mmp > 0 ? this.mp / this.mmp : 0;
    }
    /**
     * Returns the battler's current TP as a ratio of max TP.
     * @returns A value between 0.0 and 1.0.
     */
    tpRate() {
        return this.tp / this.maxTp();
    }
    /**
     * Hides the battler, removing them from battle display and targeting.
     */
    hide() {
        this._hidden = true;
    }
    /**
     * Makes the battler visible and targetable again.
     */
    appear() {
        this._hidden = false;
    }
    /**
     * Checks whether the battler is currently hidden.
     * @returns `true` if the battler is hidden.
     */
    isHidden() {
        return this._hidden;
    }
    /**
     * Checks whether the battler is currently visible (not hidden).
     * @returns `true` if the battler is visible.
     */
    isAppeared() {
        return !this.isHidden();
    }
    /**
     * Checks whether the battler is dead (visible and in the death state).
     * @returns `true` if the battler is dead.
     */
    isDead() {
        return this.isAppeared() && this.isDeathStateAffected();
    }
    /**
     * Checks whether the battler is alive (visible and not in the death state).
     * @returns `true` if the battler is alive.
     */
    isAlive() {
        return this.isAppeared() && !this.isDeathStateAffected();
    }
    /**
     * Checks whether the battler is in a critical HP state (below 25% max HP).
     * @returns `true` if the battler is alive and HP is below 25% of max.
     * @todo Consider making the threshold configurable via JSON.
     */
    isDying() {
        return this.isAlive() && this._hp < this.mhp / 4; // TODO : maybe allow some rate to be edited via json
    }
    /**
     * Checks whether the battler is restricted (cannot act freely).
     * @returns `true` if the battler is visible and has a restriction level > 0.
     */
    isRestricted() {
        return this.isAppeared() && this.restriction() > 0;
    }
    /**
     * Checks whether the battler can input commands (actor only, not restricted or auto-battling).
     * @returns `true` if the battler can receive player input.
     */
    canInput() {
        return this.isAppeared() && this.isActor() &&
            !this.isRestricted() && !this.isAutoBattle();
    }
    /**
     * Checks whether the battler can move (restriction level below 4).
     * @returns `true` if the battler can perform actions.
     */
    canMove() {
        return this.isAppeared() && this.restriction() < 4;
    }
    /**
     * Checks whether the battler is confused (restriction level 1-3).
     * @returns `true` if the battler is confused.
     */
    isConfused() {
        return (this.isAppeared() && this.restriction() >= 1 && this.restriction() <= 3);
    }
    /**
     * Returns the battler's confusion level.
     * @returns The restriction level if confused, otherwise 0.
     */
    confusionLevel() {
        return this.isConfused() ? this.restriction() : 0;
    }
    /**
     * Checks whether this battler is an actor.
     * Always returns `false` in the base class; overridden by `GameActor`.
     * @returns `false` by default.
     */
    isActor() {
        return false;
    }
    /**
     * Checks whether this battler is an enemy.
     * Always returns `false` in the base class; overridden by `GameEnemy`.
     * @returns `false` by default.
     */
    isEnemy() {
        return false;
    }
    /**
     * Sorts the active states by priority (descending), then by ID (ascending) as a tiebreaker.
     */
    sortStates() {
        this._states.sort((a, b) => {
            const p1 = $dataStates[a].priority;
            const p2 = $dataStates[b].priority;
            if (p1 !== p2) {
                return p2 - p1;
            }
            return a - b;
        });
    }
    /**
     * Returns the highest restriction level from all active states.
     * @returns The maximum restriction level (0 if no states restrict movement).
     */
    restriction() {
        const restrictions = this.states().map(state => state.restriction);
        return Math.max(0, ...restrictions);
    }
    /**
     * Adds a new state to the battler, triggering death if it's the death state,
     * and firing {@link onRestrict} if the battler becomes restricted.
     * @param stateId - The ID of the state to add.
     */
    addNewState(stateId) {
        if (stateId === this.deathStateId()) {
            this.die();
        }
        const restricted = this.isRestricted();
        this._states.push(stateId);
        this.sortStates();
        if (!restricted && this.isRestricted()) {
            this.onRestrict();
        }
    }
    /**
     * Called when the battler becomes restricted.
     * Empty in the base class; intended for subclass overrides.
     */
    onRestrict() {
        // for other classes
    }
    /**
     * Returns the message text of the most important active state.
     * Iterates states in priority order and returns the first with a message3 field.
     * @returns The state message text, or an empty string if none.
     */
    mostImportantStateText() {
        for (const state of this.states()) {
            if (state.message3) {
                return state.message3;
            }
        }
        return '';
    }
    /**
     * Returns the motion index of the highest-priority active state.
     * Used to determine the battler's idle animation during battle.
     * @returns The motion index, or 0 if no states are active.
     */
    stateMotionIndex() {
        const states = this.states();
        if (states.length > 0) {
            return states[0].motion;
        }
        else {
            return 0;
        }
    }
    /**
     * Returns the overlay index of the highest-priority active state.
     * Used to display state overlay sprites on the battler.
     * @returns The overlay index, or 0 if no states are active.
     */
    stateOverlayIndex() {
        const states = this.states();
        if (states.length > 0) {
            return states[0].overlay;
        }
        else {
            return 0;
        }
    }
    /**
     * Checks whether the battler can use a specific weapon type.
     * Always returns `true` in the base class; overridden by subclasses.
     * @param _skill - The skill to check weapon type compatibility for.
     * @returns `true` by default.
     */
    isSkillWtypeOk(_skill) {
        return true;
    }
    /**
     * Calculates the MP cost of a skill after applying the MP cost rate modifier.
     * @param skill - The skill to calculate MP cost for.
     * @returns The final MP cost (floored).
     */
    skillMpCost(skill) {
        return Math.floor(skill.mpCost * this.mcr);
    }
    /**
     * Returns the TP cost of a skill.
     * @param skill - The skill to calculate TP cost for.
     * @returns The skill's TP cost.
     */
    skillTpCost(skill) {
        return skill.tpCost;
    }
    /**
     * Checks whether the battler has enough TP and MP to pay a skill's cost.
     * @param skill - The skill to check costs for.
     * @returns `true` if the battler can afford the skill.
     */
    canPaySkillCost(skill) {
        return (this._tp >= this.skillTpCost(skill) &&
            this._mp >= this.skillMpCost(skill));
    }
    /**
     * Deducts the MP and TP costs of a skill from the battler.
     * @param skill - The skill whose costs are to be paid.
     */
    paySkillCost(skill) {
        this._mp -= this.skillMpCost(skill);
        this._tp -= this.skillTpCost(skill);
    }
    /**
     * Checks whether a usable item or skill can be used based on the current occasion.
     * Occasion 0 = always, 1 = battle only, 2 = menu only.
     * @param item - The item or skill to check.
     * @returns `true` if the occasion conditions are met.
     */
    isOccasionOk(item) {
        if ($gameParty.inBattle()) {
            return item.occasion === OccasionType.ALWAYS || item.occasion === OccasionType.BATTLE_SCREEN;
        }
        else {
            return item.occasion === OccasionType.ALWAYS || item.occasion === OccasionType.MENU_SCREEN;
        }
    }
    /**
     * Checks whether the battler meets the basic conditions to use an item or skill.
     * Requires the battler to be able to move and the occasion to be valid.
     * @param item - The item or skill to check.
     * @returns `true` if the basic usability conditions are met.
     */
    meetsUsableItemConditions(item) {
        return this.canMove() && this.isOccasionOk(item);
    }
    /**
     * Checks whether the battler meets all conditions to use a skill.
     * Checks occasion, weapon type, cost, seal status, and skill type seal.
     * @param skill - The skill to check.
     * @returns `true` if all skill conditions are satisfied.
     */
    meetsSkillConditions(skill) {
        return (this.meetsUsableItemConditions(skill) &&
            this.isSkillWtypeOk(skill) &&
            this.canPaySkillCost(skill) &&
            !this.isSkillSealed(skill.id) &&
            !this.isSkillTypeSealed(skill.stypeId));
    }
    /**
     * Checks whether the battler meets all conditions to use a consumable item.
     * Requires basic usability conditions and the party to possess the item.
     * @param item - The item to check.
     * @returns `true` if the item can be used.
     */
    meetsItemConditions(item) {
        return this.meetsUsableItemConditions(item) && $gameParty.hasItem(item);
    }
    /**
     * Checks whether the battler can use a given item or skill.
     * Delegates to {@link meetsSkillConditions} or {@link meetsItemConditions} based on type.
     * @param item - The item or skill to check.
     * @returns `true` if the battler can use the item or skill, `false` if null or unknown type.
     */
    canUse(item) {
        if (!item)
            return false;
        if (DataManager.isSkill(item))
            return this.meetsSkillConditions(item);
        if (DataManager.isItem(item))
            return this.meetsItemConditions(item);
        return false;
    }
    /**
     * Checks whether the battler can equip a given piece of equipment.
     * Delegates to {@link canEquipWeapon} or {@link canEquipArmor} based on type.
     * @param item - The equipment to check.
     * @returns `true` if the battler can equip the item, `false` if null or unknown type.
     */
    canEquip(item) {
        if (!item)
            return false;
        if (DataManager.isWeapon(item))
            return this.canEquipWeapon(item);
        if (DataManager.isArmor(item))
            return this.canEquipArmor(item);
        return false;
    }
    /**
     * Checks whether the battler can equip a specific weapon.
     * Requires the weapon type to be allowed and the equipment slot to not be sealed.
     * @param item - The weapon to check.
     * @returns `true` if the weapon can be equipped.
     */
    canEquipWeapon(item) {
        return (this.isEquipWtypeOk(item.wtypeId) &&
            !this.isEquipTypeSealed(item.etypeId));
    }
    /**
     * Checks whether the battler can equip a specific armor.
     * Requires the armor type to be allowed and the equipment slot to not be sealed.
     * @param item - The armor to check.
     * @returns `true` if the armor can be equipped.
     */
    canEquipArmor(item) {
        return (this.isEquipAtypeOk(item.atypeId) &&
            !this.isEquipTypeSealed(item.etypeId));
    }
    /**
     * Returns the skill ID used for the guard action.
     * @returns Always 2 (the default guard skill ID).
     */
    guardSkillId() {
        return 2;
    }
    /**
     * Checks whether the battler can perform a normal attack.
     * @returns `true` if the attack skill can be used.
     */
    canAttack() {
        return this.canUse($dataSkills[this.attackSkillId()]);
    }
    /**
     * Checks whether the battler can perform a guard action.
     * @returns `true` if the guard skill can be used.
     */
    canGuard() {
        return this.canUse($dataSkills[this.guardSkillId()]);
    }
}

/**
 * The game object class for handling skills, items, weapons, and armor. It is
 * required because save data should not include the database object itself.
 */
class GameItem {
    constructor(...args) {
        this.initialize(...args);
    }
    /**
     * Initialize the GameItem object.
     * @param item The item object to initialize the GameItem with.
     * @param args extra arguments for plugins developers
     * @constructor
     */
    initialize(item, ...args) {
        if (item) {
            this.setObject(item);
        }
    }
    /**
     * Return whether the item is a skill or not.
     * @returns {boolean} True if the item is a skill, false otherwise.
     */
    isSkill() {
        return this._dataClass === "skill";
    }
    /**
     * Return whether the item is an item or not.
     * @returns {boolean} True if the item is an item, false otherwise.
     */
    isItem() {
        return this._dataClass === "item";
    }
    /**
     * Return whether the item is usable or not.
     * @returns {boolean} True if the item is usable, false otherwise.
     */
    isUsableItem() {
        return this.isSkill() || this.isItem();
    }
    /**
     * Return whether the item is a weapon or not.
     * @returns {boolean} True if the item is a weapon, false otherwise.
     */
    isWeapon() {
        return this._dataClass === "armor";
    }
    /**
     * Return whether the item is an armor or not.
     * @returns {boolean} True if the item is an armor, false otherwise.
     */
    isArmor() {
        return this._dataClass === "armor";
    }
    /**
     * Return whether the item is an equipable item or not.
     * @returns {boolean} True if the item is an equip item, false otherwise.
     */
    isEquipItem() {
        return this.isWeapon() || this.isArmor();
    }
    /**
    * Return whether the item is null or not.
    * @returns {boolean} True if the item is null, false otherwise.
    */
    isNull() {
        return this._dataClass === "";
    }
    /**
     * return the item id
     * @returns {number} the item id
     */
    itemId() {
        return this._itemId;
    }
    /**
     * Return the item object
     * @returns {DataGameItem} the item object
     */
    object() {
        if (this.isSkill())
            return $dataSkills[this._itemId];
        else if (this.isItem())
            return $dataItems[this._itemId];
        else if (this.isWeapon())
            return $dataWeapons[this._itemId];
        else if (this.isArmor())
            return $dataArmors[this._itemId];
        else
            return null;
    }
    /**
     * Set the item object.
     * @param item The item object to set the GameItem with.
     */
    setObject(item) {
        const data = DataManager;
        if (data.isSkill(item))
            this._dataClass = "skill";
        else if (data.isItem(item))
            this._dataClass = "item";
        else if (data.isWeapon(item))
            this._dataClass = "weapon";
        else if (data.isArmor(item))
            this._dataClass = "armor";
        else
            this._dataClass = "";
        this._itemId = item ? item.id : 0;
    }
    /**
     * Set the item object as an equipable item.
     * @param isWeapon Whether the item is a weapon or armor.
     * @param itemId The ID of the equipable item.
     */
    setEquip(isWeapon, itemId) {
        this._dataClass = isWeapon ? "weapon" : "armor";
        this._itemId = itemId;
    }
}

var ActionEffect;
(function (ActionEffect) {
    ActionEffect[ActionEffect["RECOVER_HP"] = 11] = "RECOVER_HP";
    ActionEffect[ActionEffect["RECOVER_MP"] = 12] = "RECOVER_MP";
    ActionEffect[ActionEffect["GAIN_TP"] = 13] = "GAIN_TP";
    ActionEffect[ActionEffect["ADD_STATE"] = 21] = "ADD_STATE";
    ActionEffect[ActionEffect["REMOVE_STATE"] = 22] = "REMOVE_STATE";
    ActionEffect[ActionEffect["ADD_BUFF"] = 31] = "ADD_BUFF";
    ActionEffect[ActionEffect["ADD_DEBUFF"] = 32] = "ADD_DEBUFF";
    ActionEffect[ActionEffect["REMOVE_BUFF"] = 33] = "REMOVE_BUFF";
    ActionEffect[ActionEffect["REMOVE_DEBUFF"] = 34] = "REMOVE_DEBUFF";
    ActionEffect[ActionEffect["SPECIAL"] = 41] = "SPECIAL";
    ActionEffect[ActionEffect["GROW"] = 42] = "GROW";
    ActionEffect[ActionEffect["LEARN_SKILL"] = 43] = "LEARN_SKILL";
    ActionEffect[ActionEffect["COMMON_EVENT"] = 44] = "COMMON_EVENT";
    ActionEffect[ActionEffect["SPECIAL_EFFECT_ESCAPE"] = 0] = "SPECIAL_EFFECT_ESCAPE";
})(ActionEffect || (ActionEffect = {}));
class GameAction {
    constructor(subject, forcing = false, ...args) {
        this.initialize(subject, forcing, ...args);
    }
    initialize(subject, forcing = false, ...args) {
        this._subjectActorId = 0;
        this._subjectEnemyIndex = -1;
        this._forcing = forcing || false;
        this.setSubject(subject);
        this.clear();
    }
    clear() {
        this._item = new GameItem();
        this._targetIndex = -1;
    }
    setSubject(subject) {
        if (subject.isActor()) {
            this._subjectActorId = subject.actorId;
            this._subjectEnemyIndex = -1;
            return;
        }
        if (subject.isEnemy()) {
            this._subjectEnemyIndex = subject.index();
            this._subjectActorId = 0;
            return;
        }
    }
    subject() {
        if (this._subjectActorId > 0) {
            return $gameActors.actor(this._subjectActorId);
        }
        else {
            return $gameTroop.members()[this._subjectEnemyIndex];
        }
    }
    friendsUnit() {
        return this.subject().friendsUnit();
    }
    opponentsUnit() {
        return this.subject().opponentsUnit();
    }
    setEnemyAction(action) {
        if (action) {
            this.setSkill(action.skillId);
        }
        else {
            this.clear();
        }
    }
    setAttack() {
        this.setSkill(this.subject().attackSkillId());
    }
    setGuard() {
        this.setSkill(this.subject().guardSkillId());
    }
    setSkill(skillId) {
        this._item.setObject($dataSkills[skillId]);
    }
    setItem(itemId) {
        this._item.setObject($dataItems[itemId]);
    }
    setItemObject(object) {
        this._item.setObject(object);
    }
    setTarget(targetIndex) {
        this._targetIndex = targetIndex;
    }
    item() {
        return this._item.object();
    }
    isSkill() {
        return this._item.isSkill();
    }
    isItem() {
        return this._item.isItem();
    }
    numRepeats() {
        let repeats = this.item().repeats;
        if (this.isAttack()) {
            repeats += this.subject().attackTimesAdd();
        }
        return Math.floor(repeats);
    }
    checkItemScope(list) {
        return list.includes(this.item().scope);
    }
    isForOpponent() {
        return this.checkItemScope([1, 2, 3, 4, 5, 6, 14]);
    }
    isForFriend() {
        return this.checkItemScope([7, 8, 9, 10, 11, 12, 13, 14]);
    }
    isForEveryone() {
        return this.checkItemScope([14]);
    }
    isForAliveFriend() {
        return this.checkItemScope([7, 8, 11, 14]);
    }
    isForDeadFriend() {
        return this.checkItemScope([9, 10]);
    }
    isForUser() {
        return this.checkItemScope([11]);
    }
    isForOne() {
        return this.checkItemScope([1, 3, 7, 9, 11, 12]);
    }
    isForRandom() {
        return this.checkItemScope([3, 4, 5, 6]);
    }
    isForAll() {
        return this.checkItemScope([2, 8, 10, 13, 14]);
    }
    needSelection() {
        return this.checkItemScope([1, 7, 9, 12]);
    }
    numTargets() {
        return this.isForRandom() ? this.item().scope - 2 : 0;
    }
    checkDamageType(list) {
        return list.includes(this.item().damage.type);
    }
    isHpEffect() {
        return this.checkDamageType([1, 3, 5]);
    }
    isMpEffect() {
        return this.checkDamageType([2, 4, 6]);
    }
    isDamage() {
        return this.checkDamageType([1, 2]);
    }
    isRecover() {
        return this.checkDamageType([3, 4]);
    }
    isDrain() {
        return this.checkDamageType([5, 6]);
    }
    isHpRecover() {
        return this.checkDamageType([3]);
    }
    isMpRecover() {
        return this.checkDamageType([4]);
    }
    isCertainHit() {
        return this.item().hitType === HitType.CERTAIN;
    }
    isPhysical() {
        return this.item().hitType === HitType.PHYSICAL;
    }
    isMagical() {
        return this.item().hitType === HitType.MAGICAL;
    }
    isAttack() {
        return this.item() === $dataSkills[this.subject().attackSkillId()];
    }
    isGuard() {
        return this.item() === $dataSkills[this.subject().guardSkillId()];
    }
    isMagicSkill() {
        const item = this.item();
        if (this._item.isSkill()) {
            const skill = item;
            return $dataSystem.magicSkills.includes(skill.stypeId);
        }
        return false;
    }
    decideRandomTarget() {
        let target;
        if (this.isForDeadFriend()) {
            target = this.friendsUnit().randomDeadTarget();
        }
        else if (this.isForFriend()) {
            target = this.friendsUnit().randomTarget();
        }
        else {
            target = this.opponentsUnit().randomTarget();
        }
        if (target) {
            this._targetIndex = target.index();
        }
        else {
            this.clear();
        }
    }
    setConfusion() {
        this.setAttack();
    }
    prepare() {
        if (this.subject().isConfused() && !this._forcing) {
            this.setConfusion();
        }
    }
    isValid() {
        const item = this.item();
        return (this._forcing && !!item) || this.subject().canUse(item);
    }
    speed() {
        const agi = this.subject().agi;
        let speed = agi + Math.randomInt(Math.floor(5 + agi / 4));
        if (this.item()) {
            speed += this.item().speed;
        }
        if (this.isAttack()) {
            speed += this.subject().attackSpeed();
        }
        return speed;
    }
    makeTargets() {
        const targets = [];
        if (!this._forcing && this.subject().isConfused()) {
            targets.push(this.confusionTarget());
        }
        else if (this.isForEveryone()) {
            targets.push(...this.targetsForEveryone());
        }
        else if (this.isForOpponent()) {
            targets.push(...this.targetsForOpponents());
        }
        else if (this.isForFriend()) {
            targets.push(...this.targetsForFriends());
        }
        return this.repeatTargets(targets);
    }
    repeatTargets(targets) {
        const repeatedTargets = [];
        const repeats = this.numRepeats();
        for (const target of targets) {
            if (target) {
                for (let i = 0; i < repeats; i++) {
                    repeatedTargets.push(target);
                }
            }
        }
        return repeatedTargets;
    }
    confusionTarget() {
        switch (this.subject().confusionLevel()) {
            case 1:
                return this.opponentsUnit().randomTarget();
            case 2:
                if (Math.randomInt(2) === 0) {
                    return this.opponentsUnit().randomTarget();
                }
                return this.friendsUnit().randomTarget();
            default:
                return this.friendsUnit().randomTarget();
        }
    }
    targetsForEveryone() {
        const opponentMembers = this.opponentsUnit().aliveMembers();
        const friendMembers = this.friendsUnit().aliveMembers();
        return [...opponentMembers, ...friendMembers];
    }
    targetsForOpponents() {
        const unit = this.opponentsUnit();
        if (this.isForRandom()) {
            return this.randomTargets(unit);
        }
        else {
            return this.targetsForAlive(unit);
        }
    }
    targetsForFriends() {
        const unit = this.friendsUnit();
        if (this.isForUser()) {
            return [this.subject()];
        }
        else if (this.isForDeadFriend()) {
            return this.targetsForDead(unit);
        }
        else if (this.isForAliveFriend()) {
            return this.targetsForAlive(unit);
        }
        else {
            return this.targetsForDeadAndAlive(unit);
        }
    }
    randomTargets(unit) {
        const targets = [];
        for (let i = 0; i < this.numTargets(); i++) {
            targets.push(unit.randomTarget());
        }
        return targets;
    }
    targetsForDead(unit) {
        if (this.isForOne()) {
            return [unit.smoothDeadTarget(this._targetIndex)];
        }
        else {
            return unit.deadMembers();
        }
    }
    targetsForAlive(unit) {
        if (this.isForOne()) {
            if (this._targetIndex < 0) {
                return [unit.randomTarget()];
            }
            else {
                return [unit.smoothTarget(this._targetIndex)];
            }
        }
        else {
            return unit.aliveMembers();
        }
    }
    targetsForDeadAndAlive(unit) {
        if (this.isForOne()) {
            return [unit.members()[this._targetIndex]];
        }
        else {
            return unit.members();
        }
    }
    evaluate() {
        let value = 0;
        for (const target of this.itemTargetCandidates()) {
            const targetValue = this.evaluateWithTarget(target);
            if (this.isForAll()) {
                value += targetValue;
            }
            else if (targetValue > value) {
                value = targetValue;
                this._targetIndex = target.index();
            }
        }
        value *= this.numRepeats();
        if (value > 0) {
            value += Math.random();
        }
        return value;
    }
    itemTargetCandidates() {
        if (!this.isValid()) {
            return [];
        }
        else if (this.isForOpponent()) {
            return this.opponentsUnit().aliveMembers();
        }
        else if (this.isForUser()) {
            return [this.subject()];
        }
        else if (this.isForDeadFriend()) {
            return this.friendsUnit().deadMembers();
        }
        else {
            return this.friendsUnit().aliveMembers();
        }
    }
    evaluateWithTarget(target) {
        if (this.isHpEffect()) {
            const value = this.makeDamageValue(target, false);
            if (this.isForOpponent()) {
                return value / Math.max(target.hp, 1);
            }
            else {
                const recovery = Math.min(-value, target.mhp - target.hp);
                return recovery / target.mhp;
            }
        }
    }
    testApply(target) {
        return (this.testLifeAndDeath(target) &&
            ($gameParty.inBattle() ||
                (this.isHpRecover() && target.hp < target.mhp) ||
                (this.isMpRecover() && target.mp < target.mmp) ||
                this.hasItemAnyValidEffects(target)));
    }
    testLifeAndDeath(target) {
        if (this.isForOpponent() || this.isForAliveFriend()) {
            return target.isAlive();
        }
        else if (this.isForDeadFriend()) {
            return target.isDead();
        }
        else {
            return true;
        }
    }
    hasItemAnyValidEffects(target) {
        return this.item().effects.some(effect => this.testItemEffect(target, effect));
    }
    testItemEffect(target, effect) {
        switch (effect.code) {
            case ActionEffect.RECOVER_HP:
                return target.hp < target.mhp || effect.value1 < 0 || effect.value2 < 0;
            case ActionEffect.RECOVER_MP:
                return target.mp < target.mmp || effect.value1 < 0 || effect.value2 < 0;
            case ActionEffect.ADD_STATE:
                return !target.isStateAffected(effect.dataId);
            case ActionEffect.REMOVE_STATE:
                return target.isStateAffected(effect.dataId);
            case ActionEffect.ADD_BUFF:
                return !target.isMaxBuffAffected(effect.dataId);
            case ActionEffect.ADD_DEBUFF:
                return !target.isMaxDebuffAffected(effect.dataId);
            case ActionEffect.REMOVE_BUFF:
                return target.isBuffAffected(effect.dataId);
            case ActionEffect.REMOVE_DEBUFF:
                return target.isDebuffAffected(effect.dataId);
            case ActionEffect.LEARN_SKILL:
                return target.isActor() && !target.isLearnedSkill(effect.dataId);
            default:
                return true;
        }
    }
    itemCnt(target) {
        if (this.isPhysical() && target.canMove()) {
            return target.cnt;
        }
        else {
            return 0;
        }
    }
    itemMrf(target) {
        if (this.isMagical()) {
            return target.mrf;
        }
        else {
            return 0;
        }
    }
    itemHit(_target) {
        const successRate = this.item().successRate;
        if (this.isPhysical()) {
            return successRate * 0.01 * this.subject().hit;
        }
        else {
            return successRate * 0.01;
        }
    }
    itemEva(target) {
        if (this.isPhysical()) {
            return target.eva;
        }
        else if (this.isMagical()) {
            return target.mev;
        }
        else {
            return 0;
        }
    }
    itemCri(target) {
        return this.item().damage.critical
            ? this.subject().cri * (1 - target.cev)
            : 0;
    }
    apply(target) {
        const result = target.result();
        this.subject().clearResult();
        result.clear();
        result.used = this.testApply(target);
        result.missed = result.used && Math.random() >= this.itemHit(target);
        result.evaded = !result.missed && Math.random() < this.itemEva(target);
        result.physical = this.isPhysical();
        result.drain = this.isDrain();
        if (result.isHit()) {
            if (this.item().damage.type > 0) {
                result.critical = Math.random() < this.itemCri(target);
                const value = this.makeDamageValue(target, result.critical);
                this.executeDamage(target, value);
            }
            for (const effect of this.item().effects) {
                this.applyItemEffect(target, effect);
            }
            this.applyItemUserEffect(target);
        }
        this.updateLastTarget(target);
    }
    makeDamageValue(target, critical) {
        const item = this.item();
        const baseValue = this.evalDamageFormula(target);
        let value = baseValue * this.calcElementRate(target);
        if (this.isPhysical()) {
            value *= target.pdr;
        }
        if (this.isMagical()) {
            value *= target.mdr;
        }
        if (baseValue < 0) {
            value *= target.rec;
        }
        if (critical) {
            value = this.applyCritical(value);
        }
        value = this.applyVariance(value, item.damage.variance);
        value = this.applyGuard(value, target);
        value = Math.round(value);
        return value;
    }
    evalDamageFormula(target) {
        try {
            const item = this.item();
            const a = this.subject();
            const b = target;
            //@ts-ignore
            const v = $gameVariables._data;
            const sign = [ActionEffect.RECOVER_HP, ActionEffect.RECOVER_MP].includes(item.damage.type) ? -1 : 1;
            const value = Math.max(eval(item.damage.formula), 0) * sign;
            return isNaN(value) ? 0 : value;
        }
        catch {
            return 0;
        }
    }
    calcElementRate(target) {
        if (this.item().damage.elementId < 0) {
            return this.elementsMaxRate(target, this.subject().attackElements());
        }
        else {
            return target.elementRate(this.item().damage.elementId);
        }
    }
    elementsMaxRate(target, elements) {
        if (elements.length > 0) {
            const rates = elements.map(elementId => target.elementRate(elementId));
            return Math.max(...rates);
        }
        else {
            return 1;
        }
    }
    applyCritical(damage) {
        return damage * 3;
    }
    applyVariance(damage, variance) {
        const amp = Math.floor(Math.max((Math.abs(damage) * variance) / 100, 0));
        const v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
        return damage >= 0 ? damage + v : damage - v;
    }
    applyGuard(damage, target) {
        return damage / (damage > 0 && target.isGuard() ? 2 * target.grd : 1);
    }
    executeDamage(target, value) {
        const result = target.result();
        if (value === 0) {
            result.critical = false;
        }
        if (this.isHpEffect()) {
            this.executeHpDamage(target, value);
        }
        if (this.isMpEffect()) {
            this.executeMpDamage(target, value);
        }
    }
    executeHpDamage(target, value) {
        if (this.isDrain()) {
            value = Math.min(target.hp, value);
        }
        this.makeSuccess(target);
        target.gainHp(-value);
        if (value > 0) {
            target.onDamage(value);
        }
        this.gainDrainedHp(value);
    }
    executeMpDamage(target, value) {
        if (!this.isMpRecover()) {
            value = Math.min(target.mp, value);
        }
        if (value !== 0) {
            this.makeSuccess(target);
        }
        target.gainMp(-value);
        this.gainDrainedMp(value);
    }
    gainDrainedHp(value) {
        if (this.isDrain()) {
            let gainTarget = this.subject();
            if (this._reflectionTarget) {
                gainTarget = this._reflectionTarget;
            }
            gainTarget.gainHp(value);
        }
    }
    gainDrainedMp(value) {
        if (this.isDrain()) {
            let gainTarget = this.subject();
            if (this._reflectionTarget) {
                gainTarget = this._reflectionTarget;
            }
            gainTarget.gainMp(value);
        }
    }
    applyItemEffect(target, effect) {
        switch (effect.code) {
            case ActionEffect.RECOVER_HP:
                this.itemEffectRecoverHp(target, effect);
                break;
            case ActionEffect.RECOVER_MP:
                this.itemEffectRecoverMp(target, effect);
                break;
            case ActionEffect.GAIN_TP:
                this.itemEffectGainTp(target, effect);
                break;
            case ActionEffect.ADD_STATE:
                this.itemEffectAddState(target, effect);
                break;
            case ActionEffect.REMOVE_STATE:
                this.itemEffectRemoveState(target, effect);
                break;
            case ActionEffect.ADD_BUFF:
                this.itemEffectAddBuff(target, effect);
                break;
            case ActionEffect.ADD_DEBUFF:
                this.itemEffectAddDebuff(target, effect);
                break;
            case ActionEffect.REMOVE_BUFF:
                this.itemEffectRemoveBuff(target, effect);
                break;
            case ActionEffect.REMOVE_DEBUFF:
                this.itemEffectRemoveDebuff(target, effect);
                break;
            case ActionEffect.SPECIAL:
                this.itemEffectSpecial(target, effect);
                break;
            case ActionEffect.GROW:
                this.itemEffectGrow(target, effect);
                break;
            case ActionEffect.LEARN_SKILL:
                this.itemEffectLearnSkill(target, effect);
                break;
            case ActionEffect.COMMON_EVENT:
                this.itemEffectCommonEvent(target, effect);
                break;
        }
    }
    itemEffectRecoverHp(target, effect) {
        let value = (target.mhp * effect.value1 + effect.value2) * target.rec;
        if (this.isItem()) {
            value *= this.subject().pha;
        }
        value = Math.floor(value);
        if (value !== 0) {
            target.gainHp(value);
            this.makeSuccess(target);
        }
    }
    itemEffectRecoverMp(target, effect) {
        let value = (target.mmp * effect.value1 + effect.value2) * target.rec;
        if (this.isItem()) {
            value *= this.subject().pha;
        }
        value = Math.floor(value);
        if (value !== 0) {
            target.gainMp(value);
            this.makeSuccess(target);
        }
    }
    itemEffectGainTp(target, effect) {
        let value = Math.floor(effect.value1);
        if (value !== 0) {
            target.gainTp(value);
            this.makeSuccess(target);
        }
    }
    itemEffectAddState(target, effect) {
        if (effect.dataId === 0) {
            this.itemEffectAddAttackState(target, effect);
        }
        else {
            this.itemEffectAddNormalState(target, effect);
        }
    }
    itemEffectAddAttackState(target, effect) {
        for (const stateId of this.subject().attackStates()) {
            let chance = effect.value1;
            chance *= target.stateRate(stateId);
            chance *= this.subject().attackStatesRate(stateId);
            chance *= this.lukEffectRate(target);
            if (Math.random() < chance) {
                target.addState(stateId);
                this.makeSuccess(target);
            }
        }
    }
    itemEffectAddNormalState(target, effect) {
        let chance = effect.value1;
        if (!this.isCertainHit()) {
            chance *= target.stateRate(effect.dataId);
            chance *= this.lukEffectRate(target);
        }
        if (Math.random() < chance) {
            target.addState(effect.dataId);
            this.makeSuccess(target);
        }
    }
    itemEffectRemoveState(target, effect) {
        let chance = effect.value1;
        if (Math.random() < chance) {
            target.removeState(effect.dataId);
            this.makeSuccess(target);
        }
    }
    itemEffectAddBuff(target, effect) {
        target.addBuff(effect.dataId, effect.value1);
        this.makeSuccess(target);
    }
    itemEffectAddDebuff(target, effect) {
        let chance = target.debuffRate(effect.dataId) * this.lukEffectRate(target);
        if (Math.random() < chance) {
            target.addDebuff(effect.dataId, effect.value1);
            this.makeSuccess(target);
        }
    }
    itemEffectRemoveBuff(target, effect) {
        if (target.isBuffAffected(effect.dataId)) {
            target.removeBuff(effect.dataId);
            this.makeSuccess(target);
        }
    }
    itemEffectRemoveDebuff(target, effect) {
        if (target.isDebuffAffected(effect.dataId)) {
            target.removeBuff(effect.dataId);
            this.makeSuccess(target);
        }
    }
    itemEffectSpecial(target, effect) {
        if (effect.dataId === ActionEffect.SPECIAL_EFFECT_ESCAPE) {
            target.escape();
            this.makeSuccess(target);
        }
    }
    itemEffectGrow(target, effect) {
        target.addParam(effect.dataId, Math.floor(effect.value1));
        this.makeSuccess(target);
    }
    itemEffectLearnSkill(target, effect) {
        if (target.isActor()) {
            target.learnSkill(effect.dataId);
            this.makeSuccess(target);
        }
    }
    itemEffectCommonEvent(_target, _effect) {
    }
    makeSuccess(target) {
        target.result().success = true;
    }
    applyItemUserEffect(_target) {
        const value = Math.floor(this.item().tpGain * this.subject().tcr);
        this.subject().gainSilentTp(value);
    }
    lukEffectRate(target) {
        return Math.max(1.0 + (this.subject().luk - target.luk) * 0.001, 0.0);
    }
    applyGlobal() {
        for (const effect of this.item().effects) {
            if (effect.code === ActionEffect.COMMON_EVENT) {
                $gameTemp.reserveCommonEvent(effect.dataId);
            }
        }
        this.updateLastUsed();
        this.updateLastSubject();
    }
    updateLastUsed() {
        const item = this.item();
        if (DataManager.isSkill(item)) {
            $gameTemp.setLastUsedSkillId(item.id);
        }
        else if (DataManager.isItem(item)) {
            $gameTemp.setLastUsedItemId(item.id);
        }
    }
    updateLastSubject() {
        const subject = this.subject();
        if (subject.isActor()) {
            $gameTemp.setLastSubjectActorId(subject.actorId);
            return;
        }
        if (subject.isEnemy()) {
            $gameTemp.setLastSubjectEnemyIndex(subject.index() + 1);
            return;
        }
    }
    updateLastTarget(target) {
        if (target.isActor()) {
            $gameTemp.setLastTargetActorId(target.actorId);
            return;
        }
        if (target.isEnemy()) {
            $gameTemp.setLastTargetEnemyIndex(target.index() + 1);
            return;
        }
    }
}

class GameActionResult {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this.clear();
    }
    clear() {
        this.used = false;
        this.missed = false;
        this.evaded = false;
        this.physical = false;
        this.drain = false;
        this.critical = false;
        this.success = false;
        this.hpAffected = false;
        this.hpDamage = 0;
        this.mpDamage = 0;
        this.tpDamage = 0;
        this.addedStates = [];
        this.removedStates = [];
        this.addedBuffs = [];
        this.addedDebuffs = [];
        this.removedBuffs = [];
    }
    addedStateObjects() {
        return this.addedStates.map(id => $dataStates[id]);
    }
    removedStateObjects() {
        return this.removedStates.map(id => $dataStates[id]);
    }
    isStatusAffected() {
        return (this.addedStates.length > 0 ||
            this.removedStates.length > 0 ||
            this.addedBuffs.length > 0 ||
            this.addedDebuffs.length > 0 ||
            this.removedBuffs.length > 0);
    }
    isHit() {
        return this.used && !this.missed && !this.evaded;
    }
    isStateAdded(stateId) {
        return this.addedStates.includes(stateId);
    }
    pushAddedState(stateId) {
        if (!this.isStateAdded(stateId)) {
            this.addedStates.push(stateId);
        }
    }
    isStateRemoved(stateId) {
        return this.removedStates.includes(stateId);
    }
    pushRemovedState(stateId) {
        if (!this.isStateRemoved(stateId)) {
            this.removedStates.push(stateId);
        }
    }
    isBuffAdded(paramId) {
        return this.addedBuffs.includes(paramId);
    }
    pushAddedBuff(paramId) {
        if (!this.isBuffAdded(paramId)) {
            this.addedBuffs.push(paramId);
        }
    }
    isDebuffAdded(paramId) {
        return this.addedDebuffs.includes(paramId);
    }
    pushAddedDebuff(paramId) {
        if (!this.isDebuffAdded(paramId)) {
            this.addedDebuffs.push(paramId);
        }
    }
    isBuffRemoved(paramId) {
        return this.removedBuffs.includes(paramId);
    }
    pushRemovedBuff(paramId) {
        if (!this.isBuffRemoved(paramId)) {
            this.removedBuffs.push(paramId);
        }
    }
}

class GameBattler extends GameBattlerBase {
    initMembers() {
        super.initMembers();
        this._actions = [];
        this._speed = 0;
        this._result = new GameActionResult();
        this._actionState = "";
        this._lastTargetIndex = 0;
        this._damagePopup = false;
        this._effectType = null;
        this._motionType = null;
        this._weaponImageId = 0;
        this._motionRefresh = false;
        this._selected = false;
        this._tpbState = "";
        this._tpbChargeTime = 0;
        this._tpbCastTime = 0;
        this._tpbIdleTime = 0;
        this._tpbTurnCount = 0;
        this._tpbTurnEnd = false;
    }
    clearDamagePopup() {
        this._damagePopup = false;
    }
    clearWeaponAnimation() {
        this._weaponImageId = 0;
    }
    clearEffect() {
        this._effectType = null;
    }
    clearMotion() {
        this._motionType = null;
        this._motionRefresh = false;
    }
    requestEffect(effectType) {
        this._effectType = effectType;
    }
    requestMotion(motionType) {
        this._motionType = motionType;
    }
    requestMotionRefresh() {
        this._motionRefresh = true;
    }
    cancelMotionRefresh() {
        this._motionRefresh = false;
    }
    select() {
        this._selected = true;
    }
    deselect() {
        this._selected = false;
    }
    isDamagePopupRequested() {
        return this._damagePopup;
    }
    isEffectRequested() {
        return !!this._effectType;
    }
    isMotionRequested() {
        return !!this._motionType;
    }
    isWeaponAnimationRequested() {
        return this._weaponImageId > 0;
    }
    isMotionRefreshRequested() {
        return this._motionRefresh;
    }
    isSelected() {
        return this._selected;
    }
    effectType() {
        return this._effectType;
    }
    motionType() {
        return this._motionType;
    }
    weaponImageId() {
        return this._weaponImageId;
    }
    startDamagePopup() {
        this._damagePopup = true;
    }
    shouldPopupDamage() {
        const result = this._result;
        return (result.missed ||
            result.evaded ||
            result.hpAffected ||
            result.mpDamage !== 0);
    }
    startWeaponAnimation(weaponImageId) {
        this._weaponImageId = weaponImageId;
    }
    action(index) {
        return this._actions[index];
    }
    setAction(index, action) {
        this._actions[index] = action;
    }
    numActions() {
        return this._actions.length;
    }
    clearActions() {
        this._actions = [];
    }
    result() {
        return this._result;
    }
    clearResult() {
        this._result.clear();
    }
    clearTpbChargeTime() {
        this._tpbState = "charging";
        this._tpbChargeTime = 0;
    }
    applyTpbPenalty() {
        this._tpbState = "charging";
        this._tpbChargeTime -= 1;
    }
    initTpbChargeTime(advantageous) {
        const speed = this.tpbRelativeSpeed();
        this._tpbState = "charging";
        this._tpbChargeTime = advantageous ? 1 : speed * Math.random() * 0.5;
        if (this.isRestricted()) {
            this._tpbChargeTime = 0;
        }
    }
    tpbChargeTime() {
        return this._tpbChargeTime;
    }
    startTpbCasting() {
        this._tpbState = "casting";
        this._tpbCastTime = 0;
    }
    startTpbAction() {
        this._tpbState = "acting";
    }
    isTpbCharged() {
        return this._tpbState === "charged";
    }
    isTpbReady() {
        return this._tpbState === "ready";
    }
    isTpbTimeout() {
        return this._tpbIdleTime >= 1;
    }
    updateTpb() {
        if (this.canMove()) {
            this.updateTpbChargeTime();
            this.updateTpbCastTime();
            this.updateTpbAutoBattle();
        }
        if (this.isAlive()) {
            this.updateTpbIdleTime();
        }
    }
    updateTpbChargeTime() {
        if (this._tpbState === "charging") {
            this._tpbChargeTime += this.tpbAcceleration();
            if (this._tpbChargeTime >= 1) {
                this._tpbChargeTime = 1;
                this.onTpbCharged();
            }
        }
    }
    updateTpbCastTime() {
        if (this._tpbState === "casting") {
            this._tpbCastTime += this.tpbAcceleration();
            if (this._tpbCastTime >= this.tpbRequiredCastTime()) {
                this._tpbCastTime = this.tpbRequiredCastTime();
                this._tpbState = "ready";
            }
        }
    }
    updateTpbAutoBattle() {
        if (this.isTpbCharged() && !this.isTpbTurnEnd() && this.isAutoBattle()) {
            this.makeTpbActions();
        }
    }
    updateTpbIdleTime() {
        if (!this.canMove() || this.isTpbCharged()) {
            this._tpbIdleTime += this.tpbAcceleration();
        }
    }
    tpbAcceleration() {
        const speed = this.tpbRelativeSpeed();
        const referenceTime = $gameParty.tpbReferenceTime();
        return speed / referenceTime;
    }
    tpbRelativeSpeed() {
        return this.tpbSpeed() / $gameParty.tpbBaseSpeed();
    }
    tpbSpeed() {
        return Math.sqrt(this.agi) + 1;
    }
    tpbBaseSpeed() {
        const baseAgility = this.paramBasePlus(6);
        return Math.sqrt(baseAgility) + 1;
    }
    tpbRequiredCastTime() {
        const actions = this._actions.filter(action => action.isValid());
        const items = actions.map(action => action.item());
        const delay = items.reduce((r, item) => r + Math.max(0, -item.speed), 0);
        return Math.sqrt(delay) / this.tpbSpeed();
    }
    onTpbCharged() {
        if (!this.shouldDelayTpbCharge()) {
            this.finishTpbCharge();
        }
    }
    shouldDelayTpbCharge() {
        return !BattleManager.isActiveTpb() && $gameParty.canInput();
    }
    finishTpbCharge() {
        this._tpbState = "charged";
        this._tpbTurnEnd = true;
        this._tpbIdleTime = 0;
    }
    isTpbTurnEnd() {
        return this._tpbTurnEnd;
    }
    initTpbTurn() {
        this._tpbTurnEnd = false;
        this._tpbTurnCount = 0;
        this._tpbIdleTime = 0;
    }
    startTpbTurn() {
        this._tpbTurnEnd = false;
        this._tpbTurnCount++;
        this._tpbIdleTime = 0;
        if (this.numActions() === 0) {
            this.makeTpbActions();
        }
    }
    makeTpbActions() {
        this.makeActions();
        if (this.canInput()) {
            this.setActionState("undecided");
        }
        else {
            this.startTpbCasting();
            this.setActionState("waiting");
        }
    }
    onTpbTimeout() {
        this.onAllActionsEnd();
        this._tpbTurnEnd = true;
        this._tpbIdleTime = 0;
    }
    turnCount() {
        if (BattleManager.isTpb()) {
            return this._tpbTurnCount;
        }
        else {
            return $gameTroop.turnCount() + 1;
        }
    }
    canInput() {
        if (BattleManager.isTpb() && !this.isTpbCharged()) {
            return false;
        }
        return super.canInput();
    }
    refresh() {
        super.refresh();
        if (this.hp === 0) {
            this.addState(this.deathStateId());
        }
        else {
            this.removeState(this.deathStateId());
        }
    }
    addState(stateId) {
        if (this.isStateAddable(stateId)) {
            if (!this.isStateAffected(stateId)) {
                this.addNewState(stateId);
                this.refresh();
            }
            this.resetStateCounts(stateId);
            this._result.pushAddedState(stateId);
        }
    }
    isStateAddable(stateId) {
        return (this.isAlive() &&
            $dataStates[stateId] &&
            !this.isStateResist(stateId) &&
            !this.isStateRestrict(stateId));
    }
    isStateRestrict(stateId) {
        return $dataStates[stateId].removeByRestriction && this.isRestricted();
    }
    onRestrict() {
        super.onRestrict();
        this.clearTpbChargeTime();
        this.clearActions();
        for (const state of this.states()) {
            if (state.removeByRestriction) {
                this.removeState(state.id);
            }
        }
    }
    removeState(stateId) {
        if (this.isStateAffected(stateId)) {
            if (stateId === this.deathStateId()) {
                this.revive();
            }
            this.eraseState(stateId);
            this.refresh();
            this._result.pushRemovedState(stateId);
        }
    }
    escape() {
        if ($gameParty.inBattle()) {
            this.hide();
        }
        this.clearActions();
        this.clearStates();
        SoundManager.playEscape();
    }
    addBuff(paramId, turns) {
        if (this.isAlive()) {
            this.increaseBuff(paramId);
            if (this.isBuffAffected(paramId)) {
                this.overwriteBuffTurns(paramId, turns);
            }
            this._result.pushAddedBuff(paramId);
            this.refresh();
        }
    }
    addDebuff(paramId, turns) {
        if (this.isAlive()) {
            this.decreaseBuff(paramId);
            if (this.isDebuffAffected(paramId)) {
                this.overwriteBuffTurns(paramId, turns);
            }
            this._result.pushAddedDebuff(paramId);
            this.refresh();
        }
    }
    removeBuff(paramId) {
        if (this.isAlive() && this.isBuffOrDebuffAffected(paramId)) {
            this.eraseBuff(paramId);
            this._result.pushRemovedBuff(paramId);
            this.refresh();
        }
    }
    removeBattleStates() {
        for (const state of this.states()) {
            if (state.removeAtBattleEnd) {
                this.removeState(state.id);
            }
        }
    }
    removeAllBuffs() {
        for (let i = 0; i < this.buffLength(); i++) {
            this.removeBuff(i);
        }
    }
    removeStatesAuto(timing) {
        for (const state of this.states()) {
            if (this.isStateExpired(state.id) &&
                state.autoRemovalTiming === timing) {
                this.removeState(state.id);
            }
        }
    }
    removeBuffsAuto() {
        for (let i = 0; i < this.buffLength(); i++) {
            if (this.isBuffExpired(i)) {
                this.removeBuff(i);
            }
        }
    }
    removeStatesByDamage() {
        for (const state of this.states()) {
            if (state.removeByDamage &&
                Math.randomInt(100) < state.chanceByDamage) {
                this.removeState(state.id);
            }
        }
    }
    makeActionTimes() {
        const actionPlusSet = this.actionPlusSet();
        return actionPlusSet.reduce((r, p) => (Math.random() < p ? r + 1 : r), 1);
    }
    makeActions() {
        this.clearActions();
        if (this.canMove()) {
            const actionTimes = this.makeActionTimes();
            this._actions = [];
            for (let i = 0; i < actionTimes; i++) {
                this._actions.push(new GameAction(this));
            }
        }
    }
    speed() {
        return this._speed;
    }
    makeSpeed() {
        this._speed = Math.min(...this._actions.map(action => action.speed())) || 0;
    }
    currentAction() {
        return this._actions[0];
    }
    removeCurrentAction() {
        this._actions.shift();
    }
    setLastTarget(target) {
        this._lastTargetIndex = target ? target.index() : 0;
    }
    forceAction(skillId, targetIndex) {
        this.clearActions();
        const action = new GameAction(this, true);
        action.setSkill(skillId);
        if (targetIndex === -2) {
            action.setTarget(this._lastTargetIndex);
        }
        else if (targetIndex === -1) {
            action.decideRandomTarget();
        }
        else {
            action.setTarget(targetIndex);
        }
        if (action.item()) {
            this._actions.push(action);
        }
    }
    useItem(item) {
        if (DataManager.isSkill(item)) {
            this.paySkillCost(item);
        }
        else if (DataManager.isItem(item)) {
            this.consumeItem(item);
        }
    }
    consumeItem(item) {
        $gameParty.consumeItem(item);
    }
    gainHp(value) {
        this._result.hpDamage = -value;
        this._result.hpAffected = true;
        this.setHp(this.hp + value);
    }
    gainMp(value) {
        this._result.mpDamage = -value;
        this.setMp(this.mp + value);
    }
    gainTp(value) {
        this._result.tpDamage = -value;
        this.setTp(this.tp + value);
    }
    gainSilentTp(value) {
        this.setTp(this.tp + value);
    }
    initTp() {
        this.setTp(Math.randomInt(25));
    }
    clearTp() {
        this.setTp(0);
    }
    chargeTpByDamage(damageRate) {
        const value = Math.floor(50 * damageRate * this.tcr);
        this.gainSilentTp(value);
    }
    regenerateHp() {
        const minRecover = -this.maxSlipDamage();
        const value = Math.max(Math.floor(this.mhp * this.hrg), minRecover);
        if (value !== 0) {
            this.gainHp(value);
        }
    }
    maxSlipDamage() {
        return $dataSystem.optSlipDeath ? this.hp : Math.max(this.hp - 1, 0);
    }
    regenerateMp() {
        const value = Math.floor(this.mmp * this.mrg);
        if (value !== 0) {
            this.gainMp(value);
        }
    }
    regenerateTp() {
        const value = Math.floor(100 * this.trg);
        this.gainSilentTp(value);
    }
    regenerateAll() {
        if (this.isAlive()) {
            this.regenerateHp();
            this.regenerateMp();
            this.regenerateTp();
        }
    }
    onBattleStart(advantageous) {
        this.setActionState("undecided");
        this.clearMotion();
        this.initTpbChargeTime(advantageous);
        this.initTpbTurn();
        if (!this.isPreserveTp()) {
            this.initTp();
        }
    }
    onAllActionsEnd() {
        this.clearResult();
        this.removeStatesAuto(1);
        this.removeBuffsAuto();
    }
    onTurnEnd() {
        this.clearResult();
        this.regenerateAll();
        this.updateStateTurns();
        this.updateBuffTurns();
        this.removeStatesAuto(2);
    }
    onBattleEnd() {
        this.clearResult();
        this.removeBattleStates();
        this.removeAllBuffs();
        this.clearActions();
        if (!this.isPreserveTp()) {
            this.clearTp();
        }
        this.appear();
    }
    onDamage(value) {
        this.removeStatesByDamage();
        this.chargeTpByDamage(value / this.mhp);
    }
    setActionState(actionState) {
        this._actionState = actionState;
        this.requestMotionRefresh();
    }
    isUndecided() {
        return this._actionState === "undecided";
    }
    isInputting() {
        return this._actionState === "inputting";
    }
    isWaiting() {
        return this._actionState === "waiting";
    }
    isActing() {
        return this._actionState === "acting";
    }
    isChanting() {
        if (this.isWaiting()) {
            return this._actions.some(action => action.isMagicSkill());
        }
        return false;
    }
    isGuardWaiting() {
        if (this.isWaiting()) {
            return this._actions.some(action => action.isGuard());
        }
        return false;
    }
    performActionStart(action) {
        if (!action.isGuard()) {
            this.setActionState("acting");
        }
    }
    performAction(_action) {
    }
    /// mark as abstract?
    performActionEnd() { }
    performDamage() { }
    performMiss() {
        SoundManager.playMiss();
    }
    performRecovery() {
        SoundManager.playRecovery();
    }
    performEvasion() {
        SoundManager.playEvasion();
    }
    performMagicEvasion() {
        SoundManager.playMagicEvasion();
    }
    performCounter() {
        SoundManager.playEvasion();
    }
    performReflection() {
        SoundManager.playReflection();
    }
    performSubstitute(_target) {
    }
    performCollapse() {
    }
}

class TextManager {
    /**
     * the basic terms
     * @param basicId
     */
    static basic(basicId) {
        return $dataSystem.terms.basic[basicId] || "";
    }
    /**
     * the param terms
     * @param paramId
     */
    static param(paramId) {
        return $dataSystem.terms.params[paramId] || "";
    }
    /**
     * the command terms
     * @param commandId
     */
    static command(commandId) {
        return $dataSystem.terms.commands[commandId] || "";
    }
    /**
     * the message term
     * @param messageId
     */
    static message(messageId) {
        //@ts-ignore
        return $dataSystem.terms.messages[messageId] || "";
    }
    /**
     * the function that allows to get the getter
     * @param method
     * @param param
     */
    static getter(method, param) {
        return this[method](param);
    }
    get currencyUnit() {
        return $dataSystem.currencyUnit;
    }
    // Basic terms
    static get level() { return this.getter("basic", 0); }
    static get levelA() { return this.getter("basic", 1); }
    static get hp() { return this.getter("basic", 2); }
    static get hpA() { return this.getter("basic", 3); }
    static get mp() { return this.getter("basic", 4); }
    static get mpA() { return this.getter("basic", 5); }
    static get tp() { return this.getter("basic", 6); }
    static get tpA() { return this.getter("basic", 7); }
    static get exp() { return this.getter("basic", 8); }
    static get expA() { return this.getter("basic", 9); }
    // Command terms
    static get fight() { return this.getter("command", 0); }
    static get escape() { return this.getter("command", 1); }
    static get attack() { return this.getter("command", 2); }
    static get guard() { return this.getter("command", 3); }
    static get item() { return this.getter("command", 4); }
    static get skill() { return this.getter("command", 5); }
    static get equip() { return this.getter("command", 6); }
    static get status() { return this.getter("command", 7); }
    static get formation() { return this.getter("command", 8); }
    static get save() { return this.getter("command", 9); }
    static get gameEnd() { return this.getter("command", 10); }
    static get options() { return this.getter("command", 11); }
    static get weapon() { return this.getter("command", 12); }
    static get armor() { return this.getter("command", 13); }
    static get keyItem() { return this.getter("command", 14); }
    static get equip2() { return this.getter("command", 15); }
    static get optimize() { return this.getter("command", 16); }
    static get clear() { return this.getter("command", 17); }
    static get newGame() { return this.getter("command", 18); }
    static get continue_() { return this.getter("command", 19); }
    static get toTitle() { return this.getter("command", 21); }
    static get cancel() { return this.getter("command", 22); }
    static get buy() { return this.getter("command", 24); }
    static get sell() { return this.getter("command", 25); }
    // Message terms
    static get alwaysDash() { return this.getter("message", "alwaysDash"); }
    static get commandRemember() { return this.getter("message", "commandRemember"); }
    static get touchUI() { return this.getter("message", "touchUI"); }
    static get bgmVolume() { return this.getter("message", "bgmVolume"); }
    static get bgsVolume() { return this.getter("message", "bgsVolume"); }
    static get meVolume() { return this.getter("message", "meVolume"); }
    static get seVolume() { return this.getter("message", "seVolume"); }
    static get possession() { return this.getter("message", "possession"); }
    static get expTotal() { return this.getter("message", "expTotal"); }
    static get expNext() { return this.getter("message", "expNext"); }
    static get saveMessage() { return this.getter("message", "saveMessage"); }
    static get loadMessage() { return this.getter("message", "loadMessage"); }
    static get file() { return this.getter("message", "file"); }
    static get autosave() { return this.getter("message", "autosave"); }
    static get partyName() { return this.getter("message", "partyName"); }
    static get emerge() { return this.getter("message", "emerge"); }
    static get preemptive() { return this.getter("message", "preemptive"); }
    static get surprise() { return this.getter("message", "surprise"); }
    static get escapeStart() { return this.getter("message", "escapeStart"); }
    static get escapeFailure() { return this.getter("message", "escapeFailure"); }
    static get victory() { return this.getter("message", "victory"); }
    static get defeat() { return this.getter("message", "defeat"); }
    static get obtainExp() { return this.getter("message", "obtainExp"); }
    static get obtainGold() { return this.getter("message", "obtainGold"); }
    static get obtainItem() { return this.getter("message", "obtainItem"); }
    static get levelUp() { return this.getter("message", "levelUp"); }
    static get obtainSkill() { return this.getter("message", "obtainSkill"); }
    static get useItem() { return this.getter("message", "useItem"); }
    static get criticalToEnemy() { return this.getter("message", "criticalToEnemy"); }
    static get criticalToActor() { return this.getter("message", "criticalToActor"); }
    static get actorDamage() { return this.getter("message", "actorDamage"); }
    static get actorRecovery() { return this.getter("message", "actorRecovery"); }
    static get actorGain() { return this.getter("message", "actorGain"); }
    static get actorLoss() { return this.getter("message", "actorLoss"); }
    static get actorDrain() { return this.getter("message", "actorDrain"); }
    static get actorNoDamage() { return this.getter("message", "actorNoDamage"); }
    static get actorNoHit() { return this.getter("message", "actorNoHit"); }
    static get enemyDamage() { return this.getter("message", "enemyDamage"); }
    static get enemyRecovery() { return this.getter("message", "enemyRecovery"); }
    static get enemyGain() { return this.getter("message", "enemyGain"); }
    static get enemyLoss() { return this.getter("message", "enemyLoss"); }
    static get enemyDrain() { return this.getter("message", "enemyDrain"); }
    static get enemyNoDamage() { return this.getter("message", "enemyNoDamage"); }
    static get enemyNoHit() { return this.getter("message", "enemyNoHit"); }
    static get evasion() { return this.getter("message", "evasion"); }
    static get magicEvasion() { return this.getter("message", "magicEvasion"); }
    static get magicReflection() { return this.getter("message", "magicReflection"); }
    static get counterAttack() { return this.getter("message", "counterAttack"); }
    static get substitute() { return this.getter("message", "substitute"); }
    static get buffAdd() { return this.getter("message", "buffAdd"); }
    static get debuffAdd() { return this.getter("message", "debuffAdd"); }
    static get buffRemove() { return this.getter("message", "buffRemove"); }
    static get actionFailure() { return this.getter("message", "actionFailure"); }
}

class GameActor extends GameBattler {
    get level() {
        return this._level;
    }
    constructor(actorId, ...args) {
        super(...arguments);
    }
    initialize(actorId, ...args) {
        super.initialize(...args);
        this.setup(actorId);
    }
    initMembers() {
        super.initMembers();
        this._actorId = 0;
        this._name = '';
        this._nickname = '';
        this._classId = 0;
        this._level = 0;
        this._characterName = '';
        this._characterIndex = 0;
        this._faceName = '';
        this._faceIndex = 0;
        this._battlerName = '';
        this._exp = {};
        this._skills = [];
        this._equips = [];
        this._actionInputIndex = 0;
        this._lastMenuSkill = new GameItem();
        this._lastBattleSkill = new GameItem();
        this._lastCommandSymbol = '';
        this._stateSteps = new Map();
    }
    setup(actorId) {
        const actor = $dataActors[actorId];
        this._actorId = actorId;
        this._name = actor.name;
        this._nickname = actor.nickname;
        this._profile = actor.profile;
        this._classId = actor.classId;
        this._level = actor.initialLevel;
        this.initImages();
        this.initExp();
        this.initSkills();
        this.initEquips(actor.equips);
        this.clearParamPlus();
        this.recoverAll();
    }
    get actorId() {
        return this._actorId;
    }
    get actor() {
        return $dataActors[this._actorId];
    }
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
    }
    get nickname() {
        return this._nickname;
    }
    set nickname(newNickname) {
        this._nickname = newNickname;
    }
    get profile() {
        return this._profile;
    }
    set profile(newProfile) {
        this._profile = newProfile;
    }
    get characterName() {
        return this._characterName;
    }
    get characterIndex() {
        return this._characterIndex;
    }
    get faceName() {
        return this._faceName;
    }
    get faceIndex() {
        return this._faceIndex;
    }
    get battlerName() {
        return this._battlerName;
    }
    clearStates() {
        super.clearStates();
        this._stateSteps.clear();
    }
    eraseState(stateId) {
        super.eraseState(stateId);
        this._stateSteps.delete(stateId);
    }
    resetStateCounts(stateId) {
        super.resetStateCounts(stateId);
        const steps = $dataStates[stateId].stepsToRemove;
        this._stateSteps.set(stateId, steps);
    }
    initImages() {
        const actor = this.actor;
        this._characterName = actor.characterName;
        this._characterIndex = actor.characterIndex;
        this._faceName = actor.faceName;
        this._faceIndex = actor.faceIndex;
        this._battlerName = actor.battlerName;
    }
    expForLevel(level) {
        const c = this.currentClass();
        const basis = c.expParams[0];
        const extra = c.expParams[1];
        const acc_a = c.expParams[2];
        const acc_b = c.expParams[3];
        return Math.round((basis * Math.pow(level - 1, 0.9 + acc_a / 250) * level * (level + 1)) /
            (6 + Math.pow(level, 2) / 50 / acc_b) +
            (level - 1) * extra);
    }
    initExp() {
        this._exp[this._classId] = this.currentLevelExp();
    }
    currentExp() {
        return this._exp[this._classId];
    }
    currentLevelExp() {
        return this.expForLevel(this._level);
    }
    nextLevelExp() {
        return this.expForLevel(this._level + 1);
    }
    nextRequiredExp() {
        return this.nextLevelExp() - this.currentExp();
    }
    maxLevel() {
        return this.actor.maxLevel;
    }
    isMaxLevel() {
        return this._level >= this.maxLevel();
    }
    initSkills() {
        this._skills = [];
        for (const learning of this.currentClass().learnings) {
            if (learning.level <= this._level) {
                this.learnSkill(learning.skillId);
            }
        }
    }
    initEquips(equips) {
        const slots = this.equipSlots();
        const maxSlots = slots.length;
        this._equips = [];
        for (let i = 0; i < maxSlots; i++) {
            this._equips[i] = new GameItem();
        }
        for (let j = 0; j < equips.length; j++) {
            if (j < maxSlots) {
                this._equips[j].setEquip(slots[j] === 1, equips[j]);
            }
        }
        this.releaseUnequippableItems(true);
        this.refresh();
    }
    equipSlots() {
        const slots = [];
        for (let i = 1; i < $dataSystem.equipTypes.length; i++) {
            slots.push(i);
        }
        if (slots.length >= 2 && this.isDualWield()) {
            slots[1] = 1;
        }
        return slots;
    }
    equips() {
        return this._equips.map(item => item.object());
    }
    weapons() {
        return this.equips().filter(item => item && DataManager.isWeapon(item));
    }
    armors() {
        return this.equips().filter(item => item && DataManager.isArmor(item));
    }
    hasWeapon(weapon) {
        return this.weapons().includes(weapon);
    }
    hasArmor(armor) {
        return this.armors().includes(armor);
    }
    isEquipChangeOk(slotId) {
        return (!this.isEquipTypeLocked(this.equipSlots()[slotId]) &&
            !this.isEquipTypeSealed(this.equipSlots()[slotId]));
    }
    changeEquip(slotId, item) {
        if (this.tradeItemWithParty(item, this.equips()[slotId]) &&
            (!item || this.equipSlots()[slotId] === item.etypeId)) {
            this._equips[slotId].setObject(item);
            this.refresh();
        }
    }
    forceChangeEquip(slotId, item) {
        this._equips[slotId].setObject(item);
        this.releaseUnequippableItems(true);
        this.refresh();
    }
    tradeItemWithParty(newItem, oldItem) {
        if (newItem && !$gameParty.hasItem(newItem)) {
            return false;
        }
        else {
            $gameParty.gainItem(oldItem, 1);
            $gameParty.loseItem(newItem, 1);
            return true;
        }
    }
    changeEquipById(etypeId, itemId) {
        const slotId = etypeId - 1;
        if (this.equipSlots()[slotId] === 1) {
            this.changeEquip(slotId, $dataWeapons[itemId]);
        }
        else {
            this.changeEquip(slotId, $dataArmors[itemId]);
        }
    }
    isEquipped(item) {
        return this.equips().includes(item);
    }
    discardEquip(item) {
        const slotId = this.equips().indexOf(item);
        if (slotId >= 0) {
            this._equips[slotId].setObject(null);
        }
    }
    releaseUnequippableItems(forcing) {
        for (;;) {
            const slots = this.equipSlots();
            const equips = this.equips();
            let changed = false;
            for (let i = 0; i < equips.length; i++) {
                const item = equips[i];
                if (item && (!this.canEquip(item) || item.etypeId !== slots[i])) {
                    if (!forcing) {
                        this.tradeItemWithParty(null, item);
                    }
                    this._equips[i].setObject(null);
                    changed = true;
                }
            }
            if (!changed) {
                break;
            }
        }
    }
    clearEquipments() {
        const maxSlots = this.equipSlots().length;
        for (let i = 0; i < maxSlots; i++) {
            if (this.isEquipChangeOk(i)) {
                this.changeEquip(i, null);
            }
        }
    }
    optimizeEquipments() {
        const maxSlots = this.equipSlots().length;
        this.clearEquipments();
        for (let i = 0; i < maxSlots; i++) {
            if (this.isEquipChangeOk(i)) {
                this.changeEquip(i, this.bestEquipItem(i));
            }
        }
    }
    bestEquipItem(slotId) {
        const etypeId = this.equipSlots()[slotId];
        const items = $gameParty
            .equipItems()
            .filter(item => item.etypeId === etypeId && this.canEquip(item));
        let bestItem = null;
        let bestPerformance = -1e3;
        for (let i = 0; i < items.length; i++) {
            const performance = this.calcEquipItemPerformance(items[i]);
            if (performance > bestPerformance) {
                bestPerformance = performance;
                bestItem = items[i];
            }
        }
        return bestItem;
    }
    calcEquipItemPerformance(item) {
        return item.params.reduce((a, b) => a + b);
    }
    isSkillWtypeOk(skill) {
        const wtypeId1 = skill.requiredWtypeId1;
        const wtypeId2 = skill.requiredWtypeId2;
        return (wtypeId1 === 0 && wtypeId2 === 0) ||
            (wtypeId1 > 0 && this.isWtypeEquipped(wtypeId1)) ||
            (wtypeId2 > 0 && this.isWtypeEquipped(wtypeId2));
    }
    isWtypeEquipped(wtypeId) {
        return this.weapons().some(weapon => weapon.wtypeId === wtypeId);
    }
    refresh() {
        this.releaseUnequippableItems(false);
        super.refresh();
    }
    hide() {
        super.hide();
        $gameTemp.requestBattleRefresh();
    }
    isActor() {
        return true;
    }
    friendsUnit() {
        return $gameParty;
    }
    opponentsUnit() {
        return $gameTroop;
    }
    index() {
        return $gameParty.members().indexOf(this);
    }
    isBattleMember() {
        return $gameParty.battleMembers().includes(this);
    }
    isFormationChangeOk() {
        return true;
    }
    currentClass() {
        return $dataClasses[this._classId];
    }
    isClass(gameClass) {
        return gameClass && this._classId === gameClass.id;
    }
    skillTypes() {
        const skillTypes = this.addedSkillTypes().sort((a, b) => a - b);
        return skillTypes.filter((x, i, self) => self.indexOf(x) === i);
    }
    skills() {
        const list = [];
        for (const id of this._skills.concat(this.addedSkills())) {
            if (!list.includes($dataSkills[id])) {
                list.push($dataSkills[id]);
            }
        }
        return list;
    }
    usableSkills() {
        return this.skills().filter(skill => this.canUse(skill));
    }
    traitObjects() {
        const objects = super.traitObjects();
        objects.push(this.actor, this.currentClass());
        for (const item of this.equips()) {
            if (item) {
                objects.push(item);
            }
        }
        return objects;
    }
    attackElements() {
        const set = super.attackElements();
        if (this.hasNoWeapons() && !set.includes(this.bareHandsElementId())) {
            set.push(this.bareHandsElementId());
        }
        return set;
    }
    hasNoWeapons() {
        return this.weapons().length === 0;
    }
    bareHandsElementId() {
        return 1;
    }
    paramBase(paramId) {
        return super.paramBase(paramId);
    }
    paramPlus(paramId) {
        let value = super.paramPlus(paramId);
        for (const item of this.equips()) {
            if (item) {
                value += item.params[paramId];
            }
        }
        return value;
    }
    attackAnimationId1() {
        if (this.hasNoWeapons()) {
            return this.bareHandsAnimationId();
        }
        else {
            const weapons = this.weapons();
            return weapons[0] ? weapons[0].animationId : 0;
        }
    }
    attackAnimationId2() {
        const weapons = this.weapons();
        return weapons[1] ? weapons[1].animationId : 0;
    }
    bareHandsAnimationId() {
        return 1;
    }
    changeExp(exp, show) {
        this._exp[this._classId] = Math.max(exp, 0);
        const lastLevel = this._level;
        const lastSkills = this.skills();
        while (!this.isMaxLevel() && this.currentExp() >= this.nextLevelExp()) {
            this.levelUp();
        }
        while (this.currentExp() < this.currentLevelExp()) {
            this.levelDown();
        }
        if (show && this._level > lastLevel) {
            this.displayLevelUp(this.findNewSkills(lastSkills));
        }
        this.refresh();
    }
    levelUp() {
        this._level++;
        for (const learning of this.currentClass().learnings) {
            if (learning.level === this._level) {
                this.learnSkill(learning.skillId);
            }
        }
    }
    levelDown() {
        this._level--;
    }
    findNewSkills(lastSkills) {
        const newSkills = this.skills();
        for (const lastSkill of lastSkills) {
            newSkills.remove(lastSkill);
        }
        return newSkills;
    }
    displayLevelUp(newSkills) {
        const text = TextManager.levelUp.format(this._name, TextManager.level, this._level);
        $gameMessage.newPage();
        $gameMessage.add(text);
        for (const skill of newSkills) {
            $gameMessage.add(TextManager.obtainSkill.format(skill.name));
        }
    }
    gainExp(exp) {
        const newExp = this.currentExp() + Math.round(exp * this.finalExpRate());
        this.changeExp(newExp, this.shouldDisplayLevelUp());
    }
    finalExpRate() {
        return this.exr * (this.isBattleMember() ? 1 : this.benchMembersExpRate());
    }
    benchMembersExpRate() {
        return $dataSystem.optExtraExp ? 1 : 0;
    }
    shouldDisplayLevelUp() {
        return true;
    }
    changeLevel(level, show) {
        level = level.clamp(1, this.maxLevel());
        this.changeExp(this.expForLevel(level), show);
    }
    learnSkill(skillId) {
        if (!this.isLearnedSkill(skillId)) {
            this._skills.push(skillId);
            this._skills.sort((a, b) => a - b);
        }
    }
    forgetSkill(skillId) {
        this._skills.remove(skillId);
    }
    isLearnedSkill(skillId) {
        return this._skills.includes(skillId);
    }
    hasSkill(skillId) {
        return this.skills().includes($dataSkills[skillId]);
    }
    changeClass(classId, keepExp) {
        if (keepExp) {
            this._exp[classId] = this.currentExp();
        }
        this._classId = classId;
        this._level = 0;
        this.changeExp(this._exp[this._classId] || 0, false);
        this.refresh();
    }
    setCharacterImage(characterName, characterIndex) {
        this._characterName = characterName;
        this._characterIndex = characterIndex;
    }
    setFaceImage(faceName, faceIndex) {
        this._faceName = faceName;
        this._faceIndex = faceIndex;
        $gameTemp.requestBattleRefresh();
    }
    setBattlerImage(battlerName) {
        this._battlerName = battlerName;
    }
    isSpriteVisible() {
        return $gameSystem.isSideView();
    }
    performActionStart(action) {
        super.performActionStart(action);
        if (action.isAttack()) {
            this.performAttack();
        }
        else if (action.isGuard()) {
            this.requestMotion("guard");
        }
        else if (action.isMagicSkill()) {
            this.requestMotion("spell");
        }
        else if (action.isSkill()) {
            this.requestMotion("skill");
        }
        else if (action.isItem()) {
            this.requestMotion("item");
        }
    }
    performActionEnd() {
        super.performActionEnd();
    }
    performAttack() {
        const weapons = this.weapons();
        const wtypeId = weapons[0] ? weapons[0].wtypeId : 0;
        const attackMotion = $dataSystem.attackMotions[wtypeId];
        if (attackMotion) {
            if (attackMotion.type === 0) {
                this.requestMotion("thrust");
            }
            else if (attackMotion.type === 1) {
                this.requestMotion("swing");
            }
            else if (attackMotion.type === 2) {
                this.requestMotion("missile");
            }
            this.startWeaponAnimation(attackMotion.weaponImageId);
        }
    }
    performDamage() {
        super.performDamage();
        if (this.isSpriteVisible()) {
            this.requestMotion("damage");
        }
        else {
            $gameScreen.startShake(5, 5, 10);
        }
        SoundManager.playActorDamage();
    }
    performEvasion() {
        super.performEvasion();
        this.requestMotion("evade");
    }
    performMagicEvasion() {
        super.performMagicEvasion();
        this.requestMotion("evade");
    }
    performCounter() {
        super.performCounter();
        this.performAttack();
    }
    performCollapse() {
        super.performCollapse();
        if ($gameParty.inBattle()) {
            SoundManager.playActorCollapse();
        }
    }
    performVictory() {
        this.setActionState("done");
        if (this.canMove()) {
            this.requestMotion("victory");
        }
    }
    performEscape() {
        if (!this.canMove())
            return;
        this.requestMotion("escape");
    }
    makeActionList() {
        const list = [];
        const attackAction = new GameAction(this);
        attackAction.setAttack();
        list.push(attackAction);
        for (const skill of this.usableSkills()) {
            const skillAction = new GameAction(this);
            skillAction.setSkill(skill.id);
            list.push(skillAction);
        }
        return list;
    }
    makeAutoBattleActions() {
        for (let i = 0; i < this.numActions(); i++) {
            const list = this.makeActionList();
            let maxValue = -Number.MAX_VALUE;
            for (const action of list) {
                const value = action.evaluate();
                if (value > maxValue) {
                    maxValue = value;
                    this.setAction(i, action);
                }
            }
        }
        this.setActionState("waiting");
    }
    makeConfusionActions() {
        for (let i = 0; i < this.numActions(); i++) {
            this.action(i).setConfusion();
        }
        this.setActionState("waiting");
    }
    makeActions() {
        super.makeActions();
        if (this.numActions() > 0) {
            this.setActionState("undecided");
        }
        else {
            this.setActionState("waiting");
        }
        if (this.isAutoBattle()) {
            this.makeAutoBattleActions();
        }
        else if (this.isConfused()) {
            this.makeConfusionActions();
        }
    }
    onPlayerWalk() {
        this.clearResult();
        this.checkFloorEffect();
        if ($gamePlayer.isNormal()) {
            this.turnEndOnMap();
            for (const state of this.states()) {
                this.updateStateSteps(state);
            }
            this.showAddedStates();
            this.showRemovedStates();
        }
    }
    updateStateSteps(state) {
        if (!state.removeByWalking)
            return;
        if (this._stateSteps.get(state.id) < 0)
            return;
        const st = this._stateSteps.set(state.id, -1);
        if (st.get(state.id) < 0) {
            this.removeState(state.id);
        }
    }
    showAddedStates() {
        for (const state of this.result().addedStateObjects()) {
            if (state.message1) {
                $gameMessage.add(state.message1.format(this._name));
            }
        }
    }
    showRemovedStates() {
        for (const state of this.result().removedStateObjects()) {
            if (state.message4) {
                $gameMessage.add(state.message4.format(this._name));
            }
        }
    }
    stepsForTurn() {
        return 20;
    }
    turnEndOnMap() {
        if ($gameParty.steps() % this.stepsForTurn() === 0) {
            this.onTurnEnd();
            if (this.result().hpDamage > 0) {
                this.performMapDamage();
            }
        }
    }
    checkFloorEffect() {
        if ($gamePlayer.isOnDamageFloor()) {
            this.executeFloorDamage();
        }
    }
    executeFloorDamage() {
        const floorDamage = Math.floor(this.basicFloorDamage() * this.fdr);
        const realDamage = Math.min(floorDamage, this.maxFloorDamage());
        this.gainHp(-realDamage);
        if (realDamage > 0) {
            this.performMapDamage();
        }
    }
    basicFloorDamage() {
        return 10;
    }
    maxFloorDamage() {
        return $dataSystem.optFloorDeath ? this.hp : Math.max(this.hp - 1, 0);
    }
    performMapDamage() {
        if (!$gameParty.inBattle()) {
            $gameScreen.startFlashForDamage();
        }
    }
    clearActions() {
        super.clearActions();
        this._actionInputIndex = 0;
    }
    inputtingAction() {
        return this.action(this._actionInputIndex);
    }
    selectNextCommand() {
        if (this._actionInputIndex < this.numActions() - 1) {
            this._actionInputIndex++;
            return true;
        }
        else {
            return false;
        }
    }
    selectPreviousCommand() {
        if (this._actionInputIndex > 0) {
            this._actionInputIndex--;
            return true;
        }
        else {
            return false;
        }
    }
    lastSkill() {
        if ($gameParty.inBattle()) {
            return this.lastBattleSkill();
        }
        else {
            return this.lastMenuSkill();
        }
    }
    lastMenuSkill() {
        return this._lastMenuSkill.object();
    }
    setLastMenuSkill(lastMenuSkill) {
        this._lastMenuSkill.setObject(lastMenuSkill);
    }
    lastBattleSkill() {
        return this._lastBattleSkill.object();
    }
    setLastBattleSkill(lastBattleSkill) {
        this._lastBattleSkill.setObject(lastBattleSkill);
    }
    lastCommandSymbol() {
        return this._lastCommandSymbol;
    }
    setLastCommandSymbol(symbol) {
        this._lastCommandSymbol = symbol;
    }
    testEscape(item) {
        return item.effects.some(effect => effect && effect.code === ActionEffect.SPECIAL_EFFECT_ESCAPE);
    }
    meetsUsableItemConditions(item) {
        if ($gameParty.inBattle()) {
            if (!BattleManager.canEscape() && this.testEscape(item)) {
                return false;
            }
        }
        return super.meetsUsableItemConditions(item);
    }
    onEscapeFailure() {
        if (BattleManager.isTpb()) {
            this.applyTpbPenalty();
        }
        this.clearActions();
        this.requestMotionRefresh();
    }
}

/**
 * The wrapper class for an actor array.
 */
class GameActors {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this._data = [];
    }
    actor(actorId) {
        if ($dataActors[actorId]) {
            if (!this._data[actorId]) {
                this._data[actorId] = new GameActor(actorId);
            }
            return this._data[actorId];
        }
        return null;
    }
}

class GameUnit {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this._inBattle = false;
    }
    inBattle() {
        return this._inBattle;
    }
    members() {
        return [];
    }
    aliveMembers() {
        return this.members().filter(member => member.isAlive());
    }
    deadMembers() {
        return this.members().filter(member => member.isDead());
    }
    movableMembers() {
        return this.members().filter(member => member.canMove());
    }
    clearActions() {
        for (const member of this.members()) {
            member.clearActions();
        }
    }
    agility() {
        const members = this.members();
        const sum = members.reduce((r, member) => r + member.agi, 0);
        return Math.max(1, sum / Math.max(1, members.length));
    }
    tgrSum() {
        return this.aliveMembers().reduce((r, member) => r + member.tgr, 0);
    }
    randomTarget() {
        let tgrRand = Math.random() * this.tgrSum();
        let target = null;
        for (const member of this.aliveMembers()) {
            tgrRand -= member.tgr;
            if (tgrRand <= 0 && !target) {
                target = member;
            }
        }
        return target;
    }
    randomDeadTarget() {
        const members = this.deadMembers();
        return members.length ? members[Math.randomInt(members.length)] : null;
    }
    smoothTarget(index) {
        const member = this.members()[Math.max(0, index)];
        return member && member.isAlive() ? member : this.aliveMembers()[0];
    }
    smoothDeadTarget(index) {
        const member = this.members()[Math.max(0, index)];
        return member && member.isDead() ? member : this.deadMembers()[0];
    }
    clearResults() {
        for (const member of this.members()) {
            member.clearResult();
        }
    }
    onBattleStart(advantageous) {
        for (const member of this.members()) {
            member.onBattleStart(advantageous);
        }
        this._inBattle = true;
    }
    onBattleEnd() {
        this._inBattle = false;
        for (const member of this.members()) {
            member.onBattleEnd();
        }
    }
    makeActions() {
        for (const member of this.members()) {
            member.makeActions();
        }
    }
    select(activeMember) {
        for (const member of this.members()) {
            if (member === activeMember) {
                member.select();
            }
            else {
                member.deselect();
            }
        }
    }
    isAllDead() {
        return this.aliveMembers().length === 0;
    }
    substituteBattler(target) {
        for (const member of this.members()) {
            if (member.isSubstitute() && member !== target) {
                return member;
            }
        }
        return null;
    }
    tpbBaseSpeed() {
        const members = this.members();
        return Math.max(...members.map(member => member.tpbBaseSpeed()));
    }
    tpbReferenceTime() {
        return BattleManager.isActiveTpb() ? 240 : 60;
    }
    updateTpb() {
        for (const member of this.members()) {
            member.updateTpb();
        }
    }
}

var PartyAbility;
(function (PartyAbility) {
    PartyAbility[PartyAbility["ENCOUNTER_HALF"] = 0] = "ENCOUNTER_HALF";
    PartyAbility[PartyAbility["ENCOUNTER_NONE"] = 1] = "ENCOUNTER_NONE";
    PartyAbility[PartyAbility["CANCEL_SURPRISE"] = 2] = "CANCEL_SURPRISE";
    PartyAbility[PartyAbility["RAISE_PREEMPTIVE"] = 3] = "RAISE_PREEMPTIVE";
    PartyAbility[PartyAbility["GOLD_DOUBLE"] = 4] = "GOLD_DOUBLE";
    PartyAbility[PartyAbility["DROP_ITEM_DOUBLE"] = 5] = "DROP_ITEM_DOUBLE";
})(PartyAbility || (PartyAbility = {}));
class GameParty extends GameUnit {
    initialize(...args) {
        super.initialize(...args);
        this._gold = 0;
        this._steps = 0;
        this._lastItem = new GameItem();
        this._menuActorId = 0;
        this._targetActorId = 0;
        this._actors = [];
        this.initAllItems();
    }
    initAllItems() {
        this._items = new Map();
        this._weapons = new Map();
        this._armors = new Map();
    }
    exists() {
        return this._actors.length > 0;
    }
    size() {
        return this.members().length;
    }
    isEmpty() {
        return this.size() === 0;
    }
    members() {
        return this.inBattle() ? this.battleMembers() : this.allMembers();
    }
    allMembers() {
        return this._actors.map(id => $gameActors.actor(id));
    }
    battleMembers() {
        return this.allBattleMembers().filter(actor => actor.isAppeared());
    }
    hiddenBattleMembers() {
        return this.allBattleMembers().filter(actor => actor.isHidden());
    }
    allBattleMembers() {
        return this.allMembers().slice(0, this.maxBattleMembers());
    }
    maxBattleMembers() {
        return 4; // TODO : add a setting directly in an json to allow this.
    }
    leader() {
        return this.battleMembers()[0];
    }
    removeInvalidMembers() {
        for (const actorId of this._actors) {
            if (!$dataActors[actorId]) {
                this._actors.remove(actorId);
            }
        }
    }
    reviveBattleMembers() {
        for (const actor of this.battleMembers()) {
            if (actor.isDead()) {
                actor.setHp(1);
            }
        }
    }
    items() {
        return [...this._items.keys()].map(id => $dataItems[id]);
    }
    weapons() {
        return [...this._weapons.keys()].map(id => $dataWeapons[id]);
    }
    armors() {
        return [...this._armors.keys()].map(id => $dataArmors[id]);
    }
    equipItems() {
        return [...this.weapons(), ...this.armors()];
    }
    allItems() {
        return [...this.items(), ...this.equipItems()];
    }
    itemContainer(item) {
        if (!item)
            return null;
        if (DataManager.isItem(item))
            return this._items;
        if (DataManager.isWeapon(item))
            return this._weapons;
        if (DataManager.isArmor(item))
            return this._armors;
        return null;
    }
    setupStartingMembers() {
        this._actors = [];
        for (const actorId of $dataSystem.partyMembers) {
            if ($gameActors.actor(actorId)) {
                this._actors.push(actorId);
            }
        }
    }
    name() {
        const numBattleMembers = this.battleMembers().length;
        if (numBattleMembers === 0) {
            return '';
        }
        else if (numBattleMembers === 1) {
            return this.leader().name;
        }
        else {
            return TextManager.partyName.format(this.leader().name);
        }
    }
    setupBattleTest() {
        this.setupBattleTestMembers();
        this.setupBattleTestItems();
    }
    setupBattleTestMembers() {
        for (const battler of $dataSystem.testBattlers) {
            const actor = $gameActors.actor(battler.actorId);
            if (actor) {
                actor.changeLevel(battler.level, false);
                actor.initEquips(battler.equips);
                actor.recoverAll();
                this.addActor(battler.actorId);
            }
        }
    }
    setupBattleTestItems() {
        for (const item of $dataItems) {
            if (item && item.name.length > 0) {
                this.gainItem(item, this.maxItems(item));
            }
        }
    }
    highestLevel() {
        return Math.max(...this.members().map(actor => actor.level));
    }
    addActor(actorId) {
        if (!this._actors.includes(actorId)) {
            this._actors.push(actorId);
            $gamePlayer.refresh();
            $gameMap.requestRefresh();
            $gameTemp.requestBattleRefresh();
            if (this.inBattle()) {
                const actor = $gameActors.actor(actorId);
                if (this.battleMembers().includes(actor)) {
                    actor.onBattleStart();
                }
            }
        }
    }
    removeActor(actorId) {
        if (this._actors.includes(actorId)) {
            const actor = $gameActors.actor(actorId);
            const wasBattleMember = this.battleMembers().includes(actor);
            this._actors.remove(actorId);
            $gamePlayer.refresh();
            $gameMap.requestRefresh();
            $gameTemp.requestBattleRefresh();
            if (this.inBattle() && wasBattleMember) {
                actor.onBattleEnd();
            }
        }
    }
    gold() {
        return this._gold;
    }
    gainGold(amount) {
        this._gold = (this._gold + amount).clamp(0, this.maxGold());
    }
    loseGold(amount) {
        this.gainGold(-amount);
    }
    maxGold() {
        return 99999999;
    }
    steps() {
        return this._steps;
    }
    increaseSteps() {
        this._steps++;
    }
    numItems(item) {
        const container = this.itemContainer(item);
        return container ? container.get(item.id) : 0;
    }
    maxItems(_item) {
        return 99;
    }
    hasMaxItems(item) {
        return this.numItems(item) >= this.maxItems(item);
    }
    hasItem(item, includeEquip) {
        if (this.numItems(item) > 0) {
            return true;
        }
        else if (includeEquip && this.isAnyMemberEquipped(item)) {
            return true;
        }
        else {
            return false;
        }
    }
    isAnyMemberEquipped(item) {
        return this.members().some(actor => actor.equips().includes(item));
    }
    gainItem(item, amount, includeEquip) {
        const container = this.itemContainer(item);
        if (container) {
            const lastNumber = this.numItems(item);
            const newNumber = lastNumber + amount;
            container.set(item.id, newNumber.clamp(0, this.maxItems(item)));
            if (container.get(item.id) === 0) {
                container.delete(item.id);
            }
            if (includeEquip && newNumber < 0) {
                this.discardMembersEquip(item, -newNumber);
            }
            $gameMap.requestRefresh();
        }
    }
    discardMembersEquip(item, amount) {
        let n = amount;
        for (const actor of this.members()) {
            while (n > 0 && actor.isEquipped(item)) {
                actor.discardEquip(item);
                n--;
            }
        }
    }
    loseItem(item, amount, includeEquip) {
        this.gainItem(item, -amount, includeEquip);
    }
    consumeItem(item) {
        if (DataManager.isItem(item) && item.consumable) {
            this.loseItem(item, 1);
        }
    }
    canUse(item) {
        return this.members().some(actor => actor.canUse(item));
    }
    canInput() {
        return this.members().some(actor => actor.canInput());
    }
    isAllDead() {
        if (super.isAllDead()) {
            return this.inBattle() || !this.isEmpty();
        }
        return false;
    }
    isEscaped() {
        return this.isAllDead() && this.hiddenBattleMembers().length > 0;
    }
    onPlayerWalk() {
        for (const actor of this.members()) {
            actor.onPlayerWalk();
        }
    }
    menuActor() {
        let actor = $gameActors.actor(this._menuActorId);
        if (!this.members().includes(actor)) {
            actor = this.members()[0];
        }
        return actor;
    }
    /// maybe make it an getter setter?
    setMenuActor(actor) {
        this._menuActorId = actor.actorId;
    }
    makeMenuActorNext() {
        let index = this.members().indexOf(this.menuActor());
        if (index >= 0) {
            index = (index + 1) % this.members().length;
            this.setMenuActor(this.members()[index]);
        }
        else {
            this.setMenuActor(this.members()[0]);
        }
    }
    makeMenuActorPrevious() {
        let index = this.members().indexOf(this.menuActor());
        if (index >= 0) {
            index = (index + this.members().length - 1) % this.members().length;
            this.setMenuActor(this.members()[index]);
        }
        else {
            this.setMenuActor(this.members()[0]);
        }
    }
    targetActor() {
        let actor = $gameActors.actor(this._targetActorId);
        if (!this.members().includes(actor)) {
            actor = this.members()[0];
        }
        return actor;
    }
    setTargetActor(actor) {
        this._targetActorId = actor.actorId;
    }
    lastItem() {
        return this._lastItem.object();
    }
    setLastItem(item) {
        this._lastItem.setObject(item);
    }
    swapOrder(index1, index2) {
        const temp = this._actors[index1];
        this._actors[index1] = this._actors[index2];
        this._actors[index2] = temp;
        $gamePlayer.refresh();
    }
    charactersForSavefile() {
        return this.battleMembers().map(actor => [
            actor.characterName,
            actor.characterIndex
        ]);
    }
    facesForSavefile() {
        return this.battleMembers().map(actor => [
            actor.faceName,
            actor.faceIndex
        ]);
    }
    partyAbility(abilityId) {
        return this.battleMembers().some(actor => actor.partyAbility(abilityId));
    }
    hasEncounterHalf() {
        return this.partyAbility(PartyAbility.ENCOUNTER_HALF);
    }
    hasEncounterNone() {
        return this.partyAbility(PartyAbility.ENCOUNTER_NONE);
    }
    hasCancelSurprise() {
        return this.partyAbility(PartyAbility.CANCEL_SURPRISE);
    }
    hasRaisePreemptive() {
        return this.partyAbility(PartyAbility.RAISE_PREEMPTIVE);
    }
    hasGoldDouble() {
        return this.partyAbility(PartyAbility.GOLD_DOUBLE);
    }
    hasDropItemDouble() {
        return this.partyAbility(PartyAbility.DROP_ITEM_DOUBLE);
    }
    ratePreemptive(troopAgi) {
        let rate = this.agility() >= troopAgi ? 0.05 : 0.03;
        if (this.hasRaisePreemptive()) {
            rate *= 4;
        }
        return rate;
    }
    performVictory() {
        for (const actor of this.members()) {
            actor.performVictory();
        }
    }
    performEscape() {
        for (const actor of this.members()) {
            actor.performEscape();
        }
    }
    removeBattleStates() {
        for (const actor of this.members()) {
            actor.removeBattleStates();
        }
    }
    requestMotionRefresh() {
        for (const actor of this.members()) {
            actor.requestMotionRefresh();
        }
    }
    onEscapeFailure() {
        for (const actor of this.members()) {
            actor.onEscapeFailure();
        }
    }
}

/**
 *  The game object class for the timer.
 *  @todo maybe implements an event emitter?
 */
class GameTimer {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this._frames = 0;
        this._working = false;
    }
    /**
     * update the timer
     * @param sceneActive - check whether the scene is active or not
     */
    update(sceneActive) {
        if (!sceneActive && this._working && this._frames < 0)
            return;
        this._frames--;
        if (this._frames === 0)
            this.onExpire();
    }
    /**
     * start the timer
     * @param count
     */
    start(count) {
        this._frames = count;
        this._working = true;
    }
    /**
     * stop the timer
     */
    stop() {
        this._working = false;
    }
    /**
     * check if the timer is currently working
     */
    isWorking() {
        return this._working;
    }
    /**
     * return the timer in seconds format
     */
    seconds() {
        return Math.floor(this._frames / 60);
    }
    /**
     * return the current timer frame
     */
    frames() {
        return this._frames;
    }
    /**
     * action executed once the timer expire
     */
    onExpire() {
        BattleManager.abort();
    }
}

class GameEnemy extends GameBattler {
    constructor(enemyId, x, y, ...args) {
        super(...arguments);
    }
    initialize(enemyId, x, y, ...args) {
        super.initialize(...args);
        this.setup(enemyId, x, y);
    }
    initMembers() {
        super.initMembers();
        this._enemyId = 0;
        this._letter = '';
        this._plural = false;
        this._screenX = 0;
        this._screenY = 0;
    }
    setup(enemyId, x, y) {
        this._enemyId = enemyId;
        this._screenX = x;
        this._screenY = y;
        this.recoverAll();
    }
    isEnemy() {
        return true;
    }
    friendsUnit() {
        return $gameTroop;
    }
    opponentsUnit() {
        return $gameParty;
    }
    index() {
        return $gameTroop.members().indexOf(this);
    }
    isBattleMember() {
        return this.index() >= 0;
    }
    get enemyId() {
        return this._enemyId;
    }
    get enemy() {
        return $dataEnemies[this._enemyId];
    }
    traitObjects() {
        return [...super.traitObjects(), this.enemy];
    }
    paramBase(paramId) {
        return this.enemy.params[paramId];
    }
    exp() {
        return this.enemy.exp;
    }
    gold() {
        return this.enemy.gold;
    }
    makeDropItems() {
        const rate = this.dropItemRate();
        return this.enemy.dropItems.reduce((r, di) => {
            if (di.kind > 0 && Math.random() * di.denominator < rate) {
                return r.concat(this.itemObject(di.kind, di.dataId));
            }
            else {
                return r;
            }
        }, []);
    }
    dropItemRate() {
        return $gameParty.hasDropItemDouble() ? 2 : 1;
    }
    itemObject(kind, dataId) {
        if (kind === DropItemKind.ITEM) {
            return $dataItems[dataId];
        }
        else if (kind === DropItemKind.WEAPON) {
            return $dataWeapons[dataId];
        }
        else if (kind === DropItemKind.ARMOR) {
            return $dataArmors[dataId];
        }
        else {
            return null;
        }
    }
    isSpriteVisible() {
        return true;
    }
    get screenX() {
        return this._screenX;
    }
    get screenY() {
        return this._screenY;
    }
    get battlerName() {
        return this.enemy.battlerName;
    }
    get battlerHue() {
        return this.enemy.battlerHue;
    }
    get originalName() {
        return this.enemy.name;
    }
    get name() {
        return this.originalName + (this._plural ? this._letter : "");
    }
    isLetterEmpty() {
        return this._letter === "";
    }
    setLetter(letter) {
        this._letter = letter;
    }
    setPlural(plural) {
        this._plural = plural;
    }
    performActionStart(action) {
        super.performActionStart(action);
        this.requestEffect("whiten");
    }
    performAction(action) {
        super.performAction(action);
    }
    performActionEnd() {
        super.performActionEnd();
    }
    performDamage() {
        super.performDamage();
        SoundManager.playEnemyDamage();
        this.requestEffect("blink");
    }
    performCollapse() {
        super.performCollapse();
        switch (this.collapseType()) {
            case CollapseType.NORMAL:
                this.requestEffect("collapse");
                SoundManager.playEnemyCollapse();
                break;
            case CollapseType.BOSS:
                this.requestEffect("bossCollapse");
                SoundManager.playBossCollapse1();
                break;
            case CollapseType.INSTANT:
                this.requestEffect("instantCollapse");
                break;
        }
    }
    transform(enemyId) {
        const name = this.originalName;
        this._enemyId = enemyId;
        if (this.originalName !== name) {
            this._letter = "";
            this._plural = false;
        }
        this.refresh();
        if (this.numActions() > 0) {
            this.makeActions();
        }
    }
    meetsCondition(action) {
        const param1 = action.conditionParam1;
        const param2 = action.conditionParam2;
        switch (action.conditionType) {
            case 1:
                return this.meetsTurnCondition(param1, param2);
            case 2:
                return this.meetsHpCondition(param1, param2);
            case 3:
                return this.meetsMpCondition(param1, param2);
            case 4:
                return this.meetsStateCondition(param1);
            case 5:
                return this.meetsPartyLevelCondition(param1);
            case 6:
                return this.meetsSwitchCondition(param1);
            default:
                return true;
        }
    }
    meetsTurnCondition(param1, param2) {
        const n = this.turnCount();
        if (param2 === 0) {
            return n === param1;
        }
        else {
            return n > 0 && n >= param1 && n % param2 === param1 % param2;
        }
    }
    meetsHpCondition(param1, param2) {
        return this.hpRate() >= param1 && this.hpRate() <= param2;
    }
    meetsMpCondition(param1, param2) {
        return this.mpRate() >= param1 && this.mpRate() <= param2;
    }
    meetsStateCondition(param) {
        return this.isStateAffected(param);
    }
    meetsPartyLevelCondition(param) {
        return $gameParty.highestLevel() >= param;
    }
    meetsSwitchCondition(param) {
        return $gameSwitches.value(param);
    }
    isActionValid(action) {
        return (this.meetsCondition(action) && this.canUse($dataSkills[action.skillId]));
    }
    selectAction(actionList, ratingZero) {
        const sum = actionList.reduce((r, a) => r + a.rating - ratingZero, 0);
        if (sum > 0) {
            let value = Math.randomInt(sum);
            for (const action of actionList) {
                value -= action.rating - ratingZero;
                if (value < 0) {
                    return action;
                }
            }
        }
        else {
            return null;
        }
    }
    selectAllActions(actionList) {
        const ratingMax = Math.max(...actionList.map(a => a.rating));
        const ratingZero = ratingMax - 3;
        actionList = actionList.filter(a => a.rating > ratingZero);
        for (let i = 0; i < this.numActions(); i++) {
            this.action(i).setEnemyAction(this.selectAction(actionList, ratingZero));
        }
    }
    makeActions() {
        super.makeActions();
        if (this.numActions() > 0) {
            const actionList = this.enemy.actions.filter(a => this.isActionValid(a));
            if (actionList.length > 0) {
                this.selectAllActions(actionList);
            }
        }
        this.setActionState("waiting");
    }
}

class GameTroop extends GameUnit {
    constructor() {
        super(...arguments);
        this.LETTER_TABLE_HALF = [
            ' A', ' B', ' C', ' D', ' E', ' F', ' G', ' H', ' I', ' J', ' K', ' L', ' M',
            ' N', ' O', ' P', ' Q', ' R', ' S', ' T', ' U', ' V', ' W', ' X', ' Y', ' Z'
        ];
        this.LETTER_TABLE_FULL = [
            'Ａ', 'Ｂ', 'Ｃ', 'Ｄ', 'Ｅ', 'Ｆ', 'Ｇ', 'Ｈ', 'Ｉ', 'Ｊ', 'Ｋ', 'Ｌ', 'Ｍ',
            'Ｎ', 'Ｏ', 'Ｐ', 'Ｑ', 'Ｒ', 'Ｓ', 'Ｔ', 'Ｕ', 'Ｖ', 'Ｗ', 'Ｘ', 'Ｙ', 'Ｚ'
        ];
    }
    initialize(...args) {
        super.initialize(...args);
        this._interpreter = new GameInterpreter();
        this.clear();
    }
    isEventRunning() {
        return this._interpreter.isRunning();
    }
    updateInterpreter() {
        this._interpreter.update();
    }
    turnCount() {
        return this._turnCount;
    }
    members() {
        return this._enemies;
    }
    clear() {
        this._interpreter.clear();
        this._troopId = 0;
        this._eventFlags = {};
        this._enemies = [];
        this._turnCount = 0;
        this._namesCount = {};
    }
    troop() {
        return $dataTroops[this._troopId];
    }
    setup(troopId) {
        this.clear();
        this._troopId = troopId;
        this._enemies = [];
        for (const member of this.troop().members) {
            if ($dataEnemies[member.enemyId]) {
                const enemyId = member.enemyId;
                const x = member.x;
                const y = member.y;
                const enemy = new GameEnemy(enemyId, x, y);
                if (member.hidden) {
                    enemy.hide();
                }
                this._enemies.push(enemy);
            }
        }
        this.makeUniqueNames();
    }
    makeUniqueNames() {
        const table = this.letterTable();
        for (const enemy of this.members()) {
            if (enemy.isAlive() && enemy.isLetterEmpty()) {
                const name = enemy.originalName;
                const n = this._namesCount[name] || 0;
                enemy.setLetter(table[n % table.length]);
                this._namesCount[name] = n + 1;
            }
        }
        this.updatePluralFlags();
    }
    updatePluralFlags() {
        for (const enemy of this.members()) {
            const name = enemy.originalName;
            if (this._namesCount[name] >= 2) {
                enemy.setPlural(true);
            }
        }
    }
    letterTable() {
        return $gameSystem.isCJK()
            ? this.LETTER_TABLE_FULL
            : this.LETTER_TABLE_HALF;
    }
    enemyNames() {
        const names = [];
        for (const enemy of this.members()) {
            const name = enemy.originalName;
            if (enemy.isAlive() && !names.includes(name)) {
                names.push(name);
            }
        }
        return names;
    }
    meetsConditions(page) {
        const c = page.conditions;
        if (!c.turnEnding &&
            !c.turnValid &&
            !c.enemyValid &&
            !c.actorValid &&
            !c.switchValid) {
            return false; // Conditions not set
        }
        if (c.turnEnding) {
            if (!BattleManager.isTurnEnd()) {
                return false;
            }
        }
        if (c.turnValid) {
            const n = this._turnCount;
            const a = c.turnA;
            const b = c.turnB;
            if (b === 0 && n !== a) {
                return false;
            }
            if (b > 0 && (n < 1 || n < a || n % b !== a % b)) {
                return false;
            }
        }
        if (c.enemyValid) {
            const enemy = $gameTroop.members()[c.enemyIndex];
            if (!enemy || enemy.hpRate() * 100 > c.enemyHp) {
                return false;
            }
        }
        if (c.actorValid) {
            const actor = $gameActors.actor(c.actorId);
            if (!actor || actor.hpRate() * 100 > c.actorHp) {
                return false;
            }
        }
        if (c.switchValid) {
            if (!$gameSwitches.value(c.switchId)) {
                return false;
            }
        }
        return true;
    }
    setupBattleEvent() {
        if (this._interpreter.isRunning())
            return;
        if (this._interpreter.setupReservedCommonEvent())
            return;
        const pages = this.troop().pages;
        const index = pages.findIndex((page, i) => this.meetsConditions(page) && !this._eventFlags[i]);
        if (index === -1)
            return;
        const page = pages[index];
        this._interpreter.setup(page.list);
        if (page.span <= 1)
            this._eventFlags[index] = true;
    }
    increaseTurn() {
        const pages = this.troop().pages;
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            if (page.span === 1) {
                this._eventFlags[i] = false;
            }
        }
        this._turnCount++;
    }
    expTotal() {
        return this.deadMembers().reduce((r, enemy) => r + enemy.exp(), 0);
    }
    goldTotal() {
        const members = this.deadMembers();
        return members.reduce((r, enemy) => r + enemy.gold(), 0) * this.goldRate();
    }
    goldRate() {
        return $gameParty.hasGoldDouble() ? 2 : 1;
    }
    makeDropItems() {
        return this.deadMembers().reduce((acc, enemy) => [...acc, ...enemy.makeDropItems()], []);
    }
    isTpbTurnEnd() {
        const members = this.members();
        const turnMax = Math.max(...members.map(member => member.turnCount()));
        return turnMax > this._turnCount;
    }
}

var MessageBackground;
(function (MessageBackground) {
    MessageBackground[MessageBackground["WINDOW"] = 0] = "WINDOW";
    MessageBackground[MessageBackground["DIM"] = 1] = "DIM";
    MessageBackground[MessageBackground["TRANSPARENT"] = 2] = "TRANSPARENT";
})(MessageBackground || (MessageBackground = {}));
var MessagePositionType;
(function (MessagePositionType) {
    MessagePositionType[MessagePositionType["TOP"] = 0] = "TOP";
    MessagePositionType[MessagePositionType["MIDDLE"] = 1] = "MIDDLE";
    MessagePositionType[MessagePositionType["BOTTOM"] = 2] = "BOTTOM";
})(MessagePositionType || (MessagePositionType = {}));
var ChoicePositionType;
(function (ChoicePositionType) {
    ChoicePositionType[ChoicePositionType["LEFT"] = 0] = "LEFT";
    ChoicePositionType[ChoicePositionType["MIDDLE"] = 1] = "MIDDLE";
    ChoicePositionType[ChoicePositionType["RIGHT"] = 2] = "RIGHT";
})(ChoicePositionType || (ChoicePositionType = {}));
/**
 * The game object class for the state of the message window that displays text
 * or selections, etc.
 */
class GameMessage {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this.clear();
    }
    clear() {
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
    get choices() {
        return this._choices;
    }
    get speakerName() {
        return this._speakerName;
    }
    get faceName() {
        return this._faceName;
    }
    get faceIndex() {
        return this._faceIndex;
    }
    get background() {
        return this._background;
    }
    get positionType() {
        return this._positionType;
    }
    get choiceDefaultType() {
        return this._choiceDefaultType;
    }
    get choiceCancelType() {
        return this._choiceCancelType;
    }
    get choiceBackground() {
        return this._choiceBackground;
    }
    get choicePositionType() {
        return this._choicePositionType;
    }
    get numInputVariableId() {
        return this._numInputVariableId;
    }
    get numInputMaxDigits() {
        return this._numInputMaxDigits;
    }
    get itemChoiceVariableId() {
        return this._itemChoiceVariableId;
    }
    get ItemChoiceItypeId() {
        return this._itemChoiceItypeId;
    }
    get scrollMode() {
        return this._scrollMode;
    }
    get scrollSpeed() {
        return this._scrollSpeed;
    }
    get scrollNoFast() {
        return this._scrollNoFast;
    }
    add(text) {
        this._texts.push(text);
    }
    setSpeakerName(speakerName) {
        this._speakerName = speakerName ? speakerName : "";
    }
    setFaceImage(faceName, faceIndex) {
        this._faceName = faceName;
        this._faceIndex = faceIndex;
    }
    setBackground(background) {
        this._background = background;
    }
    setPositionType(positionType) {
        this._positionType = positionType;
    }
    setChoice(choices, defaultType, cancelType) {
        this._choices = choices;
        this._choiceCancelType = defaultType;
        this._choiceBackground = MessageBackground.WINDOW;
    }
    setChoiceBackground(background) {
        this._choiceBackground = background;
    }
    setChoicePositionType(positionType) {
        this._choicePositionType = positionType;
    }
    setNumberInput(variableId, maxDigits) {
        this._numInputVariableId = variableId;
        this._numInputMaxDigits = maxDigits;
    }
    setItemChoice(variableId, itemType) {
        this._itemChoiceVariableId = variableId;
        this._itemChoiceItypeId = itemType;
    }
    setScroll(speed, noFast) {
        this._scrollMode = true;
        this._scrollSpeed = speed;
        this._scrollNoFast = noFast;
    }
    setChoiceCallback(callback) {
        this._choiceCallback = callback;
    }
    onChoice(n) {
        if (this._choiceCallback) {
            this._choiceCallback(n);
            this._choiceCallback = null;
        }
    }
    hasText() {
        return this._texts.length > 0;
    }
    isChoice() {
        return this._choices.length > 0;
    }
    isNumberInput() {
        return this._numInputVariableId > 0;
    }
    isItemChoice() {
        return this._itemChoiceVariableId > 0;
    }
    isBusy() {
        return (this.hasText() ||
            this.isChoice() ||
            this.isNumberInput() ||
            this.isItemChoice());
    }
    newPage() {
        if (this._texts.length > 0) {
            this._texts[this._texts.length - 1] += "\f";
        }
    }
    allText() {
        return this._texts.join("\n");
    }
    isRTL() {
        return Utils.containsArabic(this.allText());
    }
}

class GameSwitches {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this.clear();
    }
    clear() {
        this._data = [];
    }
    value(switchId) {
        return !!this._data[switchId];
    }
    setValue(switchId, value) {
        if (switchId > 0 && switchId < $dataSystem.switches.length) {
            this._data[switchId] = value;
            this.onChange();
        }
    }
    onChange() {
        $gameMap.requestRefresh();
    }
}

class GameVariables {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this.clear();
    }
    clear() {
        this._data = [];
    }
    value(variableId) {
        return this._data[variableId] || 0;
    }
    setValue(variableId, value) {
        if (variableId > 0 && variableId < $dataSystem.variables.length) {
            if (typeof value === "number") {
                value = Math.floor(value);
            }
            this._data[variableId] = value;
            this.onChange();
        }
    }
    onChange() {
        $gameMap.requestRefresh();
    }
}

class GameSelfSwitches {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this.clear();
    }
    clear() {
        this._data = {};
    }
    value(key) {
        return !!this._data[key];
    }
    setValue(key, value) {
        if (value) {
            this._data[key] = true;
        }
        else {
            delete this._data[key];
        }
        this.onChange();
    }
    onChange() {
        $gameMap.requestRefresh();
    }
}

// DATA RELATED JSON
let $dataActors = null;
let $dataClasses = null;
let $dataSkills = null;
let $dataItems = null;
let $dataWeapons = null;
let $dataArmors = null;
let $dataEnemies = null;
let $dataTroops = null;
let $dataStates = null;
let $dataAnimations = null;
let $dataTilesets = null;
let $dataCommonEvents = null;
let $dataSystem = null;
let $dataMapInfos = null;
let $dataMap = null;
// GLOBAL CLASSES
let $gameTemp = null;
let $gameSystem = null;
let $gameScreen = null;
let $gameTimer = null;
let $gameMessage = null;
let $gameSwitches = null;
let $gameVariables = null;
let $gameSelfSwitches = null;
let $gameActors = null;
let $gameParty = null;
let $gameTroop = null;
let $gameMap = null;
let $gamePlayer = null;
let $testEvent = null;
class DataManager {
    static async loadGlobalInfo() {
        this._globalInfo = await StorageManager.loadObject('global');
        this.removeInvalidGlobalInfo();
    }
    static removeInvalidGlobalInfo() {
        const globalInfo = this._globalInfo;
        for (const info of globalInfo) {
            globalInfo.indexOf(info);
        }
    }
    static async saveGlobalInfo() {
        await StorageManager.saveObject('global', this._globalInfo);
    }
    static isGlobalInfoLoaded() {
        return !!this._globalInfo;
    }
    static async loadDatabase() {
        const test = this.isBattleTest() || this.isEventTest();
        const prefix = test ? "Test_" : "";
        const loadPromises = this._databaseFiles.map(databaseFile => this.loadDataFile(databaseFile.name, prefix + databaseFile.src));
        if (this.isEventTest()) {
            loadPromises.push(this.loadDataFile("$testEvent", prefix + "Event.json"));
        }
        await Promise.all(loadPromises);
    }
    static async loadDataFile(name, src) {
        const url = 'data/' + src;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            window[name] = await response.json();
            this.onLoad(window[name]);
        }
        catch (error) {
            this.onFetchError(name, src, url);
        }
    }
    static onFetchError(name, src, url) {
        const error = { name: name, src, url };
        this._errors.push(error);
    }
    static isDatabaseLoaded() {
        this.checkForErrors();
        for (const databaseFile of this._databaseFiles) {
            if (!window[databaseFile.name]) {
                return false;
            }
        }
        return true;
    }
    static async loadMapData(mapId) {
        if (mapId > 0) {
            const filename = "Map%1.json".format(mapId.padZero(3));
            await this.loadDataFile("$dataMap", filename);
        }
        else {
            this.makeEmptyMap();
        }
    }
    static makeEmptyMap() {
        $dataMap = {};
        $dataMap.data = [];
        $dataMap.events = [];
        $dataMap.width = 100;
        $dataMap.height = 100;
        $dataMap.scrollType = 3;
    }
    static isMapLoaded() {
        this.checkForErrors();
        return !!$dataMap;
    }
    static onLoad(object) {
        if (this.isMapObject(object)) {
            this.extractMetadata(object);
            this.extractArrayMetadata(object.events);
        }
        else {
            this.extractArrayMetadata(object);
        }
    }
    static isMapObject(object) {
        return !!(object.data && object.events);
    }
    static extractArrayMetadata(array) {
        if (Array.isArray(array)) {
            for (const data of array) {
                if (data && "note" in data) {
                    this.extractMetadata(data);
                }
            }
        }
    }
    static extractMetadata(data) {
        const regExp = /<([^<>:]+)(:?)([^>]*)>/g;
        data.meta = {};
        for (;;) {
            const match = regExp.exec(data.note);
            if (match) {
                if (match[2] === ":") {
                    data.meta[match[1]] = match[3];
                }
                else {
                    data.meta[match[1]] = true;
                }
            }
            else {
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
    static isBattleTest() {
        return Utils.isOptionValid("btest");
    }
    static isEventTest() {
        return Utils.isOptionValid("etest");
    }
    static isTitleSkip() {
        return Utils.isOptionValid("tskip");
    }
    static isSkill(item) {
        return item && $dataSkills.includes(item);
    }
    static isItem(item) {
        return item && $dataItems.includes(item);
    }
    static isWeapon(item) {
        return item && $dataWeapons.includes(item);
    }
    static isArmor(item) {
        return item && $dataArmors.includes(item);
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
    static setupNewGame() {
        this.createGameObjects();
        this.selectSavefileForNewGame();
        $gameParty.setupStartingMembers();
        $gamePlayer.setupForNewGame();
        Engine.frameCount = 0;
    }
    static setupBattleTest() {
        this.createGameObjects();
        $gameParty.setupBattleTest();
        BattleManager.setup($dataSystem.testTroopId, true, false);
        BattleManager.setBattleTest(true);
        BattleManager.playBattleBgm();
    }
    static setupEventTest() {
        this.createGameObjects();
        this.selectSavefileForNewGame();
        $gameParty.setupStartingMembers();
        $gamePlayer.reserveTransfer(-1, 8, 6);
        $gamePlayer.setTransparent(false);
    }
    static isAnySavefileExists() {
        return this._globalInfo.some(x => x);
    }
    static latestSavefileId() {
        const globalInfo = this._globalInfo;
        const validInfo = globalInfo.slice(1).filter(x => x);
        const latest = Math.max(...validInfo.map(x => x.timestamp));
        const index = globalInfo.findIndex(x => x && x.timestamp === latest);
        return index > 0 ? index : 0;
    }
    static earliestSavefileId() {
        const globalInfo = this._globalInfo;
        const validInfo = globalInfo.slice(1).filter(x => x);
        const earliest = Math.min(...validInfo.map(x => x.timestamp));
        const index = globalInfo.findIndex(x => x && x.timestamp === earliest);
        return index > 0 ? index : 0;
    }
    static emptySavefileId() {
        const globalInfo = this._globalInfo;
        const maxSavefiles = this.maxSavefiles();
        if (globalInfo.length < maxSavefiles) {
            return Math.max(1, globalInfo.length);
        }
        else {
            const index = globalInfo.slice(1).findIndex(x => !x);
            return index >= 0 ? index + 1 : -1;
        }
    }
    static async loadAllSavefileImages() {
        for (const info of this._globalInfo.filter(x => x)) {
            await this.loadSavefileImages(info);
        }
    }
    static async loadSavefileImages(info) {
        if (info.characters && Symbol.iterator in info.characters) {
            for (const character of info.characters) {
                await ImageManager.loadCharacter(character[0]);
            }
        }
        if (info.faces && Symbol.iterator in info.faces) {
            for (const face of info.faces) {
                await ImageManager.loadFace(face[0]);
            }
        }
    }
    static maxSavefiles() {
        return 20; // TODO : later implement actual JSON supports for this as it should be editable by the user without plugins.
    }
    static savefileInfo(savefileId) {
        const globalInfo = this._globalInfo;
        return globalInfo[savefileId] ? globalInfo[savefileId] : null;
    }
    static savefileExists(savefileId) {
        const saveName = this.makeSaveName(savefileId);
        return StorageManager.exists(saveName);
    }
    static async saveGame(savefileId) {
        const contents = this.makeSaveContents();
        const saveName = this.makeSaveName(savefileId);
        await StorageManager.saveObject(saveName, contents);
        this._globalInfo[savefileId] = this.makeSavefileInfo();
        await this.saveGlobalInfo();
    }
    static async loadGame(savefileId) {
        const saveName = this.makeSaveName(savefileId);
        const contents = await StorageManager.loadObject(saveName);
        this.createGameObjects();
        this.extractSaveContents(contents);
        this.correctDataErrors();
    }
    static makeSaveName(savefileId) {
        return "file%1".format(savefileId);
    }
    static selectSavefileForNewGame() {
        const emptySavefileId = this.emptySavefileId();
        const earliestSavefileId = this.earliestSavefileId();
        if (emptySavefileId > 0) {
            $gameSystem.setSavefileId(emptySavefileId);
        }
        else {
            $gameSystem.setSavefileId(earliestSavefileId);
        }
    }
    static makeSavefileInfo() {
        const info = {};
        info.title = $dataSystem.gameTitle;
        info.characters = $gameParty.charactersForSavefile();
        info.faces = $gameParty.facesForSavefile();
        info.playtime = $gameSystem.playtimeText();
        info.timestamp = Date.now();
        return info;
    }
    static makeSaveContents() {
        const contents = {};
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
    static extractSaveContents(contents) {
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
    static correctDataErrors() {
        $gameParty.removeInvalidMembers();
    }
}
DataManager._globalInfo = null;
DataManager._errors = [];
DataManager._databaseFiles = [
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

/**
 * The static class that loads images, creates bitmap objects and retains them.
 */
let ImageManager$1 = class ImageManager {
    /**
     * The icon width
     */
    static get iconWidth() {
        return this.getIconSize();
    }
    /**
     * The icon height
     */
    static get iconHeight() {
        return this.getIconSize();
    }
    /**
     * the face width
     */
    static get faceWidth() {
        return this.getFaceSize();
    }
    /**
     * the face height
     */
    static get faceHeight() {
        return this.getFaceSize();
    }
    /**
     * return the icon size dynamically based on either the user input or the default one.
     */
    static getIconSize() {
        if ("iconSize" in $dataSystem) {
            return $dataSystem.iconSize;
        }
        else {
            return this.standardIconWidth;
        }
    }
    /**
     * return the face size dynamically based on either the user input or the default one.
     */
    static getFaceSize() {
        if ("faceSize" in $dataSystem) {
            return $dataSystem.faceSize;
        }
        else {
            return this.standardFaceWidth;
        }
    }
    /**
     * load animations bitmap
     * @param filename - the image name
     */
    static async loadAnimation(filename) {
        return await this.loadBitmap("img/animations/", filename);
    }
    /**
     * load battleback1 bitmap
     * @param filename - the image name
     */
    static async loadBattleback1(filename) {
        return await this.loadBitmap("img/battleback1/", filename);
    }
    /**
     * load battleback2 bitmap
     * @param filename - the image name
     */
    static async loadBattleback2(filename) {
        return await this.loadBitmap("img/battleback2/", filename);
    }
    /**
     * load enemy bitmap
     * @param filename - the image name
     */
    static async loadEnemy(filename) {
        return await this.loadBitmap("img/enemies", filename);
    }
    /**
     * load the character bitmap
     * @param filename - the image name
     */
    static async loadCharacter(filename) {
        return await this.loadBitmap("img/characters/", filename);
    }
    /**
     * load the faceset bitmap
     * @param filename - the image name
     */
    static async loadFace(filename) {
        return await this.loadBitmap("img/faces/", filename);
    }
    /**
     * load the parallax bitmap
     * @param filename - the image name
     */
    static async loadParallax(filename) {
        return await this.loadBitmap("img/parallaxes/", filename);
    }
    /**
     * load the picture bitmap
     * @param filename - the image name
     */
    static async loadPicture(filename) {
        return await this.loadBitmap("img/pictures/", filename);
    }
    /**
     * load the sideview actor bitmap
     * @param filename - the image name
     */
    static async loadSvActor(filename) {
        return await this.loadBitmap("img/sv_actors/", filename);
    }
    /**
     * load the sideview enemy bitmap
     * @param filename - the image name
     */
    static async loadSvEnemy(filename) {
        return await this.loadBitmap("img/sv_enemies/", filename);
    }
    /**
     * load the system bitmap
     * @param filename - the image name
     */
    static async loadSystem(filename) {
        return await this.loadBitmap("img/systems/", filename);
    }
    /**
     * load the tileset bitmap
     * @param filename - the image name
     */
    static async loadTileset(filename) {
        return await this.loadBitmap("img/tilesets/", filename);
    }
    /**
     * load the title1 bitmap
     * @param filename - the image name
     */
    static async loadTitle1(filename) {
        return await this.loadBitmap("img/title1/", filename);
    }
    /**
     * load the title2 bitmap
     * @param filename - the image name
     */
    static async loadTitle2(filename) {
        return await this.loadBitmap("img/title2/", filename);
    }
    /**
     * load a image and convert it into a bitmap
     * @param folder - the img directory folder
     * @param filename - the image name
     */
    static async loadBitmap(folder, filename) {
        if (filename) {
            const url = folder + Utils.encodeURI(filename) + ".png";
            return await this.loadBitmapFromUrl(url);
        }
        else {
            return this._emptyBitmap;
        }
    }
    /**
     * load the bitmap from url
     * @param url - the bitmap url
     */
    static async loadBitmapFromUrl(url) {
        const cache = url.includes("/system/") ? this._system : this._cache;
        if (!cache.has(url)) {
            const bitmap = await Bitmap.load(url);
            cache.set(url, bitmap);
        }
        return cache.get(url);
    }
    /**
     * clear the image manager cache
     */
    static clear() {
        const cache = this._cache;
        for (const bitmap of cache.values()) {
            bitmap.destroy();
        }
        this._cache.clear();
    }
    /**
     * check if all the bitmaps are done loading
     * @return {boolean} true if the bitmaps are ready
     */
    static isReady() {
        for (const cache of [this._cache, this._system]) {
            for (const [url, bitmap] of cache) {
                if (bitmap.isError()) {
                    this.throwLoadError(bitmap);
                }
                if (!bitmap.isReady()) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * throw load error
     * @param bitmap - the bitmap that erorred
     */
    static throwLoadError(bitmap) {
        const retry = bitmap.retry.bind(bitmap);
        throw ["LoadError", bitmap.url, retry];
    }
    /**
     * return whether the current image is an object character
     * @param filename - the image name
     */
    static isObjectCharacter(filename) {
        const sign = Utils.extractFileName(filename).match(/^[!$]+/);
        return sign && sign[0].includes("!");
    }
    /**
     * return whether the current image is a big character sprite
     * @param filename - the image name
     */
    static isBigCharacter(filename) {
        const sign = Utils.extractFileName(filename).match(/^[!$]+/);
        return sign && sign[0].includes("$");
    }
    /**
     * return whether the current image is a zero parallax sprite
     * @param filename - the image name
     */
    static isZeroParallax(filename) {
        return Utils.extractFileName(filename).charAt(0) === "!";
    }
};
/**
 * The default icon width
 */
ImageManager$1.standardIconWidth = 32;
/**
 * The default icon height
 */
ImageManager$1.standardIconHeight = 32;
/**
 * The default face width
 */
ImageManager$1.standardFaceWidth = 144;
/**
 * The default face height
 */
ImageManager$1.standardFaceHeight = 144;
ImageManager$1._cache = new Map();
ImageManager$1._system = new Map();
ImageManager$1._emptyBitmap = new Bitmap(1, 1);

class SceneManager {
    static async run(sceneClass) {
        try {
            this.initialize();
            this.goto(sceneClass);
            Engine.startGameLoop();
        }
        catch (err) {
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
    static update(deltaTime) {
        try {
            const n = this.determineRepeatNumber(deltaTime);
            for (let i = 0; i < n; i++) {
                this.updateMain();
            }
        }
        catch (e) {
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
        }
        else {
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
            Engine.printError("Error", event.message, event);
            AudioManager.stopAll();
        }
        catch (e) {
            //
        }
    }
    static onReject(event) {
        // Catch uncaught exception in Promise
        // @ts-ignore
        event.message = event.reason;
        // @ts-ignore
        this.onError(event);
    }
    static onUnload() {
        // @todo implement unloading
    }
    static onKeyDown(event) {
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
    static reloadGame() {
        if (Utils.isNwjs()) {
            //@ts-ignore
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
        }
        else if (e instanceof Array && e[0] === "LoadError") {
            this.catchLoadError(e);
        }
        else {
            this.catchUnknownError(e);
        }
        this.stop();
    }
    static catchNormalError(e) {
        // @ts-ignore
        Engine.printError(e.name, e.message, e);
        //@todo implement AudioManager
        // AudioManager.stopAll();
        console.error(e.stack);
    }
    static catchLoadError(e) {
        const url = e[1];
        const retry = e[2];
        Engine.printError("Failed to load", url);
        if (retry) {
            Engine.showRetryButton(() => {
                retry();
                SceneManager.resume();
            });
        }
        else {
            AudioManager.stopAll();
        }
    }
    static catchUnknownError(e) {
        Engine.printError("UnknownError", String(e));
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
        Engine.frameCount++;
    }
    static updateInputData() {
        //@todo do the input
    }
    static updateEffekseer() {
        // @todo  init effeek
    }
    static async changeScene() {
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
    static updateScene() {
        if (this._scene) {
            if (this._scene.isStarted()) {
                if (this.isGameActive()) {
                    this._scene.update();
                }
            }
            else if (this._scene.isReady()) {
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
        }
        catch (e) {
            // SecurityError
            return true;
        }
    }
    static onSceneTerminate() {
        this._previousScene = this._scene;
        this._previousClass = this._scene.constructor;
        Engine.setStage(null);
    }
    static onSceneCreate() {
        Engine.startLoading();
    }
    static onBeforeSceneStart() {
        if (this._previousScene) {
            this._previousScene.destroy();
            this._previousScene = null;
        }
        if (Engine.effekseer) ;
    }
    static onSceneStart() {
        Engine.endLoading();
        Engine.setStage(this._scene);
    }
    static isSceneChanging() {
        return this._exiting || !!this._nextScene;
    }
}
SceneManager._scene = null;
SceneManager._nextScene = null;
SceneManager._stack = new Stack();
SceneManager._previousScene = null;
SceneManager._previousClass = null;
SceneManager._backgroundBitmap = null;
SceneManager._smoothDeltaTime = 1;
SceneManager._elapsedTime = 0;

/**
 * The game object class that manage the Camera and the screen transform.
 */
class GameCamera {
    constructor() {
    }
}

var Direction;
(function (Direction) {
    Direction[Direction["NONE"] = 0] = "NONE";
    Direction[Direction["DOWN"] = 2] = "DOWN";
    Direction[Direction["LEFT"] = 4] = "LEFT";
    Direction[Direction["RIGHT"] = 6] = "RIGHT";
    Direction[Direction["UP"] = 8] = "UP";
})(Direction || (Direction = {}));
var PriorityType;
(function (PriorityType) {
    PriorityType[PriorityType["BELLOW"] = 0] = "BELLOW";
    PriorityType[PriorityType["SAME"] = 1] = "SAME";
    PriorityType[PriorityType["ABOVE"] = 2] = "ABOVE";
})(PriorityType || (PriorityType = {}));
class GameCharacterBase {
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    constructor(...args) {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this.initMembers();
    }
    initMembers() {
        this._x = 0;
        this._y = 0;
        this._realX = 0;
        this._realY = 0;
        this._moveSpeed = 4;
        this._moveFrequency = 6;
        this._opacity = 255;
        this._blendMode = 0;
        this._direction = 2;
        this._pattern = 1;
        this._priorityType = PriorityType.SAME;
        this._tileId = 0;
        this._characterName = '';
        this._characterIndex = 0;
        this._isObjectCharacter = false;
        this._walkAnime = true;
        this._stepAnime = false;
        this._directionFix = false;
        this._through = false;
        this._transparent = false;
        this._bushDepth = 0;
        this._animationId = 0;
        this._balloonId = 0;
        this._animationPlaying = false;
        this._balloonPlaying = false;
        this._animationCount = 0;
        this._stopCount = 0;
        this._jumpCount = 0;
        this._jumpPeak = 0;
        this._movementSuccess = true;
    }
    pos(x, y) {
        return this._x === x && this._y === y;
    }
    posNt(x, y) {
        // No through
        return this.pos(x, y) && !this.isThrough();
    }
    get moveSpeed() {
        return this._moveSpeed;
    }
    set moveSpeed(value) {
        this._moveSpeed = value;
    }
    get moveFrequency() {
        return this._moveFrequency;
    }
    set moveFrequency(value) {
        this._moveFrequency = value;
    }
    get opacity() {
        return this._opacity;
    }
    set opacity(value) {
        this._opacity = value;
    }
    get blendMode() {
        return this._blendMode;
    }
    set blendMode(value) {
        this._blendMode = value;
    }
    isNormalPriority() {
        return this._priorityType === PriorityType.SAME;
    }
    setPriorityType(value) {
        this._priorityType = value;
    }
    isMoving() {
        return this._realX !== this._x || this._realY !== this._y;
    }
    isJumping() {
        return this._jumpCount > 0;
    }
    jumpHeight() {
        return ((this._jumpPeak * this._jumpPeak -
            Math.pow(Math.abs(this._jumpCount - this._jumpPeak), 2)) /
            2);
    }
    isStopping() {
        return !this.isMoving() && !this.isJumping();
    }
    checkStop(threshold) {
        return this._stopCount > threshold;
    }
    resetStopCount() {
        this._stopCount = 0;
    }
    realMoveSpeed() {
        return this._moveSpeed + (this.isDashing() ? 1 : 0);
    }
    distancePerFrame() {
        return Math.pow(2, this.realMoveSpeed()) / 256;
    }
    isDashing() {
        return false;
    }
    isDebugThrough() {
        return false;
    }
    straighten() {
        if (this.hasWalkAnime() || this.hasStepAnime()) {
            this._pattern = 1;
        }
        this._animationCount = 0;
    }
    reverseDir(d) {
        return 10 - d;
    }
    canPass(x, y, d) {
        const x2 = $gameMap.roundXWithDirection(x, d);
        const y2 = $gameMap.roundYWithDirection(y, d);
        if (!$gameMap.isValid(x2, y2)) {
            return false;
        }
        if (this.isThrough() || this.isDebugThrough()) {
            return true;
        }
        if (!this.isMapPassable(x, y, d)) {
            return false;
        }
        if (this.isCollidedWithCharacters(x2, y2)) {
            return false;
        }
        return true;
    }
    canPassDiagonally(x, y, horz, vert) {
        const x2 = $gameMap.roundXWithDirection(x, horz);
        const y2 = $gameMap.roundYWithDirection(y, vert);
        if (this.canPass(x, y, vert) && this.canPass(x, y2, horz)) {
            return true;
        }
        if (this.canPass(x, y, horz) && this.canPass(x2, y, vert)) {
            return true;
        }
        return false;
    }
    isMapPassable(x, y, d) {
        const x2 = $gameMap.roundXWithDirection(x, d);
        const y2 = $gameMap.roundYWithDirection(y, d);
        const d2 = this.reverseDir(d);
        return $gameMap.isPassable(x, y, d) && $gameMap.isPassable(x2, y2, d2);
    }
    isCollidedWithCharacters(x, y) {
        return this.isCollidedWithEvents(x, y) || this.isCollidedWithVehicles(x, y);
    }
    isCollidedWithEvents(x, y) {
        const events = $gameMap.eventsXyNt(x, y);
        return events.some(event => event.isNormalPriority());
    }
    isCollidedWithVehicles(x, y) {
        return $gameMap.boat().posNt(x, y) || $gameMap.ship().posNt(x, y);
    }
    setPosition(x, y) {
        this._x = Math.round(x);
        this._y = Math.round(y);
        this._realX = x;
        this._realY = y;
    }
    copyPosition(character) {
        this._x = character._x;
        this._y = character._y;
        this._realX = character._realX;
        this._realY = character._realY;
        this._direction = character._direction;
    }
    locate(x, y) {
        this.setPosition(x, y);
        this.straighten();
        this.refreshBushDepth();
    }
    get direction() {
        return this._direction;
    }
    setDirection(d) {
        if (!this.isDirectionFixed() && d) {
            this._direction = d;
        }
        this.resetStopCount();
    }
    isTile() {
        return this._tileId > 0 && this._priorityType === PriorityType.BELLOW;
    }
    isObjectCharacter() {
        return this._isObjectCharacter;
    }
    shiftY() {
        return this.isObjectCharacter() ? 0 : 6;
    }
    scrolledX() {
        return $gameMap.adjustX(this._realX);
    }
    scrolledY() {
        return $gameMap.adjustY(this._realY);
    }
    screenX() {
        const tw = $gameMap.tileWidth();
        return Math.floor(this.scrolledX() * tw + tw / 2);
    }
    screenY() {
        const th = $gameMap.tileHeight();
        return Math.floor(this.scrolledY() * th + th - this.shiftY() - this.jumpHeight());
    }
    screenZ() {
        return this._priorityType * 2 + 1;
    }
    isNearTheScreen() {
        const gw = Engine.width;
        const gh = Engine.height;
        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();
        const px = this.scrolledX() * tw + tw / 2 - gw / 2;
        const py = this.scrolledY() * th + th / 2 - gh / 2;
        return px >= -gw && px <= gw && py >= -gh && py <= gh;
    }
    update(sceneActive) {
        if (this.isStopping()) {
            this.updateStop();
        }
        if (this.isJumping()) {
            this.updateJump();
        }
        else if (this.isMoving()) {
            this.updateMove();
        }
        this.updateAnimation();
    }
    updateStop() {
        this._stopCount++;
    }
    updateJump() {
        this._jumpCount--;
        this._realX =
            (this._realX * this._jumpCount + this._x) / (this._jumpCount + 1.0);
        this._realY =
            (this._realY * this._jumpCount + this._y) / (this._jumpCount + 1.0);
        this.refreshBushDepth();
        if (this._jumpCount === 0) {
            this._realX = this._x = $gameMap.roundX(this._x);
            this._realY = this._y = $gameMap.roundY(this._y);
        }
    }
    updateMove() {
        if (this._x < this._realX) {
            this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
        }
        if (this._x > this._realX) {
            this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
        }
        if (this._y < this._realY) {
            this._realY = Math.max(this._realY - this.distancePerFrame(), this._y);
        }
        if (this._y > this._realY) {
            this._realY = Math.min(this._realY + this.distancePerFrame(), this._y);
        }
        if (!this.isMoving()) {
            this.refreshBushDepth();
        }
    }
    updateAnimation() {
        this.updateAnimationCount();
        if (this._animationCount >= this.animationWait()) {
            this.updatePattern();
            this._animationCount = 0;
        }
    }
    animationWait() {
        return (9 - this.realMoveSpeed()) * 3;
    }
    updateAnimationCount() {
        if (this.isMoving() && this.hasWalkAnime()) {
            this._animationCount += 1.5;
        }
        else if (this.hasStepAnime() || !this.isOriginalPattern()) {
            this._animationCount++;
        }
    }
    updatePattern() {
        if (!this.hasStepAnime() && this._stopCount > 0) {
            this.resetPattern();
        }
        else {
            this._pattern = (this._pattern + 1) % this.maxPattern();
        }
    }
    maxPattern() {
        return 4;
    }
    get pattern() {
        return this._pattern < 3 ? this._pattern : 1;
    }
    set pattern(pattern) {
        this._pattern = pattern;
    }
    isOriginalPattern() {
        return this.pattern === 0;
    }
    resetPattern() {
        this.pattern = 0;
    }
    refreshBushDepth() {
        if (this.isNormalPriority() &&
            !this.isObjectCharacter() &&
            this.isOnBush() &&
            !this.isJumping()) {
            if (!this.isMoving()) {
                this._bushDepth = $gameMap.bushDepth();
            }
        }
        else {
            this._bushDepth = 0;
        }
    }
    isOnLadder() {
        return $gameMap.isLadder(this._x, this._y);
    }
    isOnBush() {
        return $gameMap.isBush(this._x, this._y);
    }
    terrainTag() {
        return $gameMap.terrainTag(this._x, this._y);
    }
    regionId() {
        return $gameMap.regionId(this._x, this._y);
    }
    increaseSteps() {
        if (this.isOnLadder()) {
            this.setDirection(Direction.UP);
        }
        this.resetStopCount();
        this.refreshBushDepth();
    }
    get tileId() {
        return this._tileId;
    }
    get characterName() {
        return this._characterName;
    }
    get characterIndex() {
        return this._characterIndex;
    }
    setImage(characterName, characterIndex) {
        this._tileId = 0;
        this._characterName = characterName;
        this._characterIndex = characterIndex;
        this._isObjectCharacter = ImageManager$1.isObjectCharacter(characterName);
    }
    setTileImage(tileId) {
        this._tileId = tileId;
        this._characterName = '';
        this._characterIndex = 0;
        this._isObjectCharacter = true;
    }
    checkEventTriggerTouchFront(d) {
        const x2 = $gameMap.roundXWithDirection(this._x, d);
        const y2 = $gameMap.roundYWithDirection(this._y, d);
        this.checkEventTriggerTouch(x2, y2);
    }
    isMovementSucceeded() {
        return this._movementSuccess;
    }
    setMovementSuccess(success) {
        this._movementSuccess = success;
    }
    moveStraight(d) {
        this.setMovementSuccess(this.canPass(this._x, this._y, d));
        if (this.isMovementSucceeded()) {
            this.setDirection(d);
            this._x = $gameMap.roundXWithDirection(this._x, d);
            this._y = $gameMap.roundYWithDirection(this._y, d);
            this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
            this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
            this.increaseSteps();
        }
        else {
            this.setDirection(d);
            this.checkEventTriggerTouchFront(d);
        }
    }
    moveDiagonally(horz, vert) {
        this.setMovementSuccess(this.canPassDiagonally(this._x, this._y, horz, vert));
        if (this.isMovementSucceeded()) {
            this._x = $gameMap.roundXWithDirection(this._x, horz);
            this._y = $gameMap.roundYWithDirection(this._y, vert);
            this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(horz));
            this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(vert));
            this.increaseSteps();
        }
        if (this._direction === this.reverseDir(horz)) {
            this.setDirection(horz);
        }
        if (this._direction === this.reverseDir(vert)) {
            this.setDirection(vert);
        }
    }
    jump(xPlus, yPlus) {
        if (Math.abs(xPlus) > Math.abs(yPlus)) {
            if (xPlus !== 0) {
                this.setDirection(xPlus < 0 ? 4 : 6);
            }
        }
        else {
            if (yPlus !== 0) {
                this.setDirection(yPlus < 0 ? 8 : 2);
            }
        }
        this._x += xPlus;
        this._y += yPlus;
        const distance = Math.round(Math.sqrt(xPlus * xPlus + yPlus * yPlus));
        this._jumpPeak = 10 + distance - this._moveSpeed;
        this._jumpCount = this._jumpPeak * 2;
        this.resetStopCount();
        this.straighten();
    }
    hasWalkAnime() {
        return this._walkAnime;
    }
    setWalkAnime(walkAnime) {
        this._walkAnime = walkAnime;
    }
    hasStepAnime() {
        return this._stepAnime;
    }
    setStepAnime(stepAnime) {
        this._stepAnime = stepAnime;
    }
    isDirectionFixed() {
        return this._directionFix;
    }
    setDirectionFix(directionFix) {
        this._directionFix = directionFix;
    }
    isThrough() {
        return this._through;
    }
    setThrough(through) {
        this._through = through;
    }
    isTransparent() {
        return this._transparent;
    }
    bushDepth() {
        return this._bushDepth;
    }
    setTransparent(transparent) {
        this._transparent = transparent;
    }
    startAnimation() {
        this._balloonPlaying = true;
    }
    isAnimationPlaying() {
        return this._animationPlaying;
    }
    isBallonPlaying() {
        return this._balloonPlaying;
    }
    endAnimation() {
        this._balloonPlaying = false;
    }
    endBallon() {
        this._balloonPlaying = false;
    }
}

var Route;
(function (Route) {
    Route[Route["END"] = 0] = "END";
    Route[Route["MOVE_DOWN"] = 1] = "MOVE_DOWN";
    Route[Route["MOVE_LEFT"] = 2] = "MOVE_LEFT";
    Route[Route["MOVE_RIGHT"] = 3] = "MOVE_RIGHT";
    Route[Route["MOVE_UP"] = 4] = "MOVE_UP";
    Route[Route["MOVE_LOWER_L"] = 5] = "MOVE_LOWER_L";
    Route[Route["MOVE_LOWER_R"] = 6] = "MOVE_LOWER_R";
    Route[Route["MOVE_UPPER_L"] = 7] = "MOVE_UPPER_L";
    Route[Route["MOVE_UPPER_R"] = 8] = "MOVE_UPPER_R";
    Route[Route["MOVE_RANDOM"] = 9] = "MOVE_RANDOM";
    Route[Route["MOVE_TOWARD"] = 10] = "MOVE_TOWARD";
    Route[Route["MOVE_AWAY"] = 11] = "MOVE_AWAY";
    Route[Route["MOVE_FORWARD"] = 12] = "MOVE_FORWARD";
    Route[Route["MOVE_BACKWARD"] = 13] = "MOVE_BACKWARD";
    Route[Route["JUMP"] = 14] = "JUMP";
    Route[Route["WAIT"] = 15] = "WAIT";
    Route[Route["TURN_DOWN"] = 16] = "TURN_DOWN";
    Route[Route["TURN_LEFT"] = 17] = "TURN_LEFT";
    Route[Route["TURN_RIGHT"] = 18] = "TURN_RIGHT";
    Route[Route["TURN_UP"] = 19] = "TURN_UP";
    Route[Route["TURN_90D_R"] = 20] = "TURN_90D_R";
    Route[Route["TURN_90D_L"] = 21] = "TURN_90D_L";
    Route[Route["TURN_180D"] = 22] = "TURN_180D";
    Route[Route["TURN_90D_R_L"] = 23] = "TURN_90D_R_L";
    Route[Route["TURN_RANDOM"] = 24] = "TURN_RANDOM";
    Route[Route["TURN_TOWARD"] = 25] = "TURN_TOWARD";
    Route[Route["TURN_AWAY"] = 26] = "TURN_AWAY";
    Route[Route["SWITCH_ON"] = 27] = "SWITCH_ON";
    Route[Route["SWITCH_OFF"] = 28] = "SWITCH_OFF";
    Route[Route["CHANGE_SPEED"] = 29] = "CHANGE_SPEED";
    Route[Route["CHANGE_FREQ"] = 30] = "CHANGE_FREQ";
    Route[Route["WALK_ANIME_ON"] = 31] = "WALK_ANIME_ON";
    Route[Route["WALK_ANIME_OFF"] = 32] = "WALK_ANIME_OFF";
    Route[Route["STEP_ANIME_ON"] = 33] = "STEP_ANIME_ON";
    Route[Route["STEP_ANIME_OFF"] = 34] = "STEP_ANIME_OFF";
    Route[Route["DIR_FIX_ON"] = 35] = "DIR_FIX_ON";
    Route[Route["DIR_FIX_OFF"] = 36] = "DIR_FIX_OFF";
    Route[Route["THROUGH_ON"] = 37] = "THROUGH_ON";
    Route[Route["THROUGH_OFF"] = 38] = "THROUGH_OFF";
    Route[Route["TRANSPARENT_ON"] = 39] = "TRANSPARENT_ON";
    Route[Route["TRANSPARENT_OFF"] = 40] = "TRANSPARENT_OFF";
    Route[Route["CHANGE_IMAGE"] = 41] = "CHANGE_IMAGE";
    Route[Route["CHANGE_OPACITY"] = 42] = "CHANGE_OPACITY";
    Route[Route["CHANGE_BLEND_MODE"] = 43] = "CHANGE_BLEND_MODE";
    Route[Route["PLAY_SE"] = 44] = "PLAY_SE";
    Route[Route["SCRIPT"] = 45] = "SCRIPT";
})(Route || (Route = {}));
/**
 * The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.
 */
class GameCharacter extends GameCharacterBase {
    initMembers() {
        super.initMembers();
        this._moveRouteForcing = false;
        this._moveRoute = null;
        this._moveRouteIndex = 0;
        this._originalMoveRoute = null;
        this._originalMoveRouteIndex = 0;
        this._waitCount = 0;
    }
    memorizeMoveRoute() {
        this._originalMoveRoute = this._moveRoute;
        this._originalMoveRouteIndex = this._moveRouteIndex;
    }
    restoreMoveRoute() {
        this._moveRoute = this._originalMoveRoute;
        this._moveRouteIndex = this._originalMoveRouteIndex;
        this._originalMoveRoute = null;
    }
    isMoveRouteForcing() {
        return this._moveRouteForcing;
    }
    setMoveRoute(moveRoute) {
        if (this._moveRouteForcing) {
            this._originalMoveRoute = moveRoute;
            this._originalMoveRouteIndex = 0;
        }
        else {
            this._moveRoute = moveRoute;
            this._moveRouteIndex = 0;
        }
    }
    forceMoveRoute(moveRoute) {
        if (!this._originalMoveRoute) {
            this.memorizeMoveRoute();
        }
        this._moveRoute = moveRoute;
        this._moveRouteIndex = 0;
        this._moveRouteForcing = true;
        this._waitCount = 0;
    }
    updateStop() {
        super.updateStop();
        if (!this._moveRouteForcing)
            return;
        this.updateRoutineMove();
    }
    updateRoutineMove() {
        if (this._waitCount > 0) {
            this._waitCount--;
        }
        else {
            this.setMovementSuccess(true);
            const command = this._moveRoute.list[this._moveRouteIndex];
            if (command) {
                this.processMoveCommand(command);
                this.advanceMoveRouteIndex();
            }
        }
    }
    processMoveCommand(command) {
        const params = command.parameters;
        switch (command.code) {
            case Route.END:
                this.processRouteEnd();
                break;
            case Route.MOVE_DOWN:
                this.moveStraight(Direction.DOWN);
                break;
            case Route.MOVE_LEFT:
                this.moveStraight(Direction.LEFT);
                break;
            case Route.MOVE_RIGHT:
                this.moveStraight(Direction.RIGHT);
                break;
            case Route.MOVE_UP:
                this.moveStraight(Direction.UP);
                break;
            case Route.MOVE_LOWER_L:
                this.moveDiagonally(Direction.LEFT, Direction.DOWN);
                break;
            case Route.MOVE_LOWER_R:
                this.moveDiagonally(Direction.RIGHT, Direction.DOWN);
                break;
            case Route.MOVE_UPPER_L:
                this.moveDiagonally(Direction.LEFT, Direction.UP);
                break;
            case Route.MOVE_UPPER_R:
                this.moveDiagonally(Direction.RIGHT, Direction.UP);
                break;
            case Route.MOVE_RANDOM:
                this.moveRandom();
                break;
            case Route.MOVE_TOWARD:
                this.moveTowardPlayer();
                break;
            case Route.MOVE_AWAY:
                this.moveAwayFromPlayer();
                break;
            case Route.MOVE_FORWARD:
                this.moveForward();
                break;
            case Route.MOVE_BACKWARD:
                this.moveBackward();
                break;
            case Route.JUMP:
                this.jump(params[0], params[1]);
                break;
            case Route.WAIT:
                this._waitCount = params[0] - 1;
                break;
            case Route.TURN_DOWN:
                this.setDirection(Direction.DOWN);
                break;
            case Route.TURN_LEFT:
                this.setDirection(Direction.LEFT);
                break;
            case Route.TURN_RIGHT:
                this.setDirection(Direction.RIGHT);
                break;
            case Route.TURN_UP:
                this.setDirection(Direction.UP);
                break;
            case Route.TURN_90D_R:
                this.turnRight90();
                break;
            case Route.TURN_90D_L:
                this.turnLeft90();
                break;
            case Route.TURN_180D:
                this.turn180();
                break;
            case Route.TURN_90D_R_L:
                this.turnRightOrLeft90();
                break;
            case Route.TURN_RANDOM:
                this.turnRandom();
                break;
            case Route.TURN_TOWARD:
                this.turnTowardPlayer();
                break;
            case Route.TURN_AWAY:
                this.turnAwayFromPlayer();
                break;
            case Route.SWITCH_ON:
                $gameSwitches.setValue(params[0], true);
                break;
            case Route.SWITCH_OFF:
                $gameSwitches.setValue(params[0], false);
                break;
            case Route.CHANGE_SPEED:
                this.moveSpeed = params[0];
                break;
            case Route.CHANGE_FREQ:
                this.moveFrequency = params[0];
                break;
            case Route.WALK_ANIME_ON:
                this.setWalkAnime(true);
                break;
            case Route.WALK_ANIME_OFF:
                this.setWalkAnime(false);
                break;
            case Route.STEP_ANIME_ON:
                this.setStepAnime(true);
                break;
            case Route.STEP_ANIME_OFF:
                this.setStepAnime(false);
                break;
            case Route.DIR_FIX_ON:
                this.setDirectionFix(true);
                break;
            case Route.DIR_FIX_OFF:
                this.setDirectionFix(false);
                break;
            case Route.THROUGH_ON:
                this.setThrough(true);
                break;
            case Route.THROUGH_OFF:
                this.setThrough(false);
                break;
            case Route.TRANSPARENT_ON:
                this.setTransparent(true);
                break;
            case Route.TRANSPARENT_OFF:
                this.setTransparent(false);
                break;
            case Route.CHANGE_IMAGE:
                this.setImage(params[0], params[1]);
                break;
            case Route.CHANGE_OPACITY:
                this.opacity = params[0];
                break;
            case Route.CHANGE_BLEND_MODE:
                this.blendMode = params[0];
                break;
            case Route.PLAY_SE:
                AudioManager.playSe(params[0]);
                break;
            case Route.SCRIPT:
                eval(params[0]);
                break;
        }
    }
    deltaXFrom(x) {
        return $gameMap.deltaX(this.x, x);
    }
    deltaYFrom(y) {
        return $gameMap.deltaY(this.y, y);
    }
    moveRandom() {
        const d = 2 + Math.randomInt(4) * 2;
        if (this.canPass(this.x, this.y, d)) {
            this.moveStraight(d);
        }
    }
    moveTowardCharacter(character) {
        const sx = this.deltaXFrom(character.x);
        const sy = this.deltaYFrom(character.y);
        if (Math.abs(sx) > Math.abs(sy)) {
            this.moveStraight(sx > 0 ? 4 : 6);
            if (!this.isMovementSucceeded() && sy !== 0) {
                this.moveStraight(sy > 0 ? 8 : 2);
            }
        }
        else if (sy !== 0) {
            this.moveStraight(sy > 0 ? 8 : 2);
            if (!this.isMovementSucceeded() && sx !== 0) {
                this.moveStraight(sx > 0 ? 4 : 6);
            }
        }
    }
    moveAwayFromCharacter(character) {
        const sx = this.deltaXFrom(character.x);
        const sy = this.deltaYFrom(character.y);
        if (Math.abs(sx) > Math.abs(sy)) {
            this.moveStraight(sx > 0 ? 6 : 4);
            if (!this.isMovementSucceeded() && sy !== 0) {
                this.moveStraight(sy > 0 ? 2 : 8);
            }
        }
        else if (sy !== 0) {
            this.moveStraight(sy > 0 ? 2 : 8);
            if (!this.isMovementSucceeded() && sx !== 0) {
                this.moveStraight(sx > 0 ? 6 : 4);
            }
        }
    }
    turnTowardCharacter(character) {
        const sx = this.deltaXFrom(character.x);
        const sy = this.deltaYFrom(character.y);
        if (Math.abs(sx) > Math.abs(sy)) {
            this.setDirection(sx > 0 ? 4 : 6);
        }
        else if (sy !== 0) {
            this.setDirection(sy > 0 ? 8 : 2);
        }
    }
    turnAwayFromCharacter(character) {
        const sx = this.deltaXFrom(character.x);
        const sy = this.deltaYFrom(character.y);
        if (Math.abs(sx) > Math.abs(sy)) {
            this.setDirection(sx > 0 ? 6 : 4);
        }
        else if (sy !== 0) {
            this.setDirection(sy > 0 ? 2 : 8);
        }
    }
    turnTowardPlayer() {
        this.turnTowardCharacter($gamePlayer);
    }
    turnAwayFromPlayer() {
        this.turnAwayFromCharacter($gamePlayer);
    }
    moveTowardPlayer() {
        this.moveTowardCharacter($gamePlayer);
    }
    moveAwayFromPlayer() {
        this.moveAwayFromCharacter($gamePlayer);
    }
    moveForward() {
        this.moveStraight(this.direction);
    }
    moveBackward() {
        const lastDirectionFix = this.isDirectionFixed();
        this.setDirectionFix(true);
        this.moveStraight(this.reverseDir(this.direction));
        this.setDirectionFix(lastDirectionFix);
    }
    processRouteEnd() {
        if (this._moveRoute.repeat) {
            this._moveRouteIndex = -1;
        }
        else if (this._moveRouteForcing) {
            this._moveRouteForcing = false;
            this.restoreMoveRoute();
            this.setMovementSuccess(false);
        }
    }
    advanceMoveRouteIndex() {
        const moveRoute = this._moveRoute;
        if (moveRoute && (this.isMovementSucceeded() || moveRoute.skippable)) {
            let numCommands = moveRoute.list.length - 1;
            this._moveRouteIndex++;
            if (moveRoute.repeat && this._moveRouteIndex >= numCommands) {
                this._moveRouteIndex = 0;
            }
        }
    }
    turnRight90() {
        switch (this.direction) {
            case Direction.DOWN:
                this.setDirection(Direction.LEFT);
                break;
            case Direction.LEFT:
                this.setDirection(Direction.UP);
                break;
            case Direction.RIGHT:
                this.setDirection(Direction.DOWN);
                break;
            case Direction.UP:
                this.setDirection(Direction.RIGHT);
                break;
        }
    }
    turnLeft90() {
        switch (this.direction) {
            case Direction.DOWN:
                this.setDirection(Direction.RIGHT);
                break;
            case Direction.LEFT:
                this.setDirection(Direction.DOWN);
                break;
            case Direction.RIGHT:
                this.setDirection(Direction.UP);
                break;
            case Direction.UP:
                this.setDirection(Direction.LEFT);
                break;
        }
    }
    turn180() {
        this.setDirection(this.reverseDir(this.direction));
    }
    turnRightOrLeft90() {
        switch (Math.randomInt(2)) {
            case 0:
                this.turnRight90();
                break;
            case 1:
                this.turnLeft90();
                break;
        }
    }
    turnRandom() {
        this.setDirection(2 + Math.randomInt(4) * 2);
    }
    swap(character) {
        const newX = character.x;
        const newY = character.y;
        character.locate(this.x, this.y);
        this.locate(newX, newY);
    }
    findDirectionTo(goalX, goalY) {
        const searchLimit = this.searchLimit();
        const mapWidth = $gameMap.width();
        const nodeList = [];
        const openList = [];
        const closedList = [];
        const start = {};
        let best = start;
        if (this.x === goalX && this.y === goalY) {
            return 0;
        }
        start.parent = null;
        start.x = this.x;
        start.y = this.y;
        start.g = 0;
        start.f = $gameMap.distance(start.x, start.y, goalX, goalY);
        nodeList.push(start);
        openList.push(start.y * mapWidth + start.x);
        while (nodeList.length > 0) {
            let bestIndex = 0;
            for (let i = 0; i < nodeList.length; i++) {
                if (nodeList[i].f < nodeList[bestIndex].f) {
                    bestIndex = i;
                }
            }
            const current = nodeList[bestIndex];
            const x1 = current.x;
            const y1 = current.y;
            const pos1 = y1 * mapWidth + x1;
            const g1 = current.g;
            nodeList.splice(bestIndex, 1);
            openList.splice(openList.indexOf(pos1), 1);
            closedList.push(pos1);
            if (current.x === goalX && current.y === goalY) {
                best = current;
                break;
            }
            if (g1 >= searchLimit) {
                continue;
            }
            for (let j = 0; j < 4; j++) {
                const direction = 2 + j * 2;
                const x2 = $gameMap.roundXWithDirection(x1, direction);
                const y2 = $gameMap.roundYWithDirection(y1, direction);
                const pos2 = y2 * mapWidth + x2;
                if (closedList.includes(pos2)) {
                    continue;
                }
                if (!this.canPass(x1, y1, direction)) {
                    continue;
                }
                const g2 = g1 + 1;
                const index2 = openList.indexOf(pos2);
                if (index2 < 0 || g2 < nodeList[index2].g) {
                    let neighbor = {};
                    if (index2 >= 0) {
                        neighbor = nodeList[index2];
                    }
                    else {
                        nodeList.push(neighbor);
                        openList.push(pos2);
                    }
                    neighbor.parent = current;
                    neighbor.x = x2;
                    neighbor.y = y2;
                    neighbor.g = g2;
                    neighbor.f = g2 + $gameMap.distance(x2, y2, goalX, goalY);
                    if (!best || neighbor.f - neighbor.g < best.f - best.g) {
                        best = neighbor;
                    }
                }
            }
        }
        let node = best;
        while (node.parent && node.parent !== start) {
            node = node.parent;
        }
        const deltaX1 = $gameMap.deltaX(node.x, start.x);
        const deltaY1 = $gameMap.deltaY(node.y, start.y);
        if (deltaY1 > 0) {
            return 2;
        }
        else if (deltaX1 < 0) {
            return 4;
        }
        else if (deltaX1 > 0) {
            return 6;
        }
        else if (deltaY1 < 0) {
            return 8;
        }
        const deltaX2 = this.deltaXFrom(goalX);
        const deltaY2 = this.deltaYFrom(goalY);
        if (Math.abs(deltaX2) > Math.abs(deltaY2)) {
            return deltaX2 > 0 ? 4 : 6;
        }
        else if (deltaY2 !== 0) {
            return deltaY2 > 0 ? 8 : 2;
        }
        return 0;
    }
    searchLimit() {
        return 12;
    }
}

class GameCommonEvent {
    constructor(commonEventId, ...args) {
        this.initialize(commonEventId, ...args);
    }
    initialize(commonEventId, ...args) {
        this._commonEventId = commonEventId;
        this.refresh();
    }
    event() {
        return $dataCommonEvents[this._commonEventId];
    }
    list() {
        return this.event().list;
    }
    refresh() {
        if (this.isActive()) {
            if (!this._interpreter) {
                this._interpreter = new GameInterpreter();
            }
        }
        else {
            this._interpreter = null;
        }
    }
    isActive() {
        const event = this.event();
        return event.trigger === 2 && $gameSwitches.value(event.switchId);
    }
    update() {
        if (this._interpreter) {
            if (!this._interpreter.isRunning()) {
                this._interpreter.setup(this.list());
            }
            this._interpreter.update();
        }
    }
}

let GameInterpreter$1 = class GameInterpreter {
};

class GameEvent extends GameCharacter {
    constructor(mapId, eventId) {
        super(...arguments);
    }
    initialize(mapId, eventId, ...arg) {
        super.initialize(...arg);
        this._mapId = mapId;
        this._eventId = eventId;
        this.locate(this.event.x, this.event.y);
        this.refresh();
    }
    initMembers() {
        super.initMembers();
        this._moveType = MoveType.FIX;
        this._trigger = 0;
        this._starting = false;
        this._erased = false;
        this._pageIndex = -2;
        this._originalPattern = 1;
        this._originalDirection = Direction.DOWN;
        this._prelockDirection = Direction.NONE;
        this._locked = false;
    }
    get eventId() {
        return this._eventId;
    }
    get event() {
        return $dataMap.events[this._eventId];
    }
    get page() {
        return this.event.pages[this._pageIndex];
    }
    get list() {
        return this.page.list;
    }
    isCollidedWithCharacters(x, y) {
        return (super.isCollidedWithCharacters(x, y) ||
            this.isCollidedWithPlayerCharacters(x, y));
    }
    isCollidedWithEvents(x, y) {
        const events = $gameMap.eventsXyNt(x, y);
        return events.length > 0;
    }
    isCollidedWithPlayerCharacters(x, y) {
        return this.isNormalPriority() && $gamePlayer.isCollided(x, y);
    }
    lock() {
        if (this._locked)
            return;
        this._prelockDirection = this.direction;
        this.turnTowardPlayer();
        this._locked = true;
    }
    unlock() {
        if (!this._locked)
            return;
        this._locked = false;
        this.setDirection(this._prelockDirection);
    }
    updateStop() {
        if (this._locked)
            this.resetStopCount();
        super.updateStop();
        if (!this.isMoveRouteForcing())
            this.updateSelfMovement();
    }
    updateSelfMovement() {
        if (!this._locked
            && this.isNearTheScreen()
            && this.checkStop(this.stopCountThreshold())) {
            switch (this._moveType) {
                case MoveType.RANDOM:
                    this.moveTypeRandom();
                    break;
                case MoveType.APPROACH:
                    this.moveTypeTowardPlayer();
                    break;
                case MoveType.CUSTOM:
                    this.moveTypeCustom();
                    break;
            }
        }
    }
    stopCountThreshold() {
        return 30 * (5 - this.moveFrequency);
    }
    moveTypeRandom() {
        switch (Math.randomInt(6)) {
            case 0:
            case 1:
                this.moveRandom();
                break;
            case 2:
            case 3:
            case 4:
                this.moveForward();
                break;
            case 5:
                this.resetStopCount();
                break;
        }
    }
    moveTypeTowardPlayer() {
        if (this.isNearThePlayer()) {
            switch (Math.randomInt(6)) {
                case 0:
                case 1:
                case 2:
                case 3:
                    this.moveTowardPlayer();
                    break;
                case 4:
                    this.moveRandom();
                    break;
                case 5:
                    this.moveForward();
                    break;
            }
        }
        else {
            this.moveRandom();
        }
    }
    isNearThePlayer() {
        const sx = Math.abs(this.deltaXFrom($gamePlayer.x));
        const sy = Math.abs(this.deltaYFrom($gamePlayer.y));
        return sx + sy < 20;
    }
    moveTypeCustom() {
        this.updateRoutineMove();
    }
    isStarting() {
        return this._starting;
    }
    clearStartingFlag() {
        this._starting = false;
    }
    isTriggerIn(triggers) {
        return triggers.includes(this._trigger);
    }
    start() {
        const list = this.list;
        if (list && list.length > 1) {
            this._starting = true;
            if (this.isTriggerIn([0, 1, 2])) {
                this.lock();
            }
        }
    }
    erase() {
        this._erased = true;
        this.refresh();
    }
    refresh() {
        const newPageIndex = this._erased ? -1 : this.findProperPageIndex();
        if (this._pageIndex !== newPageIndex) {
            this._pageIndex = newPageIndex;
            this.setupPage();
        }
    }
    findProperPageIndex() {
        const pages = this.event.pages;
        for (let i = pages.length - 1; i >= 0; i--) {
            const page = pages[i];
            if (this.meetsConditions(page)) {
                return i;
            }
        }
        return -1;
    }
    meetsConditions(page) {
        const c = page.conditions;
        if (c.switch1Valid) {
            if (!$gameSwitches.value(c.switch1Id)) {
                return false;
            }
        }
        if (c.switch2Valid) {
            if (!$gameSwitches.value(c.switch2Id)) {
                return false;
            }
        }
        if (c.variableValid) {
            if ($gameVariables.value(c.variableId) < c.variableValue) {
                return false;
            }
        }
        if (c.selfSwitchValid) {
            const key = [this._mapId, this._eventId, c.selfSwitchCh];
            // @ts-ignore
            if ($gameSelfSwitches.value(key) !== true) {
                return false;
            }
        }
        if (c.itemValid) {
            const item = $dataItems[c.itemId];
            if (!$gameParty.hasItem(item)) {
                return false;
            }
        }
        if (c.actorValid) {
            const actor = $gameActors.actor(c.actorId);
            if (!$gameParty.members().includes(actor)) {
                return false;
            }
        }
        return true;
    }
    setupPage() {
        if (this._pageIndex >= 0) {
            this.setupPageSettings();
        }
        else {
            this.clearPageSettings();
        }
        this.refreshBushDepth();
        this.clearStartingFlag();
        this.checkEventTriggerAuto();
    }
    clearPageSettings() {
        this.setImage('', 0);
        this._moveType = 0;
        this._trigger = null;
        this._interpreter = null;
        this.setThrough(true);
    }
    setupPageSettings() {
        const page = this.page;
        const image = page.image;
        if (image.tileId > 0) {
            this.setTileImage(image.tileId);
        }
        else {
            this.setImage(image.characterName, image.characterIndex);
        }
        if (this._originalDirection !== image.direction) {
            this._originalDirection = image.direction;
            this._prelockDirection = 0;
            this.setDirectionFix(false);
            this.setDirection(image.direction);
        }
        if (this._originalPattern !== image.pattern) {
            this._originalPattern = image.pattern;
            this.pattern = image.pattern;
        }
        this.moveSpeed = page.moveSpeed;
        this.moveFrequency = page.moveFrequency;
        this.setPriorityType(page.priorityType);
        this.setWalkAnime(page.walkAnime);
        this.setStepAnime(page.stepAnime);
        this.setDirectionFix(page.directionFix);
        this.setThrough(page.through);
        this.setMoveRoute(page.moveRoute);
        this._moveType = page.moveType;
        this._trigger = page.trigger;
        if (this._trigger === 4) {
            this._interpreter = new GameInterpreter$1();
        }
        else {
            this._interpreter = null;
        }
    }
    isOriginalPattern() {
        return this.pattern === this._originalPattern;
    }
    resetPattern() {
        this.pattern = this._originalPattern;
    }
    checkEventTriggerTouch(x, y) {
        if ($gameMap.isEventRunning())
            return;
        if (this._trigger !== 2)
            return;
        if (!$gamePlayer.pos(x, y))
            return;
        if (this.isJumping())
            return;
        if (!this.isNormalPriority())
            return;
        this.start();
    }
    checkEventTriggerAuto() {
        if (this._trigger === EventTrigger.AUTORUN) {
            this.start();
        }
    }
    update() {
        super.update();
        this.checkEventTriggerAuto();
        this.updateParallel();
    }
    updateParallel() {
        if (!this._interpreter)
            return;
        if (!this._interpreter.isRunning()) {
            this._interpreter.setup(this.list(), this._eventId);
        }
        this._interpreter.update();
    }
    locate(x, y) {
        super.locate(x, y);
        this._prelockDirection = Direction.NONE;
    }
    forceMoveRoute(moveRoute) {
        super.forceMoveRoute(moveRoute);
        this._prelockDirection = Direction.NONE;
    }
}

class GameFollower extends GameCharacter {
    constructor(memberIndex) {
        super(...arguments);
    }
    initialize(memberIndex, ...args) {
        super.initialize(...args);
        this._memberIndex = memberIndex;
        this.setTransparent($dataSystem.optTransparent);
        this.setThrough(true);
    }
    refresh() {
        const characterName = this.isVisible() ? this.actor().characterName : "";
        const characterIndex = this.isVisible() ? this.actor().characterIndex : 0;
        this.setImage(characterName, characterIndex);
    }
    actor() {
        return $gameParty.battleMembers()[this._memberIndex];
    }
    isVisible() {
        return this.actor() && $gamePlayer.followers().isVisible();
    }
    isGathered() {
        return !this.isMoving() && this.pos($gamePlayer.x, $gamePlayer.y);
    }
    update() {
        super.update();
        this.moveSpeed = $gamePlayer.realMoveSpeed();
        this.opacity = $gamePlayer.opacity();
        this.blendMode = $gamePlayer.blendMode();
        this.setWalkAnime($gamePlayer.hasWalkAnime());
        this.setStepAnime($gamePlayer.hasStepAnime());
        this.setDirectionFix($gamePlayer.isDirectionFixed());
        this.setTransparent($gamePlayer.isTransparent());
    }
    chaseCharacter(character) {
        const sx = this.deltaXFrom(character.x);
        const sy = this.deltaYFrom(character.y);
        if (sx !== 0 && sy !== 0) {
            this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
        }
        else if (sx !== 0) {
            this.moveStraight(sx > 0 ? 4 : 6);
        }
        else if (sy !== 0) {
            this.moveStraight(sy > 0 ? 8 : 2);
        }
        this.moveSpeed = $gamePlayer.realMoveSpeed();
    }
    checkEventTriggerTouch(_x, _y) {
        // NOT NEEDED but gotta implement the abstract member
    }
}

class GameFollowers {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this._visible = $dataSystem.optFollowers;
        this._gathering = false;
        this._data = [];
        this.setup();
    }
    setup() {
        this._data = [];
        for (let i = 1; i < $gameParty.maxBattleMembers(); i++) {
            this._data.push(new GameFollower(i));
        }
    }
    isVisible() {
        return this._visible;
    }
    show() {
        this._visible = true;
    }
    hide() {
        this._visible = false;
    }
    data() {
        return this._data.clone();
    }
    reserveData() {
        return this._data.clone().reverse();
    }
    follower(index) {
        return this._data[index];
    }
    refresh() {
        for (const follower of this._data) {
            follower.refresh();
        }
    }
    update() {
        if (this.areGathering()) {
            if (!this.areMoving()) {
                this.updateMove();
            }
            if (this.areGathered()) {
                this._gathering = false;
            }
        }
        for (const follower of this._data) {
            follower.update();
        }
    }
    updateMove() {
        for (let i = this._data.length - 1; i >= 0; i--) {
            const precedingCharacter = i > 0 ? this._data[i - 1] : $gamePlayer;
            this._data[i].chaseCharacter(precedingCharacter);
        }
    }
    jumpAll() {
        if ($gamePlayer.isJumping()) {
            for (const follower of this._data) {
                const sx = $gamePlayer.deltaXFrom(follower.x);
                const sy = $gamePlayer.deltaYFrom(follower.y);
                follower.jump(sx, sy);
            }
        }
    }
    synchronize(x, y, d) {
        for (const follower of this._data) {
            follower.locate(x, y);
            follower.setDirection(d);
        }
    }
    gather() {
        this._gathering = true;
    }
    areGathering() {
        return this._gathering;
    }
    visibleFollowers() {
        return this._data.filter(follower => follower.isVisible());
    }
    areMoving() {
        return this.visibleFollowers().some(follower => follower.isMoving());
    }
    areGathered() {
        return this.visibleFollowers().every(follower => follower.isGathered());
    }
    isSomeoneCollided(x, y) {
        return this.visibleFollowers().some(follower => follower.pos(x, y));
    }
}

class GameVehicle extends GameCharacter {
    constructor(type, ...args) {
        super(...arguments);
    }
    initialize(type, ...args) {
        super.initialize(...args);
        this._type = type;
        this.resetDirection();
        this.initMoveSpeed();
        this.loadSystemSettings();
    }
    initMembers() {
        super.initMembers();
        this._type = '';
        this._mapId = 0;
        this._altitude = 0;
        this._driving = false;
        this._bgm = null;
    }
    isBoat() {
        return this._type === 'boat';
    }
    isShip() {
        return this._type === 'ship';
    }
    isAirship() {
        return this._type === 'airship';
    }
    resetDirection() {
        this.setDirection(4);
    }
    initMoveSpeed() {
        if (this.isBoat()) {
            this.moveSpeed = 4;
        }
        else if (this.isShip()) {
            this.moveSpeed = 5;
        }
        else if (this.isAirship()) {
            this.moveSpeed = 6;
        }
    }
    vehicle() {
        if (this.isBoat()) {
            return $dataSystem.boat;
        }
        else if (this.isShip()) {
            return $dataSystem.ship;
        }
        else if (this.isAirship()) {
            return $dataSystem.airship;
        }
        else {
            return null;
        }
    }
    loadSystemSettings() {
        const vehicle = this.vehicle();
        this._mapId = vehicle.startMapId;
        this.setPosition(vehicle.startX, vehicle.startY);
        this.setImage(vehicle.characterName, vehicle.characterIndex);
    }
    refresh() {
        if (this._driving) {
            this._mapId = $gameMap.mapId();
            this.syncWithPlayer();
        }
        else if (this._mapId === $gameMap.mapId()) {
            this.locate(this.x, this.y);
        }
        if (this.isAirship()) {
            this.setPriorityType(this._driving ? 2 : 0);
        }
        else {
            this.setPriorityType(1);
        }
        this.setWalkAnime(this._driving);
        this.setStepAnime(this._driving);
        this.setTransparent(this._mapId !== $gameMap.mapId());
    }
    setLocation(mapId, x, y) {
        this._mapId = mapId;
        this.setPosition(x, y);
        this.refresh();
    }
    pos(x, y) {
        if (this._mapId === $gameMap.mapId()) {
            return super.pos(x, y);
        }
        else {
            return false;
        }
    }
    isMapPassable(x, y, d) {
        const x2 = $gameMap.roundXWithDirection(x, d);
        const y2 = $gameMap.roundYWithDirection(y, d);
        if (this.isBoat()) {
            return $gameMap.isBoatPassable(x2, y2);
        }
        else if (this.isShip()) {
            return $gameMap.isShipPassable(x2, y2);
        }
        else
            return this.isAirship();
    }
    getOn() {
        this._driving = true;
        this.setWalkAnime(true);
        this.setStepAnime(true);
        $gameSystem.saveWalkingBgm();
        this.playBgm();
    }
    getOff() {
        this._driving = false;
        this.setWalkAnime(false);
        this.setStepAnime(false);
        this.resetDirection();
        $gameSystem.replayWalkingBgm();
    }
    setBgm(bgm) {
        this._bgm = bgm;
    }
    playBgm() {
        AudioManager.playBgm(this._bgm || this.vehicle().bgm);
    }
    syncWithPlayer() {
        this.copyPosition($gamePlayer);
        this.refreshBushDepth();
    }
    screenY() {
        return super.screenY() - this._altitude;
    }
    shadowX() {
        return this.screenX();
    }
    shadowY() {
        return this.screenY() + this._altitude;
    }
    shadowOpacity() {
        return (255 * this._altitude) / this.maxAltitude();
    }
    canMove() {
        if (this.isAirship()) {
            return this.isHighest();
        }
        else {
            return true;
        }
    }
    update() {
        super.update();
        if (this.isAirship()) {
            this.updateAirship();
        }
    }
    updateAirship() {
        this.updateAirshipAltitude();
        this.setStepAnime(this.isHighest());
        this.setPriorityType(this.isLowest() ? 0 : 2);
    }
    updateAirshipAltitude() {
        if (this._driving && !this.isHighest()) {
            this._altitude++;
        }
        if (!this._driving && !this.isLowest()) {
            this._altitude--;
        }
    }
    maxAltitude() {
        return 48;
    }
    isLowest() {
        return this._altitude <= 0;
    }
    isHighest() {
        return this._altitude >= this.maxAltitude();
    }
    isTakeoffOk() {
        return $gamePlayer.areFollowersGathered();
    }
    isLandOk(x, y, d) {
        if (this.isAirship()) {
            if (!$gameMap.isAirshipLandOk(x, y)) {
                return false;
            }
            if ($gameMap.eventsXy(x, y).length > 0) {
                return false;
            }
        }
        else {
            const x2 = $gameMap.roundXWithDirection(x, d);
            const y2 = $gameMap.roundYWithDirection(y, d);
            if (!$gameMap.isValid(x2, y2)) {
                return false;
            }
            if (!$gameMap.isPassable(x2, y2, this.reverseDir(d))) {
                return false;
            }
            if (this.isCollidedWithCharacters(x2, y2)) {
                return false;
            }
        }
        return true;
    }
    checkEventTriggerTouch(_x, _y) {
        /// NOTHING
    }
}

let GameMap$1 = class GameMap {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this._interpreter = new GameInterpreter$1();
        this._mapId = 0;
        this._tilesetId = 0;
        this._events = [];
        this._commonEvents = [];
        this._vehicles = [];
        this._displayX = 0;
        this._displayY = 0;
        this._nameDisplay = true;
        this._scrollDirection = 2;
        this._scrollRest = 0;
        this._scrollSpeed = 4;
        this._parallaxName = "";
        this._parallaxZero = false;
        this._parallaxLoopX = false;
        this._parallaxLoopY = false;
        this._parallaxSx = 0;
        this._parallaxSy = 0;
        this._parallaxX = 0;
        this._parallaxY = 0;
        this._battleback1Name = null;
        this._battleback2Name = null;
        this.createVehicles();
    }
    setup(mapId) {
        if (!$dataMap) {
            throw new Error("The map data is not available");
        }
        this._mapId = mapId;
        this._tilesetId = $dataMap.tilesetId;
        this._displayX = 0;
        this._displayY = 0;
        this.refereshVehicles();
        this.setupEvents();
        this.setupScroll();
        this.setupParallax();
        this.setupBattleback();
        this._needsRefresh = false;
    }
    isEventRunning() {
        return this._interpreter.isRunning() || this.isAnyEventStarting();
    }
    get tileWidth() {
        if ("tileSize" in $dataSystem) {
            return $dataSystem.tileSize;
        }
        else {
            return 48;
        }
    }
    get tileHeight() {
        if ("tileSize" in $dataSystem) {
            return $dataSystem.tileSize;
        }
        else {
            return 48;
        }
    }
    get bushDepth() {
        return this.tileHeight / 4;
    }
    get mapId() {
        return this._mapId;
    }
    get tilesetId() {
        return this._tilesetId;
    }
    get displayX() {
        return this._displayX;
    }
    get displayY() {
        return this._displayY;
    }
    get parallaxName() {
        return this._parallaxName;
    }
    get battleback1Name() {
        return this._battleback1Name;
    }
    get battleback2Name() {
        return this._battleback2Name;
    }
    requestFresh() {
        this._needsRefresh = true;
    }
    isNameDisplayEnabled() {
        return this._nameDisplay;
    }
    disableNameDisplay() {
        this._nameDisplay = false;
    }
    enableNameDisplay() {
        this._nameDisplay = true;
    }
    createVehicles() {
        this._vehicles = [];
        this._vehicles[0] = new GameVehicle("boat");
        this._vehicles[1] = new GameVehicle("ship");
        this._vehicles[2] = new GameVehicle("airship");
    }
    refreshVehicles() {
        for (const vehicle of this._vehicles) {
            vehicle.refresh();
        }
    }
    get vehicles() {
        return this._vehicles;
    }
    vehicle(type) {
        if (type === 0 || type === "boat") {
            return this.boat();
        }
        else if (type === 1 || type === "ship") {
            return this.ship();
        }
        else if (type === 2 || type === "airship") {
            return this.airship();
        }
        else {
            return null;
        }
    }
    get boat() {
        return this._vehicles[0];
    }
    get ship() {
        return this._vehicles[1];
    }
    get airship() {
        return this._vehicles[2];
    }
    setupEvents() {
        this._events = [];
        this._commonEvents = [];
        for (const event of $dataMap.events.filter(event => !!event)) {
            this._events[event.id] = new GameEvent(this._mapId, event.id);
        }
        for (const commonEvent of this.parallelCommonEvents()) {
            this._commonEvents.push(new GameCommonEvent(commonEvent.id));
        }
        this.refreshTileEvents();
    }
    events() {
        return this._events.filter(event => !!event);
    }
    event(eventId) {
        return this._events[eventId];
    }
    eraseEvent(eventId) {
        this._events[eventId].erase();
    }
    autorunCommonEvents() {
        return $dataCommonEvents.filter(commonEvent => commonEvent && commonEvent.trigger === CommonEventTrigger.AUTORUN);
    }
    parallelCommonEvents() {
        return $dataCommonEvents.filter(commonEvent => commonEvent && commonEvent.trigger === CommonEventTrigger.PARALLEL);
    }
    setupScroll() {
        this._scrollDirection = 2;
        this._scrollRest = 0;
        this._scrollSpeed = 4;
    }
    setupParallax() {
        this._parallaxName = $dataMap.parallaxName || "";
        this._parallaxZero = ImageManager$1.isZeroParallax(this._parallaxName);
        this._parallaxLoopX = $dataMap.parallaxLoopX;
        this._parallaxLoopY = $dataMap.parallaxLoopY;
        this._parallaxSx = $dataMap.parallaxSx;
        this._parallaxSy = $dataMap.parallaxSy;
        this._parallaxX = 0;
        this._parallaxY = 0;
    }
    setupBattleback() {
        if ($dataMap.specifyBattleback) {
            this._battleback1Name = $dataMap.battleback1Name;
            this._battleback2Name = $dataMap.battleback2Name;
        }
        else {
            this._battleback1Name = null;
            this._battleback2Name = null;
        }
    }
    setDisplayPos(x, y) {
        if (this.isLoopHorizontal()) {
            this._displayX = x.mod(this.width());
            this._parallaxX = x;
        }
        else {
            const endX = this.width() - this.screenTileX();
            this._displayX = endX < 0 ? endX / 2 : x.clamp(0, endX);
            this._parallaxX = this._displayX;
        }
        if (this.isLoopVertical()) {
            this._displayY = y.mod(this.height());
            this._parallaxY = y;
        }
        else {
            const endY = this.height() - this.screenTileY();
            this._displayY = endY < 0 ? endY / 2 : y.clamp(0, endY);
            this._parallaxY = this._displayY;
        }
    }
    get parallaxOx() {
        if (this._parallaxZero) {
            return this._parallaxX * this.tileWidth;
        }
        else if (this._parallaxLoopX) {
            return (this._parallaxX * this.tileWidth) / 2;
        }
        else {
            return 0;
        }
    }
    get parallaxOy() {
        if (this._parallaxZero) {
            return this._parallaxY * this.tileHeight;
        }
        else if (this._parallaxLoopY) {
            return (this._parallaxY * this.tileHeight) / 2;
        }
        else {
            return 0;
        }
    }
    get tileset() {
        return $dataTilesets[this._tilesetId];
    }
    get tilesetFlags() {
        if (this.tileset) {
            return this.tileset.flags;
        }
        else {
            return [];
        }
    }
    get displayName() {
        return $dataMap.displayName;
    }
    get width() {
        return $dataMap.width;
    }
    get height() {
        return $dataMap.height;
    }
    get data() {
        return $dataMap.data;
    }
    // TODO : map out scrollType
    isLoopHorizontal() {
        return $dataMap.scrollType === 2 || $dataMap.scrollType === 3;
    }
    isLoopVertical() {
        return $dataMap.scrollType === 1 || $dataMap.scrollType === 3;
    }
    isDashDisabled() {
        return $dataMap.disableDashing;
    }
    get encounterList() {
        return $dataMap.encounterList;
    }
    get encounterStep() {
        return $dataMap.encounterStep;
    }
    isOverworld() {
        return this.tileset && this.tileset.mode === TilesetType.OVERWORLD;
    }
    screenTileX() {
        return Math.round((Engine.width / this.tileWidth) * 16) / 16;
    }
    screenTileY() {
        return Math.round((Engine.height / this.tileHeight) * 16) / 16;
    }
    adjustX(x) {
        if (this.isLoopHorizontal() &&
            x < this._displayX - (this.width - this.screenTileX()) / 2) {
            return x - this._displayX + $dataMap.width;
        }
        else {
            return x - this._displayX;
        }
    }
    adjustY(y) {
        if (this.isLoopVertical() &&
            y < this._displayY - (this.height - this.screenTileY()) / 2) {
            return y - this._displayY + $dataMap.height;
        }
        else {
            return y - this._displayY;
        }
    }
    roundX(x) {
        return this.isLoopHorizontal() ? x.mod(this.width) : x;
    }
    roundY(y) {
        return this.isLoopVertical() ? y.mod(this.height) : y;
    }
};

var EasingType;
(function (EasingType) {
    EasingType[EasingType["NONE"] = 0] = "NONE";
    EasingType[EasingType["EASE_IN"] = 1] = "EASE_IN";
    EasingType[EasingType["EASE_OUT"] = 2] = "EASE_OUT";
    EasingType[EasingType["EASE_IN_OUT"] = 3] = "EASE_IN_OUT";
})(EasingType || (EasingType = {}));
class GamePicture {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this.initBasic();
        this.initTarget();
        this.initTone();
        this.initRotation();
    }
    get name() {
        return this._name;
    }
    get origin() {
        return this._origin;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get scaleX() {
        return this._scaleX;
    }
    get scaleY() {
        return this._scaleY;
    }
    get opacity() {
        return this._opacity;
    }
    get blendMode() {
        return this._blendMode;
    }
    get tone() {
        return this._tone;
    }
    get angle() {
        return this._angle;
    }
    initBasic() {
        this._name = "";
        this._origin = 0;
        this._x = 0;
        this._y = 0;
        this._scaleX = 100;
        this._scaleY = 100;
        this._opacity = 255;
        this._blendMode = 0;
    }
    initTarget() {
        this._targetX = this._x;
        this._targetY = this._y;
        this._targetScaleX = this._scaleX;
        this._targetScaleY = this._scaleY;
        this._targetOpacity = this._opacity;
        this._duration = 0;
        this._wholeDuration = 0;
        this._easingType = 0;
        this._easingExponent = 0;
    }
    initTone() {
        this._tone = null;
        this._toneTarget = null;
        this._toneDuration = 0;
    }
    initRotation() {
        this._angle = 0;
        this._rotationSpeed = 0;
    }
    show(name, origin, x, y, scaleX, scaleY, opacity, blendMode) {
        this._name = name;
        this._origin = origin;
        this._x = x;
        this._y = y;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this._opacity = opacity;
        this._blendMode = blendMode;
        this.initTarget();
        this.initTone();
        this.initRotation();
    }
    move(origin, x, y, scaleX, scaleY, opacity, blendMode, duration, easingType) {
        this._origin = origin;
        this._targetX = x;
        this._targetY = y;
        this._targetScaleX = scaleX;
        this._targetScaleY = scaleY;
        this._targetOpacity = opacity;
        this._blendMode = blendMode;
        this._duration = duration;
        this._wholeDuration = duration;
        this._easingType = easingType;
        this._easingExponent = 2;
    }
    rotate(speed) {
        this._rotationSpeed = speed;
    }
    tint(tone, duration) {
        if (!this._tone) {
            this._tone = [0, 0, 0, 0];
        }
        this._toneTarget = tone.clone();
        this._toneDuration = duration;
        if (this._toneDuration === 0) {
            this._tone = this._toneTarget.clone();
        }
    }
    update() {
        this.updateMove();
        this.updateTone();
        this.updateRotation();
    }
    updateMove() {
        if (this._duration > 0) {
            this._x = this.applyEasing(this._x, this._targetX);
            this._y = this.applyEasing(this._y, this._targetY);
            this._scaleX = this.applyEasing(this._scaleX, this._targetScaleX);
            this._scaleY = this.applyEasing(this._scaleY, this._targetScaleY);
            this._opacity = this.applyEasing(this._opacity, this._targetOpacity);
            this._duration--;
        }
    }
    updateTone() {
        if (this._toneDuration > 0) {
            const d = this._toneDuration;
            for (let i = 0; i < 4; i++) {
                this._tone[i] = (this._tone[i] * (d - 1) + this._toneTarget[i]) / d;
            }
            this._toneDuration--;
        }
    }
    updateRotation() {
        if (this._rotationSpeed !== 0) {
            this._angle += this._rotationSpeed / 2;
        }
    }
    applyEasing(current, target) {
        const d = this._duration;
        const wd = this._wholeDuration;
        const lt = this.calcEasing((wd - d) / wd);
        const t = this.calcEasing((wd - d + 1) / wd);
        const start = (current - target * lt) / (1 - lt);
        return start + (target - start) * t;
    }
    calcEasing(t) {
        const exponent = this._easingExponent;
        switch (this._easingType) {
            case EasingType.EASE_IN: // Slow start
                return this.easeIn(t, exponent);
            case EasingType.EASE_OUT: // Slow end
                return this.easeOut(t, exponent);
            case EasingType.EASE_IN_OUT: // Slow start and end
                return this.easeInOut(t, exponent);
            default:
                return t;
        }
    }
    easeIn(t, exponent) {
        return Math.pow(t, exponent);
    }
    easeOut(t, exponent) {
        return 1 - Math.pow(1 - t, exponent);
    }
    easeInOut(t, exponent) {
        if (t < 0.5) {
            return this.easeIn(t * 2, exponent) / 2;
        }
        else {
            return this.easeOut(t * 2 - 1, exponent) / 2 + 0.5;
        }
    }
}

let GamePlayer$1 = class GamePlayer extends GameCharacter {
    initialize() {
        super.initialize();
        this.setTransparent($dataSystem.optTransparent);
    }
    initMembers() {
        super.initMembers();
        this._vehicleType = "walk";
        this._vehicleGettingOn = false;
        this._vehicleGettingOff = false;
        this._dashing = false;
        this._needsMapReload = false;
        this._transferring = false;
        this._newMapId = 0;
        this._newX = 0;
        this._newY = 0;
        this._newDirection = 0;
        this._fadeType = 0;
        this._followers = new GameFollowers();
        this._encounterCount = 0;
    }
    clearTransferInfo() {
        this._transferring = false;
        this._newMapId = 0;
        this._newX = 0;
        this._newY = 0;
        this._newDirection = 0;
    }
    get followers() {
        return this._followers;
    }
    refresh() {
        const actor = $gameParty.leader();
        const characterName = actor ? actor.characterName : "";
        const characterIndex = actor ? actor.characterIndex : 0;
        this.setImage(characterName, characterIndex);
        this._followers.refresh();
    }
    isStopping() {
        if (this._vehicleGettingOn || this._vehicleGettingOff) {
            return false;
        }
        return super.isStopping();
    }
    reserveTransfer(mapId, x, y, d, fadeType) {
        this._transferring = true;
        this._newMapId = mapId;
        this._newX = x;
        this._newY = y;
        this._newDirection = d;
        this._fadeType = fadeType;
    }
    setupForNewGame() {
        const mapId = $dataSystem.startMapId;
        const x = $dataSystem.startX;
        const y = $dataSystem.startY;
        this.reserveTransfer(mapId, x, y, 2, 0);
    }
    requestMapReload() {
        this._needsMapReload = true;
    }
    isTransferring() {
        return this._transferring;
    }
    newMapId() {
        return this._newMapId;
    }
    fadeType() {
        return this._fadeType;
    }
    performTransfer() {
        if (this.isTransferring()) {
            this.setDirection(this._newDirection);
            if (this._newMapId !== $gameMap.mapId() || this._needsMapReload) {
                $gameMap.setup(this._newMapId);
                this._needsMapReload = false;
            }
            this.locate(this._newX, this._newY);
            this.refresh();
            this.clearTransferInfo();
        }
    }
    isMapPassable(x, y, d) {
        const vehicle = this.vehicle();
        if (vehicle) {
            return vehicle.isMapPassable(x, y, d);
        }
        else {
            return super.isMapPassable(x, y, d);
        }
    }
    vehicle() {
        return $gameMap.vehicle(this._vehicleType);
    }
    isInBoat() {
        return this._vehicleType === "boat";
    }
    isInShip() {
        return this._vehicleType === "ship";
    }
    isInAirship() {
        return this._vehicleType === "airship";
    }
    isInVehicle() {
        return this.isInBoat() || this.isInShip() || this.isInAirship();
    }
    isNormal() {
        return this._vehicleType === "walk" && !this.isMoveRouteForcing();
    }
    isDashing() {
        return this._dashing;
    }
    isDebugThrough() {
        return Input.isPressed("control") && $gameTemp.isPlaytest();
    }
    isCollided(x, y) {
        if (this.isThrough()) {
            return false;
        }
        else {
            return this.pos(x, y) || this._followers.isSomeoneCollided(x, y);
        }
    }
    centerX() {
        return ($gameMap.screenTileX() - 1) / 2;
    }
    centerY() {
        return ($gameMap.screenTileY() - 1) / 2;
    }
    center(x, y) {
        return $gameMap.setDisplayPos(x - this.centerX(), y - this.centerY());
    }
    locate(x, y) {
        super.locate(x, y);
        this.center(x, y);
        this.makeEncounterCount();
        if (this.isInVehicle()) {
            this.vehicle().refresh();
        }
        this._followers.synchronize(x, y, this.direction);
    }
    increaseSteps() {
        super.increaseSteps();
        if (this.isNormal()) {
            $gameParty.increaseSteps();
        }
    }
    makeEncounterCount() {
        const n = $gameMap.encounterStep();
        this._encounterCount = Math.randomInt(n) + Math.randomInt(n) + 1;
    }
    makeEncounterTroopId() {
        const encounterList = [];
        let weightSum = 0;
        for (const encounter of $gameMap.encounterList()) {
            if (this.meetsEncounterConditions(encounter)) {
                encounterList.push(encounter);
                weightSum += encounter.weight;
            }
        }
        if (weightSum > 0) {
            let value = Math.randomInt(weightSum);
            for (const encounter of encounterList) {
                value -= encounter.weight;
                if (value < 0) {
                    return encounter.troopId;
                }
            }
        }
        return 0;
    }
    meetsEncounterConditions(encounter) {
        return (encounter.regionSet.length === 0 ||
            encounter.regionSet.includes(this.regionId()));
    }
    executeEncounter() {
        if (!$gameMap.isEventRunning() && this._encounterCount <= 0) {
            this.makeEncounterCount();
            const troopId = this.makeEncounterTroopId();
            if ($dataTroops[troopId]) {
                BattleManager.setup(troopId, true, false);
                BattleManager.onEncounter();
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    startMapEvent(x, y, triggers, normal) {
        if (!$gameMap.isEventRunning()) {
            for (const event of $gameMap.eventsXy(x, y)) {
                if (event.isTriggerIn(triggers) &&
                    event.isNormalPriority() === normal) {
                    event.start();
                }
            }
        }
    }
    moveByInput() {
        if (!this.isMoving() && this.canMove()) {
            let direction = this.getInputDirection();
            if (direction > 0) {
                $gameTemp.clearDestination();
            }
            else if ($gameTemp.isDestinationValid()) {
                const x = $gameTemp.destinationX();
                const y = $gameTemp.destinationY();
                direction = this.findDirectionTo(x, y);
            }
            if (direction > 0) {
                this.executeMove(direction);
            }
        }
    }
    canMove() {
        if ($gameMap.isEventRunning() || $gameMessage.isBusy()) {
            return false;
        }
        if (this.isMoveRouteForcing() || this.areFollowersGathering()) {
            return false;
        }
        if (this._vehicleGettingOn || this._vehicleGettingOff) {
            return false;
        }
        return !(this.isInVehicle() && !this.vehicle().canMove());
    }
    getInputDirection() {
        return Input.dir4;
    }
    executeMove(direction) {
        this.moveStraight(direction);
    }
    update(sceneActive) {
        const lastScrolledX = this.scrolledX();
        const lastScrolledY = this.scrolledY();
        const wasMoving = this.isMoving();
        this.updateDashing();
        if (sceneActive) {
            this.moveByInput();
        }
        super.update();
        this.updateScroll(lastScrolledX, lastScrolledY);
        this.updateVehicle();
        if (!this.isMoving()) {
            this.updateNonmoving(wasMoving, sceneActive);
        }
        this._followers.update();
    }
    updateDashing() {
        if (this.isMoving()) {
            return;
        }
        if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
            this._dashing =
                this.isDashButtonPressed() || $gameTemp.isDestinationValid();
        }
        else {
            this._dashing = false;
        }
    }
    isDashButtonPressed() {
        const shift = Input.isPressed("shift");
        if (ConfigManager.alwaysDash) {
            return !shift;
        }
        else {
            return shift;
        }
    }
    updateScroll(lastScrolledX, lastScrolledY) {
        const x1 = lastScrolledX;
        const y1 = lastScrolledY;
        const x2 = this.scrolledX();
        const y2 = this.scrolledY();
        if (y2 > y1 && y2 > this.centerY()) {
            $gameMap.scrollDown(y2 - y1);
        }
        if (x2 < x1 && x2 < this.centerX()) {
            $gameMap.scrollLeft(x1 - x2);
        }
        if (x2 > x1 && x2 > this.centerX()) {
            $gameMap.scrollRight(x2 - x1);
        }
        if (y2 < y1 && y2 < this.centerY()) {
            $gameMap.scrollUp(y1 - y2);
        }
    }
    updateVehicle() {
        if (this.isInVehicle() && !this.areFollowersGathering()) {
            if (this._vehicleGettingOn) {
                this.updateVehicleGetOn();
            }
            else if (this._vehicleGettingOff) {
                this.updateVehicleGetOff();
            }
            else {
                this.vehicle().syncWithPlayer();
            }
        }
    }
    updateVehicleGetOn() {
        if (!this.areFollowersGathering() && !this.isMoving()) {
            this.setDirection(this.vehicle().direction());
            this.moveSpeed = this.vehicle().moveSpeed();
            this._vehicleGettingOn = false;
            this.setTransparent(true);
            if (this.isInAirship()) {
                this.setThrough(true);
            }
            this.vehicle().getOn();
        }
    }
    updateVehicleGetOff() {
        if (!this.areFollowersGathering() && this.vehicle().isLowest()) {
            this._vehicleGettingOff = false;
            this._vehicleType = "walk";
            this.setTransparent(false);
        }
    }
    updateNonmoving(wasMoving, sceneActive) {
        if (!$gameMap.isEventRunning()) {
            if (wasMoving) {
                $gameParty.onPlayerWalk();
                this.checkEventTriggerHere([1, 2]);
                if ($gameMap.setupStartingEvent()) {
                    return;
                }
            }
            if (sceneActive && this.triggerAction()) {
                return;
            }
            if (wasMoving) {
                this.updateEncounterCount();
            }
            else {
                $gameTemp.clearDestination();
            }
        }
    }
    triggerAction() {
        if (this.canMove()) {
            if (this.triggerButtonAction()) {
                return true;
            }
            if (this.triggerTouchAction()) {
                return true;
            }
        }
        return false;
    }
    triggerButtonAction() {
        if (Input.isTriggered("ok")) {
            if (this.getOnOffVehicle()) {
                return true;
            }
            this.checkEventTriggerHere([0]);
            if ($gameMap.setupStartingEvent()) {
                return true;
            }
            this.checkEventTriggerThere([0, 1, 2]);
            if ($gameMap.setupStartingEvent()) {
                return true;
            }
        }
        return false;
    }
    triggerTouchAction() {
        if ($gameTemp.isDestinationValid()) {
            const direction = this.direction;
            const x1 = this.x;
            const y1 = this.y;
            const x2 = $gameMap.roundXWithDirection(x1, direction);
            const y2 = $gameMap.roundYWithDirection(y1, direction);
            const x3 = $gameMap.roundXWithDirection(x2, direction);
            const y3 = $gameMap.roundYWithDirection(y2, direction);
            const destX = $gameTemp.destinationX();
            const destY = $gameTemp.destinationY();
            if (destX === x1 && destY === y1) {
                return this.triggerTouchActionD1(x1, y1);
            }
            else if (destX === x2 && destY === y2) {
                return this.triggerTouchActionD2(x2, y2);
            }
            else if (destX === x3 && destY === y3) {
                return this.triggerTouchActionD3(x2, y2);
            }
        }
        return false;
    }
    triggerTouchActionD1(x1, y1) {
        if ($gameMap.airship().pos(x1, y1)) {
            if (TouchInput.isTriggered() && this.getOnOffVehicle()) {
                return true;
            }
        }
        this.checkEventTriggerHere([0]);
        return $gameMap.setupStartingEvent();
    }
    triggerTouchActionD2(x2, y2) {
        if ($gameMap.boat().pos(x2, y2) || $gameMap.ship().pos(x2, y2)) {
            if (TouchInput.isTriggered() && this.getOnVehicle()) {
                return true;
            }
        }
        if (this.isInBoat() || this.isInShip()) {
            if (TouchInput.isTriggered() && this.getOffVehicle()) {
                return true;
            }
        }
        this.checkEventTriggerThere([0, 1, 2]);
        return $gameMap.setupStartingEvent();
    }
    triggerTouchActionD3(x3, y3) {
        if ($gameMap.isCounter(x3, y3)) {
            this.checkEventTriggerThere([0, 1, 2]);
        }
        return $gameMap.setupStartingEvent();
    }
    updateEncounterCount() {
        if (this.canEncounter()) {
            this._encounterCount -= this.encounterProgressValue();
        }
    }
    canEncounter() {
        return (!$gameParty.hasEncounterNone() &&
            $gameSystem.isEncounterEnabled() &&
            !this.isInAirship() &&
            !this.isMoveRouteForcing() &&
            !this.isDebugThrough());
    }
    encounterProgressValue() {
        let value = $gameMap.isBush(this.x, this.y) ? 2 : 1;
        if ($gameParty.hasEncounterHalf()) {
            value *= 0.5;
        }
        if (this.isInShip()) {
            value *= 0.5;
        }
        return value;
    }
    checkEventTriggerHere(triggers) {
        if (this.canStartLocalEvents()) {
            this.startMapEvent(this.x, this.y, triggers, false);
        }
    }
    checkEventTriggerThere(triggers) {
        if (this.canStartLocalEvents()) {
            const direction = this.direction;
            const x1 = this.x;
            const y1 = this.y;
            const x2 = $gameMap.roundXWithDirection(x1, direction);
            const y2 = $gameMap.roundYWithDirection(y1, direction);
            this.startMapEvent(x2, y2, triggers, true);
            if (!$gameMap.isAnyEventStarting() && $gameMap.isCounter(x2, y2)) {
                const x3 = $gameMap.roundXWithDirection(x2, direction);
                const y3 = $gameMap.roundYWithDirection(y2, direction);
                this.startMapEvent(x3, y3, triggers, true);
            }
        }
    }
    checkEventTriggerTouch(x, y) {
        if (this.canStartLocalEvents()) {
            this.startMapEvent(x, y, [1, 2], true);
        }
    }
    canStartLocalEvents() {
        return !this.isInAirship();
    }
    getOnOffVehicle() {
        if (this.isInVehicle()) {
            return this.getOffVehicle();
        }
        else {
            return this.getOnVehicle();
        }
    }
    getOnVehicle() {
        const direction = this.direction;
        const x1 = this.x;
        const y1 = this.y;
        const x2 = $gameMap.roundXWithDirection(x1, direction);
        const y2 = $gameMap.roundYWithDirection(y1, direction);
        if ($gameMap.airship().pos(x1, y1)) {
            this._vehicleType = "airship";
        }
        else if ($gameMap.ship().pos(x2, y2)) {
            this._vehicleType = "ship";
        }
        else if ($gameMap.boat().pos(x2, y2)) {
            this._vehicleType = "boat";
        }
        if (this.isInVehicle()) {
            this._vehicleGettingOn = true;
            if (!this.isInAirship()) {
                this.forceMoveForward();
            }
            this.gatherFollowers();
        }
        return this._vehicleGettingOn;
    }
    getOffVehicle() {
        if (this.vehicle().isLandOk(this.x, this.y, this.direction)) {
            if (this.isInAirship()) {
                this.setDirection(2);
            }
            this._followers.synchronize(this.x, this.y, this.direction);
            this.vehicle().getOff();
            if (!this.isInAirship()) {
                this.forceMoveForward();
                this.setTransparent(false);
            }
            this._vehicleGettingOff = true;
            this.moveSpeed = 4;
            this.setThrough(false);
            this.makeEncounterCount();
            this.gatherFollowers();
        }
        return this._vehicleGettingOff;
    }
    forceMoveForward() {
        this.setThrough(true);
        this.moveForward();
        this.setThrough(false);
    }
    isOnDamageFloor() {
        return $gameMap.isDamageFloor(this.x, this.y) && !this.isInAirship();
    }
    moveStraight(d) {
        if (this.canPass(this.x, this.y, d)) {
            this._followers.updateMove();
        }
        super.moveStraight(d);
    }
    moveDiagonally(horz, vert) {
        if (this.canPassDiagonally(this.x, this.y, horz, vert)) {
            this._followers.updateMove();
        }
        super.moveDiagonally(horz, vert);
    }
    jump(xPlus, yPlus) {
        super.jump(xPlus, yPlus);
        this._followers.jumpAll();
    }
    showFollowers() {
        this._followers.show();
    }
    hideFollowers() {
        this._followers.hide();
    }
    gatherFollowers() {
        this._followers.gather();
    }
    areFollowersGathering() {
        return this._followers.areGathering();
    }
    areFollowersGathered() {
        return this._followers.areGathered();
    }
};

/**
 * The game object class for screen effect data, such as changes in color tone and flashes
 */
let GameScreen$1 = class GameScreen {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
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
    onBattleStart() {
        this.clearFade();
        this.clearFlash();
        this.clearShake();
        this.clearZoom();
        this.eraseBattlePictures();
    }
    get brightness() {
        return this._brightness;
    }
    get tone() {
        return this._tone;
    }
    get flashColor() {
        return this._flashColor;
    }
    get shake() {
        return this._shake;
    }
    get zoomX() {
        return this._zoomX;
    }
    get zoomY() {
        return this._zoomY;
    }
    get zoomScale() {
        return this._zoomScale;
    }
    get weatherType() {
        return this._weatherType;
    }
    get weatherPower() {
        return this._weatherPower;
    }
    picture(pictureId) {
        const realPictureId = this.realPictureId(pictureId);
        return this._pictures[realPictureId];
    }
    realPictureId(pictureId) {
        if ($gameParty.inBattle()) {
            return pictureId + this.maxPictures();
        }
        else {
            return pictureId;
        }
    }
    clearFade() {
        this._brightness = 255;
        this._fadeOutDuration = 0;
        this._fadeInDuration = 0;
    }
    clearTone() {
        this._tone = [0, 0, 0, 0];
        this._toneTarget = [0, 0, 0, 0];
        this._toneDuration = 0;
    }
    clearFlash() {
        this._flashColor = [0, 0, 0, 0];
        this._flashDuration = 0;
    }
    clearShake() {
        this._shakePower = 0;
        this._shakeSpeed = 0;
        this._shakeDuration = 0;
        this._shakeDirection = 1;
        this._shake = 0;
    }
    clearZoom() {
        this._zoomX = 0;
        this._zoomY = 0;
        this._zoomScale = 1;
        this._zoomScaleTarget = 1;
        this._zoomDuration = 0;
    }
    clearWeather() {
        this._weatherType = "none";
        this._weatherPower = 0;
        this._weatherPowerTarget = 0;
        this._weatherDuration = 0;
    }
    clearPictures() {
        this._pictures = [];
    }
    eraseBattlePictures() {
        this._pictures = this._pictures.slice(0, this.maxPictures() + 1);
    }
    maxPictures() {
        return 100;
    }
    startFadeOut(duration) {
        this._fadeOutDuration = duration;
        this._fadeInDuration = 0;
    }
    startFadeIn(duration) {
        this._fadeInDuration = duration;
        this._fadeOutDuration = 0;
    }
    startTint(tone, duration) {
        this._toneTarget = tone.clone();
        this._toneDuration = duration;
        if (this._toneDuration !== 0)
            return;
        this._tone = this._toneTarget.clone();
    }
    startFlash(color, duration) {
        this._flashColor = color.clone();
        this._flashDuration = duration;
    }
    startShake(power, speed, duration) {
        this._shakePower = power;
        this._shakeSpeed = speed;
        this._shakeDuration = duration;
    }
    startZoom(x, y, scale, duration) {
        this._zoomX = x;
        this._zoomY = y;
        this._zoomScaleTarget = scale;
        this._zoomDuration = duration;
    }
    setZoom(x, y, scale) {
        this._zoomX = x;
        this._zoomY = y;
        this._zoomScale = scale;
    }
    changeWeather(type, power, duration) {
        if (type !== "none" || duration === 0) {
            this._weatherType = type;
        }
        this._weatherPowerTarget = type === "none" ? 0 : power;
        this._weatherDuration = duration;
        if (duration === 0) {
            this._weatherPower = this._weatherPowerTarget;
        }
    }
    update() {
        this.updateFadeOut();
        this.updateFadeIn();
        this.updateTone();
        this.updateFlash();
        this.updateShake();
        this.updateZoom();
        this.updateWeather();
        this.updatePictures();
    }
    updateFadeOut() {
        if (this._fadeOutDuration > 0) {
            const d = this._fadeOutDuration;
            this._brightness = (this._brightness * (d - 1)) / d;
            this._fadeOutDuration--;
        }
    }
    updateFadeIn() {
        if (this._fadeInDuration > 0) {
            const d = this._fadeInDuration;
            this._brightness = (this._brightness * (d - 1) + 255) / d;
            this._fadeInDuration--;
        }
    }
    updateTone() {
        if (this._toneDuration > 0) {
            const d = this._toneDuration;
            for (let i = 0; i < 4; i++) {
                this._tone[i] = (this._tone[i] * (d - 1) + this._toneTarget[i]) / d;
            }
            this._toneDuration--;
        }
    }
    updateFlash() {
        if (this._flashDuration > 0) {
            const d = this._flashDuration;
            this._flashColor[3] *= (d - 1) / d;
            this._flashDuration--;
        }
    }
    updateShake() {
        if (this._shakeDuration > 0 || this._shake !== 0) {
            const delta = (this._shakePower * this._shakeSpeed * this._shakeDirection) / 10;
            if (this._shakeDuration <= 1 &&
                this._shake * (this._shake + delta) < 0) {
                this._shake = 0;
            }
            else {
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
    updateZoom() {
        if (this._zoomDuration > 0) {
            const d = this._zoomDuration;
            const t = this._zoomScaleTarget;
            this._zoomScale = (this._zoomScale * (d - 1) + t) / d;
            this._zoomDuration--;
        }
    }
    updateWeather() {
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
    updatePictures() {
        for (const picture of this._pictures) {
            if (picture) {
                picture.update();
            }
        }
    }
    startFlashForDamage() {
        this.startFlash([255, 0, 0, 128], 8);
    }
    showPicture(pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode) {
        const realPictureId = this.realPictureId(pictureId);
        const picture = new GamePicture();
        picture.show(name, origin, x, y, scaleX, scaleY, opacity, blendMode);
        this._pictures[realPictureId] = picture;
    }
    //TODO : make the parameters a lil better
    movePicture(pictureId, origin, x, y, scaleX, scaleY, opacity, blendMode, duration, easingType) {
        const picture = this.picture(pictureId);
        if (picture) {
            // prettier-ignore
            picture.move(origin, x, y, scaleX, scaleY, opacity, blendMode, duration, easingType);
        }
    }
    rotatePicture(pictureId, speed) {
        const picture = this.picture(pictureId);
        if (picture) {
            picture.rotate(speed);
        }
    }
    tintPicture(pictureId, tone, duration) {
        const picture = this.picture(pictureId);
        if (picture) {
            picture.tint(tone, duration);
        }
    }
    erasePicture(pictureId) {
        const realPictureId = this.realPictureId(pictureId);
        this._pictures[realPictureId] = null;
    }
};

let GameTemp$1 = class GameTemp {
    constructor() {
        this.initialize(...arguments);
    }
    initialize(...args) {
        this._isPlaytest = Utils.isOptionValid('test');
        this._destinationX = null;
        this._destinationY = null;
        this._touchTarget = null;
        this._touchState = '';
        this._needsBattleRefresh = false;
        this._commonEventQueue = [];
        this._animationQueue = [];
        this._lastActionData = [0, 0, 0, 0, 0, 0];
    }
    /**
     * check whether the game is in playtest mode or not.
     */
    isPlaytest() {
        return this._isPlaytest;
    }
    setDestination(x, y) {
        this._destinationX = x;
        this._destinationY = y;
    }
    clearDestination() {
        this._destinationX = null;
        this._destinationY = null;
    }
    isDestinationValid() {
        return this._destinationX !== null;
    }
    get destinationX() {
        return this._destinationX;
    }
    get destinationY() {
        return this._destinationY;
    }
    setTouchState(target, state) {
        this._touchTarget = target;
        this._touchState = state;
    }
    clearTouchState() {
        this._touchTarget = null;
        this._touchState = '';
    }
    get touchTarget() {
        return this._touchTarget;
    }
    get touchState() {
        return this._touchState;
    }
    requestBattleRefresh() {
        if (!$gameParty.inBattle())
            return;
        this._needsBattleRefresh = true;
    }
    clearBattleRefreshRequest() {
        this._needsBattleRefresh = false;
    }
    isBattleRefreshRequested() {
        return this._needsBattleRefresh;
    }
    reserveCommonEvent(commonEventId) {
        this._commonEventQueue.push(commonEventId);
    }
    retrieveCommonEvent() {
        return $dataCommonEvents[this._commonEventQueue.shift()];
    }
    clearCommonEventReservation() {
        this._commonEventQueue.length = 0;
    }
    isCommonEventReserved() {
        return this._commonEventQueue.length > 0;
    }
    requestAnimation(targets, animationId, mirror = false) {
        if (!$dataAnimations[animationId])
            return;
        const request = {
            targets: targets,
            animationId: animationId,
            mirror: mirror
        };
        this._animationQueue.push(request);
        for (const target of targets) {
            if (target.startAnimation) {
                target.startAnimation();
            }
        }
    }
    retrieveAnimation() {
        return this._animationQueue.shift();
    }
    requestBalloon(target, balloonId) {
        const request = { target: target, balloonId: balloonId };
        this._balloonQueue.push(request);
        if (target.startBalloon) {
            target.startBalloon();
        }
    }
    retrieveBalloon() {
        return this._balloonQueue.shift();
    }
    lastActionData(type) {
        return this._lastActionData[type] || 0;
    }
    setLastActionData(type, value) {
        this._lastActionData[type] = value;
    }
    setLastUsedSkillId(skillId) {
        this.setLastActionData(0, skillId);
    }
    setLastUsedItemId(itemId) {
        this.setLastActionData(1, itemId);
    }
    setLastSubjectActorId(actorId) {
        this.setLastActionData(2, actorId);
    }
    setLastSubjectEnemyIndex(enemyIndex) {
        this.setLastActionData(3, enemyIndex);
    }
    setLastTargetActorId(actorId) {
        this.setLastActionData(4, actorId);
    }
    setLastTargetEnemyIndex(enemyIndex) {
        this.setLastActionData(5, enemyIndex);
    }
};

class SceneBase extends Stage {
    constructor() {
        super();
    }
    initialize() {
    }
    async create() {
        throw new Error('Method not implemented.');
    }
    start() {
        throw new Error('Method not implemented.');
    }
    async terminate() {
        throw new Error('Method not implemented.');
    }
    update() {
        throw new Error('Method not implemented.');
    }
}

export { $dataActors, $dataAnimations, $dataArmors, $dataClasses, $dataCommonEvents, $dataEnemies, $dataItems, $dataMap, $dataMapInfos, $dataSkills, $dataStates, $dataSystem, $dataTilesets, $dataTroops, $dataWeapons, $gameActors, $gameMap, $gameMessage, $gameParty, $gamePlayer, $gameScreen, $gameSelfSwitches, $gameSwitches, $gameSystem, $gameTemp, $gameTimer, $gameTroop, $gameVariables, $testEvent, ActionEffect, BattleSystem, Bitmap, ChoicePositionType, CollapseType, ColorFilter, CommonEventTrigger, DataManager, Direction, DropItemKind, EasingType, Engine, EventTrigger, FPSCounter, FlagId, GameAction, GameActionResult, GameActor, GameActors, GameBattler, GameBattlerBase, GameCamera, GameCharacter, GameCharacterBase, GameCommonEvent, GameEnemy, GameEvent, GameFollower, GameFollowers, GameInterpreter$1 as GameInterpreter, GameItem, GameMap$1 as GameMap, GameMessage, GameParty, GamePicture, GamePlayer$1 as GamePlayer, GameScreen$1 as GameScreen, GameSelfSwitches, GameSwitches, GameSystem, GameTemp$1 as GameTemp, GameTimer, GameTroop, GameUnit, GameVariables, GameVehicle, HitType, IconStart, ImageManager$1 as ImageManager, Input, ItemType, JsonEx, JsonFormatLevel, LoadingState, MessageBackground, MessagePositionType, MoveType, OccasionType, PartyAbility, PingPongBuffer, PriorityType, Route, RpgWindow, SceneBase, SceneManager, ScopeType, Sprite, Stack, Stage, StorageManager, TextManager, TilesetType, Traits, Utils, Video, WebAudio };
