/*:
 * @pluginname gear-tools
 * @plugindesc the gear plugin that allow to improve the splash screen system
 * @modulename gear
 * @author nio kasgami
 * 
 * @param playMe
 * @text play ME
 * @desc enable the playback for ME
 * @type boolean
 * @default true
 * @on yes
 * @off no
 * 
 * @param fadeSpeed
 * @text fade speed
 * @desc the speed the sprite take to fade in/out
 * @type number
 * @default 24
 * @param logos
 * @desc the list of logos to display
 * @type struct<logo>[]
 * @default []
 * 
 * @help
 * this plugin does not provide any plugin command
 * 
*/

/*~struct~logo:
 *  
 * @param filename
 * @desc the splashscreen filename
 * @type file
 * @dir img/system/
 * @default 
 * 
 * @param duration
 * @desc the number of frames that the logo stay on
 * @type number
 * @default 120
 * 
 * @param me
 * @desc the me file to play when the logo appear left it empty for 
 * @type file
 * @dir audio/me
 * @default 
 */
(function () {
'use strict';

/**
 * the utility class that provide helper functions for
 * ease plugin development
 */
class PluginHelper {
    /**
     * find the current active plugin and return its parse params.
     * @returns {any}
     */
    static fetchAndParse() {
        //@ts-ignore
        const currentScript = document.currentScript.src.match(/.+\/(.+)\.js/)[1];
        return this.parse(PluginManager.parameters(currentScript));
    }
    /**
     * Load a bitmap from a custom directory.
     * @param dir the directory name
     * @param filename the file name to load
     * @returns
     */
    static loadCustomDir(dir, filename) {
        return ImageManager.loadBitmap(`img/${dir}/`, filename);
    }
    static parse(parameters) {
        function parseParameters(object) {
            try {
                return JSON.parse(object, (key, value) => {
                    try {
                        return parseParameters(value);
                    }
                    catch (e) {
                        return value;
                    }
                });
            }
            catch (e) {
                return object;
            }
        }
        return parseParameters(JSON.stringify(parameters));
    }
}

const params = PluginHelper.fetchAndParse();

/**
 * The gear class that display an improved splash screen
 */
class Scene_Splashscreen extends Scene_Base {
    constructor() {
        super();
    }
    initialize() {
        super.initialize();
        this._sprites = [];
        this._waitCount = 0;
        this._index = 0;
        this._swapping = false;
    }
    create() {
        super.create();
        if (this.isEnabled()) {
            this.createSprites();
        }
    }
    start() {
        super.start();
        if (!this.isEnabled())
            return;
        this.adjustSprites();
        this._sprites[this._index].visible = true;
        this.initWaitCount();
        this.startFadeIn(this.fadeSpeed(), false);
        //if (!this.params().playMe) return;
        //this.playMe();
    }
    update() {
        super.update();
        if (this.isActive && !this.canGoToNextScene()) {
            if (!this.isBusy() && this._swapping) {
                this.displayNextSprite();
                return;
            }
            if (!this.updateWaitCount() && !this.isBusy() && !this._swapping) {
                this._index++;
                this.startFadeOut(this.params().fadeSpeed);
                this._swapping = true;
            }
            this.checkSkip();
        }
        else {
            this.gotoTite();
        }
    }
    stop() {
        super.stop();
        if (this.isEnabled()) {
            this.startFadeOut(this.params().fadeSpeed);
        }
    }
    createSprites() {
        var files = this.params().logos;
        for (let i = 0; i < files.length; i++) {
            const bitmap = ImageManager.loadSystem(files[i].filename);
            const sprite = new Sprite(bitmap);
            sprite.visible = false;
            this.addChild(sprite);
            this._sprites.push(sprite);
        }
        console.log(this._sprites);
    }
    adjustSprites() {
        for (const sprite of this._sprites) {
            this.scaleSprite(sprite);
            this.centerSprite(sprite);
        }
    }
    isEnabled() {
        return $dataSystem.optSplashScreen;
    }
    initWaitCount() {
        if (this.isEnabled()) {
            this._waitCount = this.logo().duration;
        }
        else {
            this._waitCount = 0;
        }
    }
    updateWaitCount() {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        }
        return false;
    }
    displayNextSprite() {
        this._sprites[0].visible = false;
        this._sprites[1].visible = true;
        this._waitCount = 120;
        this._swapping = false;
        this.startFadeIn(params.fadeSpeed);
    }
    checkSkip() {
        if (Input.isTriggered("ok") || TouchInput.isTriggered()) {
            this._waitCount = 0;
            this._index++;
        }
    }
    gotoTite() {
        SceneManager.goto(Scene_Title);
    }
    playMe() {
        if (this.logo().me === "")
            return;
        const audio = {
            name: this.logo().filename,
            volume: 100,
            pitch: 100
        };
        AudioManager.playMe(audio);
    }
    params() {
        return params;
    }
    // TODO : refactor this
    logo() {
        return params.logos[this._index];
    }
    canGoToNextScene() {
        return this._index > this.params().logos.length;
    }
}

// overwrite function
Scene_Boot.prototype.startNormalGame = function () {
    this.checkPlayerLocation();
    DataManager.setupNewGame();
    Window_TitleCommand.initCommandPosition();
    SceneManager.goto(Scene_Splashscreen);
};

})();
