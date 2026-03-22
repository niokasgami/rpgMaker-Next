import { NineSliceSprite as PixiNineSliceSprite, Rectangle, Texture, TextureSource } from 'pixi.js';
import { Bitmap } from '@core/Bitmap.ts';


export class BorderArea {

  private _left: number;
  private _right: number;
  private _top: number;
  private _bottom: number;

  static readonly EMPTY = new BorderArea();
  static readonly DEFAULT = new BorderArea(10,10,10,10);

  constructor(left = 0,right = 0, top = 0, bottom = 0) {
    this._left = left;
    this._right = right;
    this._top = top;
    this._bottom = bottom;

  }

  get left(): number {
    return this._left;
  }
  set left(value: number) {
    this._left = value;
  }
  get right(): number {
    return this._right;
  }
  set right(value: number) {
    this._right = value;
  }

  get top(): number {
    return this._top;
  }
  set top(value: number) {
    this._top = value;
  }

  get bottom(): number {
    return this._bottom;
  }
  set bottom(value: number) {
    this._bottom = value;
  }
}

type BorderLike = {left: number; right: number, top: number, bottom: number};

/// TODO : maybe add color filter supports??

/**
 * The  sprite class that allow stretching textures
 */
export class NineSliceSprite extends PixiNineSliceSprite {

  protected static readonly _emptyTexture: Texture = new Texture({
    source: new TextureSource({ width: 1, height: 1 })
  });

  protected _bitmap: Bitmap;
  protected _frame: Rectangle;

  protected _refreshFrame: boolean;

  constructor(bitmap?: Bitmap, border: BorderArea | BorderLike = BorderArea.DEFAULT) {
    const frame = new Rectangle();
    super({
      texture: NineSliceSprite._emptyTexture,
      frame,
      leftWidth: border.left,
      rightWidth: border.right,
      topHeight: border.top,
      bottomHeight: border.bottom
    });
    this.initialize(...arguments);
  }

  protected initialize(bitmap?: Bitmap,...args: any[]) {
    this._bitmap = bitmap;
    this._frame = new Rectangle();
    this._refreshFrame = false;
    this._onBitmapChange();
  }

  get bitmap(): Bitmap {
    return this._bitmap;
  }

  set bitmap(bitmap: Bitmap) {
    if(this._bitmap !== bitmap) {
      this._bitmap = bitmap;
      this._onBitmapChange();
    }
  }

  get frameWidth(): number {
    return this._frame.width;
  }

  set frameWidth(value: number) {
    this._frame.width = value;
    this._refresh();
  }

  get frameHeight(): number {
    return this._frame.height;
  }
  set frameHeight(value: number) {
    this._frame.height = value;
    this._refresh();
  }

  /**
   * Sets all borders to the same value.
   * @param all The value to apply to left, right, top, and bottom.
   */
  setBorder(all: number): void;

  /**
   * Sets borders using a BorderArea instance or a compatible object.
   * @param border The border configuration object (defaults to BorderArea.DEFAULT).
   */
  setBorder(border?: BorderArea | BorderLike): void;

  /**
   * Sets each border individually.
   * @param left Width of the left slice.
   * @param right Width of the right slice.
   * @param top Height of the top slice.
   * @param bottom Height of the bottom slice.
   */
  setBorder(left: number, right: number, top: number, bottom: number): void;

  setBorder(a?: BorderArea | BorderLike | number, b?: number, c?: number, d?: number): void {
    // If the first arg is a number...
    if (typeof a === 'number') {
      // If 'b' is undefined, it's the single-number shorthand
      if (b === undefined) {
        this.leftWidth = this.rightWidth = this.topHeight = this.bottomHeight = a;
      } else {
        // 4-number version
        this.leftWidth = a;
        this.rightWidth = b;
        this.topHeight = c ?? 0;
        this.bottomHeight = d ?? 0;
      }
    } else {
      // Object/Class version
      const { left, right, top, bottom } = a ?? BorderArea.DEFAULT;
      this.leftWidth = left;
      this.rightWidth = right;
      this.topHeight = top;
      this.bottomHeight = bottom;
    }
  }

  setFrame(x: number, y: number, width: number, height: number) {
    this._frame.x = x;
    this._frame.y = y;
    this._frame.width = width;
    this._frame.height = height;
    this._refresh();
  }

  move(x: number, y: number) {
    this.x = x;
    this.y = y;
  }


  private _onBitmapChange(){
    if(this._bitmap) {
      if(!this._bitmap.isReady()){
        this._onBitmapLoad(this._bitmap);
      } else {
        this._bitmap.on("complete", () => this._onBitmapLoad(this._bitmap));
      }
    } else {
      this.texture = NineSliceSprite._emptyTexture;
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

  private _refresh() {
    if (!this._bitmap?.textureSource) return;

    const source = this._bitmap.textureSource;

    const frame = this._frame.clone();
    if (frame.width === 0 && frame.height === 0) {
      frame.width = this._bitmap.width;
      frame.height = this._bitmap.height;
    }
    const texture = new Texture({
      source,
      frame
    });
    this._bitmap.assignTexture(texture);
    this.texture = this._bitmap.texture;
  }

}

