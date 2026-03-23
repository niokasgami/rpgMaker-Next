import {
  DestroyOptions, Point, Rectangle, Texture, TextureSource, TilingSprite as PixiTilingSprite,
  UpdateTransformOptions
} from 'pixi.js';
import { Bitmap } from '@core/Bitmap.ts';

export class TilingSprite extends PixiTilingSprite {

  protected static readonly _emptyTexture: Texture = new Texture({
    source: new TextureSource({ width: 1, height: 1 })
  });

  protected _bitmap: Bitmap;
  protected _frame: Rectangle;

  protected _refreshFrame: boolean;
  /**
   * The origin point of the tiling sprite for scrolling.
   *
   * @type Point
   */
  origin: Point;

  constructor(bitmap?: Bitmap) {
    const frame = new Rectangle();
    super({
      texture: TilingSprite._emptyTexture,
      frame
    });
    this.onRender = this._updateTransform.bind(this);
    this.initialize(...arguments);
  }

  protected initialize(bitmap?: Bitmap,...args: any[]) {
    this._bitmap = bitmap;
    this.width = 0;
    this.height = 0;
    this._frame = new Rectangle();

    this.origin = new Point();
    this._refreshFrame = false;
    this._onBitmapChange();
  }

  /**
   * The image for the tiling sprite.
   *
   * @type Bitmap
   * @name TilingSprite#bitmap
   */
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

  set frameWidth(frameWidth: number) {
    this._frame.width = frameWidth;
    this._refresh();
  }

  get frameHeight(): number {
    return this._frame.height;
  }

  set frameHeight(frameHeight: number) {
    this._frame.height = frameHeight;
  }

  /**
   * The opacity of the tiling sprite (0 to 255).
   *
   * @type number
   * @name TilingSprite#opacity
   */
  get opacity(): number {
    return this.alpha * 255;
  }
  set opacity(value: number) {
    this.alpha = value.clamp(0, 255) / 255;
  }

  /**
   * Destroys the tiling sprite.
   */
  override destroy() {
    const options = { children: true, texture: true };
    super.destroy(options);
  }

  update(){
    /// DEPRECATED AS OF 8.0 SINCE ONLY CONTAINER CAN HAVE CHILDREN!
  }

  move(x = 0, y = 0, width = 0, height = 0  ) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
  }

  setFrame(x: number,y: number,width: number,height: number){
    this._frame.x = x;
    this._frame.y = y;
    this._frame.width = width;
    this._frame.height = height;
    this._refresh();
  }

  /**
   * Updates the transform on all children of this container for rendering.
   * @remarks we dont use updateTransform as its deprecated for leaf nodes, we
   * use onRender instead and we attach a function to it.
   */
  private _updateTransform() {
   // const options = {}; // for the moment its fine?? not sure tho
    this.tilePosition.x = Math.round(-this.origin.x);
    this.tilePosition.y = Math.round(-this.origin.y);
    //return super.updateTransform(options);
  }

  private _onBitmapChange() {
    if (this._bitmap) {
      if (this._bitmap.isReady()) {
        this._onBitmapLoad(this._bitmap);
      } else {
        this._bitmap.on('complete', () => this._onBitmapLoad(this._bitmap));
      }
    } else {
      this.texture = TilingSprite._emptyTexture;
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
