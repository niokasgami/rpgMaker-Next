import { Application, Container, RenderTexture, Graphics, Assets, EventEmitter, Sprite, FillGradient, Rectangle, Texture, Point, Color } from 'pixi.js';

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

class Stage extends Container {
    constructor() {
        super();
        this.initialize(...arguments);
    }
}

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
        this._currentSource = null;
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
        this._originalSprite = new Sprite();
        this._blitSprite = new Sprite();
        this._graphics = new Graphics();
        this._gradient = new FillGradient({ type: 'linear', textureSpace: 'local' });
        if (width > 0 && height > 0) {
            this.createRenderTexture(width, height);
        }
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
    // TODO : implement the snap function
    static snap(stage) {
        return null;
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
    get currentSource() {
        return this._currentSource;
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
        this._currentSource.destroy();
        this._currentSource = null;
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
        this._currentSource.resize(width, height);
        this._currentSource.update();
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
        const { x: sx, y: sy, width: sw, height: sh } = sourceRect;
        const { x: dx, y: dy } = destRect;
        const dw = destRect.width || sw;
        const dh = destRect.height || sh;
        if (!this._texture || !source._texture)
            return;
        try {
            const renderer = Engine.app.renderer;
            this._originalSprite.texture = this._texture;
            this._blitSprite.texture = new Texture({
                source: source._texture.source,
                frame: new Rectangle(sx, sy, sw, sh)
            });
            this._blitSprite.position.set(dx, dy);
            this._blitSprite.scale.set(dw / sw, dh / sh);
            this._alphaContainer.addChild(this._originalSprite, this._blitSprite);
            renderer.render({ container: this._alphaContainer, target: this._currentSource, clear: false });
            this._alphaContainer.removeChild(this._originalSprite, this._blitSprite);
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
        const pixels = Engine.app.renderer.extract.pixels(this._texture).pixels;
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
        const pixels = Engine.app.renderer.extract.pixels(this._texture).pixels;
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
        const renderer = Engine.app.renderer;
        this._originalSprite.texture = Texture.WHITE;
        this._originalSprite.position.set(x, y);
        this._originalSprite.scale.set(width / this._texture.width, height / this._texture.height);
        this._originalSprite.blendMode = 'erase';
        renderer.render({ container: this._originalSprite, target: this._currentSource, clear: false });
        this._texture = this._currentSource;
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
    /// PRIVATE FUNCTION
    createRenderTexture(width, height) {
        this._currentSource = RenderTexture.create({
            width: width,
            height: height,
            scaleMode: this._scaleMode,
            resolution: 1
        });
    }
    async startLoading() {
        this._loadingState = LoadingState.LOADING;
        try {
            this._texture = await this._assets.load(this._url);
            this._width = this._texture.width;
            this._height = this._texture.height;
            this._buffer.resize(this._width, this._height);
            this.ensureRenderTexture();
            this._currentSource.resize(this._width, this._height);
            this._loadingState = LoadingState.LOADED;
            this._eventEmitter.emit('load');
        }
        catch (e) {
            this._loadingState = LoadingState.ERROR;
            this._eventEmitter.emit('error', e);
        }
    }
    ensureRenderTexture() {
        if (!this._buffer.hasSource()) {
            console.log('ping');
            this._originalSprite.texture = this._texture;
            this._buffer.assign(this._originalSprite);
        }
        if (!this._currentSource) {
            if (this._texture) {
                this.createRenderTexture(this._texture.width, this._texture.height);
                this._width = this._texture.width;
                this._height = this._texture.height;
            }
        }
        else {
            this.createRenderTexture(0, 0);
            this._width = 0;
            this._height = 0;
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

export { Bitmap, Engine, LoadingState, PingPongBuffer, Stack, Stage, Utils, Video };
