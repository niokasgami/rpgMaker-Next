import { BLEND_MODES, Filter, Rectangle, Sprite as PixiSprite, Texture, TextureSource } from 'pixi.js';
import { Bitmap } from '@core/Bitmap.ts';
import { ColorFilter } from '@core/ColorFilter.ts';


const BLEND_MODE_MAP: Record<number, BLEND_MODES> = {
  // RPG Maker editor exposed modes
  0: 'normal',       // Normal
  1: 'add',          // Additive
  2: 'multiply',     // Multiply
  3: 'screen',       // Screen

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
} as const;

export class Sprite extends PixiSprite {

  protected static readonly _emptyTexture: Texture = new Texture({
    source: new TextureSource({ width: 1, height: 1 })
  });

  protected _bitmap: Bitmap;
  protected _frame: Rectangle;

  protected _refreshFrame: boolean;
  protected _hidden: boolean;
  protected _hue: number;
  protected _blendColor: number[];
  protected _colorTone: number[];
  protected _colorFilter: ColorFilter;

  constructor(bitmap?: Bitmap, ...args: any[]) {
    const frame = new Rectangle();
    super({
      texture: Sprite._emptyTexture,
      frame
    });
    this.initialize(...arguments);
  }

  protected initialize(bitmap?: Bitmap, ...args: any[]) {
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
  get bitmap(): Bitmap {
    return this._bitmap;
  }

  set bitmap(value: Bitmap) {
    if (this._bitmap === value) return;
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
  get frameWidth(): number {
    return this._frame.width;
  }

  set frameWidth(value: number) {
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
  get frameHeight(): number {
    return this._frame.height;
  }

  set frameHeight(value: number) {
    this._frame.height = value;
    this._refresh();
  }

  /**
   * The sprite opacity (0 to 255).
   */
  get opacity(): number {
    return this.alpha * 255;
  }

  set opacity(value: number) {
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
  setBlendMode(value: BLEND_MODES | number) {
    this.blendMode = typeof value === 'number'
      ? BLEND_MODE_MAP[value] ?? 'normal'
      : value;
  }

  override destroy(): void {
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
  move(x: number, y: number) {
    this.x = x;
    this.y = y;
  }


  setFrame(x: number, y: number, width: number, height: number) {
    this._refreshFrame = false;
    const frame = this._frame;
    if (
      x !== frame.x ||
      y !== frame.y ||
      width !== frame.width ||
      height !== frame.height
    ) {
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
  setHue(hue: number) {
    if(this._hue !== Number(hue)){
      this._hue = Number(hue);
      this._updateColorFilter();
    }
  }

  /**
   * Gets the blend color for the sprite.
   *
   * @returns The blend color [r, g, b, a].
   */
  getBlendColor(): number[] {
    return this._blendColor.clone();
  }

  /**
   * Sets the blend color for the sprite.
   *
   * @param color - The blend color [r, g, b, a].
   */
  setBlendColor(color: number[]) {
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
  getColorTone(): number[] {
    return this._colorTone.clone();
  }

  setColorTone(tone: number[]) {
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
  addFilter(filter: Filter) {
    if (!Array.isArray(this.filters)) {
      this.filters = [filter];
    } else {
      this.filters = [...this.filters as Filter[], filter];
    }
  }

  /**
   * remove a filter from the filter list
   * @param filter - the filter to remove
   */
  removeFilter(filter: Filter) {
    if (!Array.isArray(this.filters)) return;
    this.filters = (this.filters as Filter[]).filter(f => f !== filter);
  }

  private _onBitmapChange(){
    if(this._bitmap) {
      this._refreshFrame = true;
      if(this._bitmap.isReady()){
        this._onBitmapLoad(this._bitmap);
      } else {
        this._bitmap.on("complete",() => this._onBitmapLoad(this._bitmap));
      }
    } else {
      this._refreshFrame = false;
      this.texture = Sprite._emptyTexture;
      this._frame = new Rectangle();
    }
  }

  private _onBitmapLoad(loadedBitmap: Bitmap) {
    if(loadedBitmap !== this._bitmap) return;
    if(this._refreshFrame && this._bitmap) {
      this._refreshFrame = false;
      this._frame.width = this._bitmap.width;
      this._frame.height = this._bitmap.height;
    }
    this._refresh();
  }

  private _refresh(){
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
    if (!this.texture) return;
    this.pivot.x = frameX - realX;
    this.pivot.y = frameY - realY;

    if (!textureSource) return;

    const texture = new Texture({
      source: textureSource,
      frame: frame
    });
    this._bitmap.assignTexture(texture);
    this.texture = this._bitmap.texture;
  }

  private _createColorFilter(){
    this._colorFilter = new ColorFilter();
    this.addFilter(this._colorFilter);
  }

  private _updateColorFilter(){
    if(!this._colorFilter)  this._createColorFilter();
    this._colorFilter.setHue(this._hue);
    this._colorFilter.setBlendColor(this._blendColor);
    this._colorFilter.setColorTone(this._colorTone);
  }
}
