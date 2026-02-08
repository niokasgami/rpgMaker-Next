/*:
  * @target MZ
  * @plugindesc the gear plugin that rework the whole Menu System
  * @author Nio Kasgami
  * @pluginname Gear_TitleScreen
  * @modulename Gear
  * @help
  *
  * ==========================================================================
  *  + Changelog
  * --------------------------------------------------------------------------
  *  + initial release
  *  + many Inc0der-shrooms died for this plugin
  *
  */

//===========================================================
// The code under has been generated via tooling and
// typescript and is not exactly suitable for edits.
//===========================================================

var Gear = (function (exports) {
'use strict';

class Scene_Titlescreen extends Scene_Base {
    constructor() {
        super();
    }
    initialize() {
        super.initialize();
    }
    create() {
        super.create();
    }
    start() {
        super.start();
        // Your code here
    }
    update() {
        super.update();
    }
}
window["Scene_Title"] = Scene_Titlescreen;

/**
 * Represents an animated cursor sprite.
 */
class AnimatedCursor extends Sprite {
    constructor(bitmap, options) {
        super(bitmap, options);
    }
    initialize(bitmap, options) {
        super.initialize(bitmap);
        this._offset = options.offset || new Point(100, 100);
        this._bounceSpeed = Math.PI / options.bounceSpeed || Math.PI / 60;
        this._maxBounceWidth = 10;
        this._targetPos = new Point(100, 100);
        this._isMoving = false;
        this._lerpFactor = options.lerpFactor || 0.3;
        this._bounceAmplitude = 1.0;
        this._amplitudeEaseFactor = options.amplitudeEaseFactor || 0.05;
        this._restoringBounce = false;
        this._pattern = 0;
        this._isAnimated = options.animated || false;
        this._isBouncing = options.bouncing || false;
        this._frameWidth = options.cursorWidth || 60;
    }
    update() {
        super.update();
        if (this._isMoving) {
            this.lerpAnimation();
        }
        else if (this._isBouncing) {
            if (this._restoringBounce) {
                this._bounceAmplitude += this._amplitudeEaseFactor;
                if (this._bounceAmplitude > 1.0) {
                    this._bounceAmplitude = 1.0;
                    this._restoringBounce = false;
                }
            }
            this.updateBouncing();
        }
        if (this._isAnimated) {
            this.updateFrame();
        }
    }
    /**
     * Move the cursor to position
     * @param x
     * @param y
     */
    moveToPos(x, y) {
        this._targetPos.x = x;
        this._targetPos.y = y;
        this._isMoving = true;
    }
    lerpAnimation() {
        const dx = this._targetPos.x - this.x;
        const dy = this._targetPos.y - this.y;
        if (Math.abs(dx) > 0.01) {
            this.x += dx * this._lerpFactor;
            this._bounceAmplitude *= 0.7;
        }
        else if (Math.abs(dy) > 0.01) {
            this.y += dy * this._lerpFactor;
            this._bounceAmplitude *= 0.7;
        }
        else {
            this._isMoving = false;
            this._bounceAmplitude = 0.0;
            this._restoringBounce = true;
        }
    }
    updateBouncing() {
        const offset = this._offset;
        const b = this._bounceSpeed;
        const maxB = this._maxBounceWidth * this._bounceAmplitude;
        this.x = offset.x + Math.sin(Graphics.frameCount * b) * maxB;
    }
    updateFrame() {
        this._pattern = (this._pattern + 1) % Math.floor(this.bitmap.width / this._frameWidth);
        const cw = this._frameWidth;
        const ch = this.bitmap.height;
        this.setFrame(this._pattern * cw, 0, cw, ch);
    }
}

exports.AnimatedCursor = AnimatedCursor;
exports.Scene_Titlescreen = Scene_Titlescreen;

return exports;

})({});
