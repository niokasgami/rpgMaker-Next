import {
  AlphaFilter,
  Container,
  ContainerChild,
  Graphics,
  Point,
  Rectangle,
  UpdateTransformOptions
} from 'pixi.js';
import { Bitmap } from '@core/Bitmap.ts';
import { Sprite } from '@core/Sprite.ts';
import { NineSliceSprite } from '@core/NineSliceSprite.ts';
import { TilingSprite } from '@core/TilingSprite.ts';


export interface UpdatableChildren extends ContainerChild {
  update(): void;
}

/**
 * The window in the game.
 * @remarks was previously named Window but was renamed due to the clash with the standard window scope class!
 */
export abstract class RpgWindow extends Container {

  static readonly FRAME_MARGIN = 24;
  static readonly CURSOR_MARGIN = 4;

  protected _isWindow: boolean;
  protected _windowskin: Bitmap;
  protected _width: number;
  protected _height: number;
  protected _cursorRect: Rectangle;
  protected _openness: number;
  protected _animationCount: number;

  protected _padding: number;
  protected _margin: number;
  protected _colorTone: number[];
  protected _innerChildren: ContainerChild[];
  protected _container: Container;
  protected _backSprite: Container<ContainerChild>;
  protected _frameSprite: NineSliceSprite;
  protected _contentsBackSprite: Sprite;
  protected _cursorSprite: NineSliceSprite;
  protected _contentsSprite: Sprite;
  protected _downArrowSprite: Sprite;
  protected _upArrowSprite: Sprite;
  protected _pauseSignSprite: Sprite;
  protected _backGroundSprite: Sprite;
  protected _backTilingSprite: TilingSprite;
  protected _clientArea: Container<ContainerChild>;

  /**
   * The origin point of the window for scrolling.
   *
   * @type Point
   */
  origin: Point;

  /**
   * The active state for the window.
   *
   * @type boolean
   */
  active: boolean;

  /**
   * The visibility of the frame.
   *
   * @type boolean
   */
  frameVisible: boolean;

  /**
   * The visibility of the cursor.
   *
   * @type boolean
   */
  cursorVisible: boolean;

  /**
   * The visibility of the down scroll arrow.
   *
   * @type boolean
   */
  downArrowVisible: boolean;

  /**
   * The visibility of the up scroll arrow.
   *
   * @type boolean
   */
  upArrowVisible: boolean;

  /**
   * The visibility of the pause sign.
   *
   * @type boolean
   */
  pause: boolean;


  protected constructor(...args: any[]) {
    super();
    this.initialize(...arguments);
  }

  protected initialize(...args: any[]) {
    this._isWindow = true;
    this._windowskin = null;
    this._width = 0;
    this._height = 0;
    this._cursorRect = new Rectangle();
    this._openness = 255;
    this._animationCount = 0;

    this._padding = 12;
    this._margin = 4;
    this._colorTone = [0, 0, 0, 0];
    this._innerChildren = [];

    this._container = null;
    this._backSprite = null;
    this._frameSprite = null;
    this._contentsBackSprite = null;
    this._cursorSprite = null;
    this._contentsSprite = null;
    this._downArrowSprite = null;
    this._upArrowSprite = null;
    this._pauseSignSprite = null;

    this._createAllParts();

    this.origin = new Point();
    this.active = true;
    this.frameVisible = true;
    this.cursorVisible = true;
    this.downArrowVisible = false;
    this.upArrowVisible = false;


    this.pause = false;
  }

  /**
   * The image used as a window skin.
   *
   * @type Bitmap
   * @name RpgWindow#windowskin
   */
  get windowskin(): Bitmap {
    return this._windowskin;
  }

  set windowskin(value: Bitmap) {
    if (this._windowskin === value) return;
    this._windowskin = value;
    this._windowskin.on('complete', () => this._onWindowskinLoad());
  }

  /**
   * The bitmap used for the window contents.
   *
   * @type Bitmap
   * @name RpgWindow#contents
   */
  get contents(): Bitmap {
    return this._contentsSprite.bitmap;
  }

  set contents(value: Bitmap) {
    this._contentsSprite.bitmap = value;
  }

  /**
   * The bitmap used for the window contents background.
   *
   * @type Bitmap
   * @name RpgWindow#contentsBack
   */
  get contentsBack(): Bitmap {
    return this._contentsSprite.bitmap;
  }

  set contentsBack(value: Bitmap) {
    this._contentsBackSprite.bitmap = value;
  }

  /**
   * The width of the window in pixels.
   *
   * @type number
   * @override
   * @name RpgWindow#width
   */
  override get width(): number {
    return this._width;
  }

  override set width(value: number) {
    this._width = value;
    this._refreshAllParts();
  }

  /**
   * The height of the window in pixels.
   *
   * @type number
   * @name RpgWindow#height
   */
  override get height(): number {
    return this._height;
  }

  override set height(value: number) {
    this._height = value;
    this._refreshAllParts();
  }

  /**
   * The size of the padding between the frame and contents.
   *
   * @type number
   * @name RpgWindow#padding
   */
  get padding(): number {
    return this._padding;
  }

  set padding(value: number) {
    this._padding = value;
    this._refreshAllParts();
  }

  /**
   * The size of the margin for the window background.
   *
   * @type number
   * @name RpgWindow#margin
   */
  get margin(): number {
    return this._margin;
  }

  set margin(value: number) {
    this._margin = value;
    this._refreshAllParts();
  }

  /**
   * The opacity of the window without contents (0 to 255).
   *
   * @type number
   * @name RpgWindow#opacity
   */
  get opacity(): number {
    return this._container.alpha * 255;
  }

  set opacity(value: number) {
    this._container.alpha = value.clamp(0, 255) / 255;
  }

  /**
   * The opacity of the window background (0 to 255).
   *
   * @type number
   * @name RpgWindow#backOpacity
   */
  get backOpacity(): number {
    return this._backSprite.alpha * 255;
  }

  set backOpacity(value: number) {
    this._backSprite.alpha = value.clamp(0, 255) / 255;
  }

  /**
   * The opacity of the window contents (0 to 255).
   *
   * @type number
   * @name RpgWindow#contentsOpacity
   */
  get contentsOpacity(): number {
    return this._contentsSprite.alpha * 255;
  }

  set contentsOpacity(value: number) {
    this._contentsSprite.alpha = value.clamp(0, 255) / 255;
  }

  /**
   * The openness of the window (0 to 255).
   *
   * @type number
   * @name RpgWindow#openness
   */
  get openness(): number {
    return this._openness;
  }

  set openness(value: number) {
    if (this._openness === value) return;
    this._openness = value.clamp(0, 255);
    this._container.scale.y = this._openness / 255;
    this._container.y = (this.height / 2) * (1 - this._openness / 255);
  }

  /**
   * The width of the content area in pixels.
   *
   * @readonly
   * @type number
   * @name RpgWindow#innerWidth
   */
  get innerWidth(): number {
    return Math.max(0, this._width - this._padding * 2);
  }

  /**
   * The height of the content area in pixels.
   *
   * @readonly
   * @type number
   * @name RpgWindow#innerHeight
   */
  get innerHeight(): number {
    return Math.max(0, this._height - this._padding * 2);
  }

  /**
   * The rectangle of the content area.
   *
   * @readonly
   * @type Rectangle
   * @name RpgWindow#innerRect
   */
  get innerRect(): Rectangle {
    return new Rectangle(
      this._padding,
      this._padding,
      this.innerWidth,
      this.innerHeight
    );
  }

  override destroy() {
    const options = { children: true, texture: true };
    super.destroy(options);
  }

  /**
   * Updates the window for each frame.
   */
  update() {
    if (this.active) {
      this._animationCount++;
    }
    for (const child of this.children as UpdatableChildren[]) {
      if (!child.update) continue;
      child.update();
    }
  }

  /**
   * Sets the x, y, width, and height all at once.
   *
   * @param {number} x - The x coordinate of the window.
   * @param {number} y - The y coordinate of the window.
   * @param {number} width - The width of the window.
   * @param {number} height - The height of the window.
   */
  move(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    if (this._width !== width || this._height !== height) {
      this._width = width;
      this._height = height;
      this._refreshAllParts();
    }
  }

  /**
   * Checks whether the window is completely open (openness == 255).
   *
   * @returns {boolean} True if the window is open.
   */
  isOpen(): boolean {
    return this._openness >= 255;
  }

  /**
   * Checks whether the window is completely closed (openness == 0).
   *
   * @returns {boolean} True if the window is closed.
   */
  isClosed(): boolean {
    return this._openness <= 0;
  }

  /**
   * Sets the position of the command cursor.
   *
   * @param {number} x - The x coordinate of the cursor.
   * @param {number} y - The y coordinate of the cursor.
   * @param {number} width - The width of the cursor.
   * @param {number} height - The height of the cursor.
   */
  setCursorRect(x = 0, y = 0, width = 0, height = 0) {
    const cw = Math.floor(width);
    const ch = Math.floor(height);
    this._cursorRect.x = Math.floor(x);
    this._cursorRect.y = Math.floor(y);
    if (this._cursorRect.width === cw || this._cursorRect.height === ch) return;
    this._cursorRect.width = cw;
    this._cursorRect.height = ch;
    this._refreshCursor();
  }

  /**
   * Moves the cursor position by the given amount.
   *
   * @param {number} x - The amount of horizontal movement.
   * @param {number} y - The amount of vertical movement.
   */
  moveCursorBy(x: number, y: number) {
    this._cursorRect.x += x;
    this._cursorRect.y += y;
  }

  /**
   * Moves the inner children by the given amount.
   *
   * @param {number} x - The amount of horizontal movement.
   * @param {number} y - The amount of vertical movement.
   */
  moveInnerChildrenBy(x: number, y: number) {
    for (const child of this._innerChildren) {
      child.x += x;
      child.y += y;
    }
  }

  /**
   * Changes the color of the background.
   *
   * @param {number} r - The red value in the range (-255, 255).
   * @param {number} g - The green value in the range (-255, 255).
   * @param {number} b - The blue value in the range (-255, 255).
   */
  setTone(r: number, g: number, b: number) {
    const tone = this._colorTone;
    if (r !== tone[0] || g !== tone[1] || b !== tone[2]) {
      this._colorTone = [r, g, b, 0];
      this._refreshBack();
    }
  }

  /**
   * Adds a child between the background and contents.
   *
   * @param {ContainerChild} child - The child to add.
   * @returns {Container<ContainerChild>} The child that was added.
   */
  addChildToBack(child: ContainerChild): Container<ContainerChild> {
    const containerIndex = this.children.indexOf(this._container);
    return this.addChildAt(child, containerIndex + 1);
  }

  /**
   * Adds a child to the client area.
   *
   * @param {ContainerChild} child - The child to add.
   * @returns {Container<ContainerChild>} The child that was added.
   */
  addInnerChild(child: ContainerChild): Container<ContainerChild> {
    this._innerChildren.push(child);
    return this._clientArea.addChild(child);
  }

  override updateTransform(): this {
    const opts = {} as Partial<UpdateTransformOptions>;
    this._updateClientArea();
    this._updateFrame();
    this._updateContentsBack();
    this._updateCursor();
    this._updateContents();
    this._updateArrows();
    this._updatePauseSign();
    this._updateFilterArea();
    return super.updateTransform(opts);

  }

  /**
   * Draws the window shape into PIXI.Graphics object. Used by WindowLayer.
   */
  drawShape(graphics: Graphics) {
    if (!graphics) return;

    const width = this.width;
    const height = (this.height * this._openness) / 255;
    const x = this.x;
    const y = this.y + (this.height - height) / 2;
    graphics
      .rect(x, y, width, height)
      .fill(0xffffff);
  }


  protected _createAllParts() {
    this._createContainer();
    this._createBackSprite();
    this._createFrameSprite();
    this._createClientArea();
    this._createContentsBackSprite();
    this._createCursorSprite();
    this._createContentsSprite();
    this._createArrowSprites();
    this._createPauseSignSprites();
  }

  protected _createContainer() {
    this._container = new Container();
    this.addChild(this._container);
  }

  protected _createBackSprite() {
    this._backSprite = new Container();
    this._backGroundSprite = new Sprite();
    this._backTilingSprite = new TilingSprite();
    this._backSprite.addChild(this._backGroundSprite);
    this._backSprite.addChild(this._backTilingSprite);
    this._container.addChild(this._backSprite);
  }

  protected _createFrameSprite() {
    this._frameSprite = new NineSliceSprite();

    this._frameSprite.setBorder(RpgWindow.FRAME_MARGIN);
    this._container.addChild(this._frameSprite);
  }

  protected _createClientArea() {
    this._clientArea = new Container();
    this._clientArea.filters = [new AlphaFilter()];
    this._clientArea.filterArea = new Rectangle();
    this._clientArea.position.set(this._padding, this._padding);
    this.addChild(this._clientArea);
  }

  protected _createContentsBackSprite() {
    this._contentsBackSprite = new Sprite();
    this._clientArea.addChild(this._contentsBackSprite);
  }

  protected _createCursorSprite() {
    this._cursorSprite = new NineSliceSprite();
    this._cursorSprite.setBorder(RpgWindow.CURSOR_MARGIN);
    this._clientArea.addChild(this._cursorSprite);
  }

  protected _createContentsSprite() {
    this._contentsSprite = new Sprite();
    this._clientArea.addChild(this._contentsSprite);
  }

  protected _createArrowSprites() {
    this._downArrowSprite = new Sprite();
    this.addChild(this._downArrowSprite);
    this._upArrowSprite = new Sprite();
    this.addChild(this._upArrowSprite);
  }

  protected _createPauseSignSprites() {
    this._pauseSignSprite = new Sprite();
    this.addChild(this._pauseSignSprite);
  }

  protected _onWindowskinLoad() {
    this._refreshAllParts();
  }

  protected _refreshAllParts() {
    this._refreshBack();
    this._refreshFrame();
    this._refreshCursor();
    this._refreshArrows();
    this._refreshPauseSign();
  }


  protected _refreshBack() {
    const m = this._margin;
    const w = Math.max(0, this._width - m * 2);
    const h = Math.max(0, this._height - m * 2);

    this._backGroundSprite.bitmap = this._windowskin;
    this._backGroundSprite.setFrame(0, 0, 95, 95);
    this._backGroundSprite.move(m, m);
    this._backGroundSprite.scale.x = w / 95;
    this._backGroundSprite.scale.y = h / 95;

    this._backTilingSprite.bitmap = this._windowskin;
    this._backTilingSprite.setFrame(0, 96, 96, 96);
    this._backTilingSprite.move(0, 0, w, h);
    this._backTilingSprite.scale.x = 1 / this._backGroundSprite.scale.x;
    this._backTilingSprite.scale.y = 1 / this._backGroundSprite.scale.y;
    this._backGroundSprite.setColorTone(this._colorTone);
  }

  protected _refreshFrame() {
    this._frameSprite.bitmap = this._windowskin;
    this._frameSprite.setFrame(96, 0, 96, 96);
    this._frameSprite.width = this._width;
    this._frameSprite.height = this._height;
    this._frameSprite.move(0, 0);
  }

  protected _refreshCursor() {
    this._cursorSprite.bitmap = this._windowskin;
    this._cursorSprite.setFrame(96, 96, 48, 48);
    this._cursorSprite.width = this._cursorRect.width;
    this._cursorSprite.height = this._cursorRect.height;
  }

  /** @deprecated  since rm-next v.1.0.0 */
  protected _setRectPartsGeometry(sprite: Sprite, srect: Rectangle, drect: Rectangle, m: number) {
    console.warn('this function has been deprecated since v8 handles nine-slicing!');
  }

  protected _refreshArrows() {
    const w = this._width;
    const h = this._height;
    const p = 24;
    const q = p / 2;
    const sx = 96 + p;
    const sy = p;
    this._downArrowSprite.bitmap = this._windowskin;
    this._downArrowSprite.anchor.x = 0.5;
    this._downArrowSprite.anchor.y = 0.5;
    this._downArrowSprite.setFrame(sx + q, sy + q + p, p, q);
    this._downArrowSprite.move(w / 2, h - q);

    this._upArrowSprite.bitmap = this._windowskin;
    this._upArrowSprite.anchor.x = 0.5;
    this._upArrowSprite.anchor.y = 0.5;
    this._upArrowSprite.setFrame(sx + q, sy, p, q);
    this._upArrowSprite.move(w / 2, q);
  }

  protected _refreshPauseSign() {
    const sx = 144;
    const sy = 96;
    const p = 24;
    this._pauseSignSprite.bitmap = this._windowskin;
    this._pauseSignSprite.anchor.x = 0.5;
    this._pauseSignSprite.anchor.y = 1;
    this._pauseSignSprite.move(this._width / 2, this._height);
    this._pauseSignSprite.setFrame(sx, sy, p, p);
    this._pauseSignSprite.alpha = 0;
  }

  protected _updateClientArea() {
    const pad = this._padding;
    this._clientArea.position.set(pad, pad);
    this._clientArea.x = pad - this.origin.x;
    this._clientArea.y = pad - this.origin.y;
    if (this.innerWidth > 0 && this.innerHeight > 0) {
      this._clientArea.visible = this.isOpen();
    } else {
      this._clientArea.visible = false;
    }
  }

  protected _updateFrame() {
    this._frameSprite.visible = this.frameVisible;
  }

  protected _updateContentsBack() {
    const bitmap = this._contentsBackSprite.bitmap;
    if (!bitmap) return;
    this._contentsBackSprite.setFrame(0, 0, bitmap.width, bitmap.height);
  }

  protected _updateCursor() {
    this._cursorSprite.alpha = this._makeCursorAlpha();
    this._cursorSprite.visible = this.isOpen() && this.cursorVisible;
    this._cursorSprite.x = this._cursorRect.x;
    this._cursorSprite.y = this._cursorRect.y;
  }

  protected _makeCursorAlpha(): number {
    const blinkCount = this._animationCount % 40;
    const baseAlpha = this.contentsOpacity / 255;

    if (!this.active) return baseAlpha;
    if (blinkCount < 20) {
      return baseAlpha - blinkCount / 32;
    } else {
      return baseAlpha - (40 - blinkCount) / 32;
    }
  }

  protected _updateContents() {
    const bitmap = this._contentsSprite.bitmap;
    if (!bitmap) return;
    this._contentsSprite.setFrame(0, 0, bitmap.width, bitmap.height);
  }

  protected _updateArrows(){
    this._downArrowSprite.visible = this.isOpen() && this.downArrowVisible;
    this._upArrowSprite.visible = this.isOpen() && this.upArrowVisible;
  }

  protected _updatePauseSign(){
    const sprite = this._pauseSignSprite;
    const x = Math.floor(this._animationCount / 16) % 2;
    const y = Math.floor(this._animationCount / 16 / 2) % 2;
    const sx = 144;
    const sy = 96;
    const p = 24;
    if (!this.pause) {
      sprite.alpha = 0;
    } else if (sprite.alpha < 1) {
      sprite.alpha = Math.min(sprite.alpha + 0.1, 1);
    }
    sprite.setFrame(sx + x * p, sy + y * p, p, p);
    sprite.visible = this.isOpen();
  }

  protected _updateFilterArea(){
    const pos = this._clientArea.worldTransform.apply(new Point(0, 0));
    const filterArea = this._clientArea.filterArea;
    filterArea.x = pos.x + this.origin.x;
    filterArea.y = pos.y + this.origin.y;
    filterArea.width = this.innerWidth;
    filterArea.height = this.innerHeight;
  }
}
