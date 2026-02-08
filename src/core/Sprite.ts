import { BLEND_MODES, Rectangle, Sprite as PixiSprite, Texture } from 'pixi.js';
import { Bitmap } from './Bitmap.ts';
import { IContractualClass } from './interfaces';


export class Sprite extends PixiSprite implements IContractualClass {

  protected static readonly _emptyTexture = Texture.EMPTY;
  protected _frame: Rectangle;
  protected _bitmap: Bitmap;
  protected _hue: number;
  protected _blendColor: [number, number, number, number];
  protected _colorTone: [number, number, number, number];
  protected _colorFilter: unknown;
  protected _hidden: boolean; // TODO : maybe change the name of this variable? its not very clear.
  private _refreshFrame: boolean;

  constructor(bitmap?: Bitmap) {
    Sprite._emptyTexture.source.resize(1, 1);
    const frame = new Rectangle();
    super({
      texture: Sprite._emptyTexture,
      frame: frame
    });
    this.initialize(bitmap);
  }

  initialize(bitmap?: Bitmap) {
    // TODO : spriteId does not exist???

    this._bitmap = bitmap;
    this._frame = new Rectangle();
    this._hue = 0;
    this._blendColor = [0, 0, 0, 0];
    this._colorTone = [0, 0, 0, 0];
    this._colorFilter = null;
    this._hidden = false;
    this.blendMode = "normal";
    this._onBitmapChange();
  }

  /**
   * The Sprite image.
   */
  get bitmap(): Bitmap {
    return this._bitmap;
  }

  set bitmap(value: Bitmap){
    if(this._bitmap === value) return;
    this._bitmap = value;
    this._onBitmapChange();
  }

  /**
   * the sprite height without the scale
   */
  get width(): number {
    return this._frame.width;
  }

  set width(value: number){
    this._frame.width = value;
    this._refresh();
  }
  /**
   * the sprite height without the scale
   */
  get height(): number {
    return this._frame.height;
  }

  set height(value: number){
    this._frame.height = value;
    this._refresh();
  }

  /**
   * The sprite opacity (0 to 255).
   */
  get opacity(): number {
    return this.alpha * 255;
  }

  set opacity(value: number){
    this.alpha = value.clamp(0, 255) / 255;
  }

  override get blendMode(): BLEND_MODES {
    if(this._colorFilter) {
      return this._colorFilter.blendMode; // TODO : not toooo sure?

    } else {
      return super.blendMode;
    }
  }
  ///TODO LATER

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
      this._refresh();
    }
  }

  private _refresh() {
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
    this.texture.update();
  }
}

interface SpriteFrame extends Rectangle {
}
