(() => {


  /**
   *
   * @type {ICursorOptions}
   */
  const _options = {
    animated: true,

  }

  class Test extends Sprite_Clickable {

    constructor (test) {
      super(test)
    }

    initialize (test) {
      super.initialize()
      const damp = test || 'non initialized!'
      console.log(damp)
    }
  }

  /**
   * Represents an animated cursor sprite.
   */
  class AnimatedCursor extends Sprite {
    constructor (bitmap, options) {
      super(bitmap, options)
      //this.initialize(bitmap, options)
    }

    initialize (bitmap, options) {
      super.initialize(bitmap, options)
      this._offset = options.offset || new Point(100, 100)
      this._bounceSpeed = Math.PI / options.bounceSpeed || Math.PI / 60
      this._maxBounceWidth = 10
      this._targetPos = new Point(100, 100)
      this._isMoving = false
      this._lerpFactor = options.lerpFactor || 0.3
      this._bounceAmplitude = 1.0
      this._amplitudeEaseFactor = options.amplitudeEaseFactor || 0.05
      this._restoringBounce = false
      this._pattern = 0
      this._isAnimated = options.animated || false
      this._isBouncing = options.bouncing || false
      this._frameWidth = options.cursorWidth || 60
    }

    update () {
      super.update()
      if (this._isMoving) {
        this.lerpAnimation()
      } else if (this._isBouncing) {
        if (this._restoringBounce) {
          this._bounceAmplitude += this._amplitudeEaseFactor
          if (this._bounceAmplitude > 1.0) {
            this._bounceAmplitude = 1.0
            this._restoringBounce = false
          }
        }
        this.updateBouncing()
      }
      if (this._isAnimated) {
        this.updateFrame()
      }
    }

    /**
     * Move the cursor to position
     * @param x
     * @param y
     */
    moveToPos (x, y) {
      if (x === 0) {
        x = this._offset.x
      }
      this._targetPos.x = x
      this._targetPos.y = y
      this._isMoving = true
    }

    lerpAnimation () {
      const dx = this._targetPos.x - this.x
      const dy = this._targetPos.y - this.y
      if (Math.abs(dx) > 0.01) {
        this.x += dx * this._lerpFactor
        this._bounceAmplitude *= 0.7
      } else if (Math.abs(dy) > 0.01) {
        this.y += dy * this._lerpFactor
        this._bounceAmplitude *= 0.7
      } else {
        this._isMoving = false
        this._bounceAmplitude = 0.0
        this._restoringBounce = true
      }
    }

    updateBouncing () {
      const offset = this._offset
      const b = this._bounceSpeed
      const maxB = this._maxBounceWidth * this._bounceAmplitude
      this.x = offset.x + Math.sin(Graphics.frameCount * b) * maxB
    }

    updateFrame () {
      this._pattern = (this._pattern + 1) % Math.floor(this.bitmap.width / this._frameWidth)
      const cw = this._frameWidth
      const ch = this.bitmap.height
      this.setFrame(this._pattern * cw, 0, cw, ch)
    }
  }

  const proto = Scene_Title.prototype

  const alias = {}

  alias.ini01 = proto.initialize
  proto.initialize = function () {
    alias.ini01.call(this)

  }

  alias.crea = proto.create
  proto.create = function () {
    alias.crea.call(this)
    const bitmap = ImageManager.loadSystem('cursor')
    this._cursor = new AnimatedCursor(bitmap, _options)
    this._position = new Point(0, 0)
    this.addChild(this._cursor)
    var something = new Test()
    this.addChild(something)

  }

  alias.start01 = proto.start
  proto.start = function () {
    alias.start01.call(this)

  }
  alias.up01 = proto.update
  proto.update = function () {
    alias.up01.call(this)
    if (Input.isPressed('up')) {
      this._cursor.moveToPos(0, 0)
    }
    if (Input.isPressed('down')) {
      this._cursor.moveToPos(0, 100)
    }
  }

})()
