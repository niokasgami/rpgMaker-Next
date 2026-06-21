import { Engine } from './Engine.ts';
import {
  Assets,
  AssetsClass,
  CanvasTextMetrics,
  Color,
  Container,
  EventEmitter,
  FillGradient,
  Graphics,
  ImageSource,
  Point,
  Rectangle,
  SCALE_MODE,
  Sprite,
  TextStyle,
  Texture,
  WebGLRenderer,
  Text, TextStyleAlign, TextStyleOptions
} from 'pixi.js';

import { IContractualClass, RectangleLike } from './interfaces';
import { Stage } from './Stage.ts';
import { PingPongBuffer } from './PingPongBuffer.ts';

export enum LoadingState {
  NONE,
  LOADING,
  LOADED,
  ERROR
}

type TextAlign = 'left' | 'center' | 'right';
type ScaleMode = SCALE_MODE;

type BitmapEvent = 'load' | 'error' | 'complete';

/**
 * The basic object that represents an image.
 */
export class Bitmap implements IContractualClass {

  /**
   * The bitmap font face.
   */
  public fontFace: string;

  /**
   * The bitmap font size.
   */
  public fontSize: number;

  /**
   * Return whether the font is bold.
   */
  public fontBold: boolean;

  /**
   * Return whether the font is italic.
   */
  public fontItalic: boolean;

  /**
   * Return the font text color.
   */
  public textColor: string;

  /**
   * Return the font outline color.
   */
  public outlineColor: string;

  /**
   * Return the font outline width.
   */
  public outlineWidth: number;

  private _assets: AssetsClass;
  private _eventEmitter: EventEmitter;
  private _texture: Texture<ImageSource>;
  private _paintOpacity: number;
  private _scaleMode: ScaleMode;
  private _loadingState: LoadingState;
  private _url: string;
  private _width: number;
  private _height: number;
  private _alphaContainer: Container;

  private _originalSprite: Sprite; // for pooling / performance
  private _mockSprite: Sprite; // for pooling / performance
  private _textPool: Text; // for pooling / performance.
  private _graphics: Graphics;
  private _gradient: FillGradient;
  private _buffer: PingPongBuffer;
  private _renderer: WebGLRenderer<HTMLCanvasElement>;
  private _textStyle: TextStyle | null = null;


  constructor(width = 0, height = 0) {
    this.initialize(width, height);
  }

  initialize(width = 0, height = 0) {
    console.log('initialize called with:', width, height);
    this._assets = Assets;
    this._renderer = Engine.app.renderer;
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
    // Seed _texture immediately from the buffer so it's never null for
    // non-zero bitmaps. The buffer RenderTextures are valid (blank) GPU
    // textures the moment PingPongBuffer is constructed, so this is safe.
    if (width > 0 && height > 0) {
      this._texture = this._buffer.getSource();
    }

    // TODO : maybe remove the usage this._width and this._height they are just bloat tracking.
    this._width = width;
    this._height = height;
    this._originalSprite = new Sprite();
    this._mockSprite = new Sprite();
    this._graphics = new Graphics();
    this._gradient = new FillGradient({ type: 'linear', textureSpace: 'local' });
  }

  /**
   * load a bitmap image
   * @param url - the image url
   */
  static async load(url: string): Promise<Bitmap> {
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
  static snap(stage: Stage): Bitmap {
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
  isReady(): boolean {
    return this._loadingState === LoadingState.LOADED || this._loadingState === LoadingState.NONE;
  }

  /**
   * Returns whether the bitmap has an error.
   * @returns {boolean} - true if the bitmap has an error, false otherwise
   */
  isError(): boolean {
    return this._loadingState === LoadingState.ERROR;
  }

  /**
   * the bitmap url
   * @readonly
   */
  get url(): string {
    return this._url;
  }

  /**
   * the bitmap texture
   * @readonly
   */
  get texture(): Texture<ImageSource> {
    return this._texture;
  }

  /**
   * the bitmap texture source
   * @readonly
   */
  get textureSource(): ImageSource {
    return this._texture.source;
  }

  /**
   * the bitmap render texture
   * @readonly
   */
  get buffer(): PingPongBuffer {
    return this._buffer;
  }

  /**
   * The bitmap width
   * @readonly
   */
  get width(): number {
    return this._texture ? this._texture.width : this._width;
  }

  /**
   * The bitmap height
   * @readonly
   */
  get height(): number {
    return this._texture ? this._texture.height : this._height;
  }

  /**
   * The bitmap rectangle
   * @readonly
   */
  get rect(): Rectangle {
    return new Rectangle(0, 0, this.width, this.height);
  }

  /**
   * Set the scaling mode for the bitmap which are
   * "linear" and "nearest".
   */
  get scaleMode(): ScaleMode {
    return this._scaleMode;
  }

  set scaleMode(value: ScaleMode) {
    if (this._scaleMode !== value) {
      this._scaleMode = value;
      this.updateScaleMode();
    }
  }

  /**
   * The opacity for drawing operations, ranging from 0 (fully transparent) to 255 (fully opaque).
   */
  get paintOpacity(): number {
    return this._paintOpacity;
  }

  set paintOpacity(value: number) {
    if (this._paintOpacity !== value) {
      this._paintOpacity = value;
      this.refreshPaintOpacity();
    }
  }

  /**
   * Returns the bitmap's active TextStyle.
   *
   * If a custom TextStyle has been assigned via the setter, that style
   * takes priority. Otherwise, a TextStyle is generated from the legacy
   * font properties ({@link fontFace}, {@link fontSize}, {@link fontBold},
   * {@link fontItalic}, {@link textColor}, {@link outlineColor}, {@link outlineWidth}),
   * preserving full backwards compatibility with existing MZ bitmap API usage.
   *
   * @example
   * // Legacy MZ style (auto-generated TextStyle):
   * bitmap.fontSize = 28;
   * bitmap.textColor = '#ff0000';
   *
   * // Pixi TextStyle (takes priority):
   * bitmap.textStyle = new TextStyle({ fontSize: 28, fill: '#ff0000' });
   *
   * @see {@link TextStyle} for the full Pixi text style API.
   * @see {@link resetTextStyle} to clear a custom style and fall back to legacy properties.
   */
  get textStyle(): TextStyle {
    return this._textStyle ?? new TextStyle({
      fontFamily: this.fontFace,
      fontSize: this.fontSize,
      fontWeight: this.fontBold ? 'bold' : 'normal',
      fontStyle: this.fontItalic ? 'italic' : 'normal',
      fill: this.textColor,
      stroke: { color: this.outlineColor, width: this.outlineWidth * 2 },
    });
  }

  set textStyle(style: TextStyle) {
    this._textStyle = style;
  }

  resetTextStyle(): void {
    this._textStyle = null;
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
  resize(width: number, height: number) {
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
  blt(source: Bitmap, sourceRect: Rectangle, destRect: Partial<Rectangle> & { x: number, y: number }) {
    if (!this._texture || !source._texture) return;
    const { x: sx, y: sy, width: sw, height: sh } = sourceRect;
    const { x: dx, y: dy } = destRect;
    const dw = destRect.width || sw;
    const dh = destRect.height || sh;

    try {
      this._mockSprite.texture = new Texture({
        source: source._texture.source,
        frame: new Rectangle(sx, sy, sw, sh)
      });
      this._mockSprite.position.set(dx, dy);
      this._mockSprite.scale.set(dw / sw, dh / sh);
      this.renderToBuffer(this._mockSprite);
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async inspect(): Promise<void> {
    const image = await this._renderer.extract.image(this._buffer.getSource());
    document.body.appendChild(image);
  }

  /**
   * Returns pixel color at the specified point.
   *
   * @param x - The x coordinate of the pixel in the bitmap.
   * @param y - The y coordinate of the pixel in the bitmap.
   * @returns {string} The pixel color (hex format).
   */
  getPixel(x: number, y: number): string {
    if (!this._texture) return '#000000';
    const pixels = this._renderer.extract.pixels(this._texture).pixels;
    const index = (y * this._texture.width + x) * 4;
    //@ts-ignore
    return '#' + pixels[index].toString(16).padZero(2) +
      //@ts-ignore
      pixels[index + 1].toString(16).padZero(2) +
      //@ts-ignore
      pixels[index + 2].toString(16).padZero(2);
  }

  /**
   * Returns alpha pixel value at the specified point.
   *
   * @param x - The x coordinate of the pixel in the bitmap.
   * @param y - The y coordinate of the pixel in the bitmap.
   * @returns {string} The alpha value.
   */
  getAlphaPixel(x: number, y: number): number {
    if (!this._texture) return 0;
    // Get all pixels
    const pixels = this._renderer.extract.pixels(this._texture).pixels;
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
  clearRect(x: number, y: number, width: number, height: number) {
    this._graphics.clear();
    this._graphics.rect(x, y, width, height)
      .fill(0x000000);
    this._graphics.blendMode = 'erase';

    this.renderToBuffer(this._graphics);
    this._graphics.blendMode = 'normal';
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
  fillRect(rect: RectangleLike, color: string) {
    this._graphics.clear();
    this._graphics
      .rect(rect.x, rect.y, rect.width, rect.height)
      .fill({
        color: this.getColor(color).toNumber(),
        alpha: this.getColor(color).alpha
      });

    this.renderToBuffer(this._graphics);
  }

  /**
   * Fills the entire bitmap.
   *
   * @param color - The color of the rectangle in CSS format.
   */
  fillAll(color: string) {
    this.fillRect({ x: 0, y: 0, width: this.width, height: this.height }, color);
  }

  /**
   * Create a stroke in the bitmap
   * @param rect - the stroke rectangle coordinates
   * @param color - the stroke color
   * @param lineWidth - the stroke width
   */
  strokeRect(rect: RectangleLike, color: string, lineWidth = 1) {
    this._graphics.clear();
    this._graphics.rect(rect.x, rect.y, rect.width, rect.height)
      .stroke(
        {
          color: this.getColor(color).toNumber(),
          width: lineWidth,
          alpha: this.getColor(color).alpha
        });
    this.renderToBuffer(this._graphics);
  }

  /**
   * Draw a gradient fill in the bitmap
   * @param rect - the gradient rectangle coordinates
   * @param color1 - the start color
   * @param color2 - the end color
   * @param orientation - the gradient orientation (horizontal or vertical)
   */
  gradientFillRect(rect: RectangleLike, color1: string, color2: string, orientation: 'horizontal' | 'vertical' = 'horizontal') {
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

    this.renderToBuffer(this._graphics);
  }

  /**
   * Draw a circle in the bitmap
   * @param x - the circle x position
   * @param y - the circle y position
   * @param radius - the circle radius
   * @param color - the circle color
   */
  drawCircle(x: number, y: number, radius: number, color: string) {
    this._graphics.clear();
    this._graphics
      .circle(x, y, radius)
      .fill({
        color: this.getColor(color).toNumber(),
        alpha: this.getColor(color).alpha
      });
    this.renderToBuffer(this._graphics);
  }


  /**
   * Draws a text string onto the bitmap.
   *
   * Text rendering uses the active {@link textStyle} for font, color, and stroke properties.
   * If no custom {@link TextStyle} has been assigned, the style is auto-generated from the
   * legacy font properties ({@link fontFace}, {@link fontSize}, {@link fontBold},
   * {@link fontItalic}, {@link textColor}, {@link outlineColor}, {@link outlineWidth}).
   *
   * @remarks
   * Word wrapping is intentionally disabled — MZ handles its own line breaking upstream
   * via escape code processing (`\n`, `\C[n]`, etc.) before `drawText` is called.
   * `maxWidth` only affects the horizontal alignment origin, not wrapping behavior.
   *
   * @param text - The text string to draw.
   * @param x - The x coordinate of the left edge of the text area.
   * @param y - The y coordinate of the top edge of the text area.
   * @param maxWidth - The maximum width of the text area in pixels.
   * Defaults to `0xffffffff` (unconstrained) if not specified.
   * @param lineHeight - The height of the line in pixels. Used to vertically
   * center the text within the line via baseline offset calculation.
   * @param align - The horizontal alignment of the text within the text area.
   * Accepts `'left'`, `'center'`, or `'right'`.
   *
   * @example
   * // Draw centered white text with default style
   * bitmap.drawText('Hello World', 0, 0, 400, 36, 'center');
   *
   * @example
   * // Draw with a custom TextStyle
   * bitmap.textStyle = new TextStyle({ fontSize: 32, fill: '#ff0000' });
   * bitmap.drawText('Red Text', 0, 0, 400, 36, 'left');
   * @experimental This still need intensive testing to see if the new API matches MZ old canvas Text rendering.
   */

  drawText(text: string, x: number, y: number, maxWidth: number, lineHeight: number, align: TextStyleAlign) {
    maxWidth = maxWidth || 0xffffffff;
    const ty = Math.round(y + lineHeight / 2 + this.fontSize * 0.35);

    let tx = x;
    if (align === 'center') tx += maxWidth / 2;
    if (align === 'right') tx += maxWidth;

    const style = this.textStyle.clone();
    style.align = align;
    style.wordWrap = false;

    this._textPool.text = text;
    this._textPool.style = style;
    this._textPool.x = tx;
    this._textPool.y = ty;
    this._textPool.anchor.x = align === 'center' ? 0.5
      : align === 'right' ? 1
        : 0;

    this.renderToBuffer(this._textPool);
  }


  /**
   * measure the text width.
   * @param text - the text to be measured
   */
  measureTextWidth(text: string): number {
    // todo : bake this
    const style = new TextStyle({
      fontFamily: this.fontFace,
      fontSize: this.fontSize
    });
    return CanvasTextMetrics.measureText(text, style).width;
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
  on(bitmapEvent: BitmapEvent | string, callback: (...arg: any[]) => void, context?: any): EventEmitter<string | symbol, any> {
    return this._eventEmitter.on(bitmapEvent, callback, context);
  }

  /**
   * subscribe to a bitmap event for only one time.
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
  once(bitmapEvent: BitmapEvent | string, callback: (...arg: any[]) => void, context?: any): EventEmitter<string | symbol, any> {
    return this._eventEmitter.once(bitmapEvent, callback, context);
  }

  /**
   * emit a bitmap event to all subscribed function
   * @param bitmapEvent - the bitmap event to call.
   * @param args - optionals function
   */
  emit(bitmapEvent: BitmapEvent | string, ...args: any[]): boolean {
    return this._eventEmitter.emit(bitmapEvent, args);
  }

  /**
   * callback function to make sure if a bitmap is truly ready. if not you assign an callback
   * to call once it's done.
   * @param callback
   */
  onceLoaded(callback: () => void) {
    if (this.isReady()) {
      callback();
    } else {
      this.once('complete', callback);
    }
  }


  /**
   * retry loading the bitmap.
   */
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
  renderTo(container: Container, clear = true): void {
    this._renderer.render({
      container,
      target: this._buffer.getTarget(),
      clear
    });
    this._buffer.swap();
    this._texture = this._buffer.getSource();
    this._texture.update();
  }

  /**
   * Assign a texture to the bitmap and resize the buffer
   * @param texture - the new texture to assign.
   */
  assignTexture(texture: Texture<ImageSource>) {
    this._texture = texture;
    this._width = this._texture.width;
    this._height = this._texture.height;
    this._buffer.resize(this._width, this._height);
    this.ensureRenderTexture();
  }

  /// PRIVATE FUNCTION

  private renderToBuffer(...children: Container[]): void {
    this._originalSprite.texture = this._buffer.getSource();
    this._alphaContainer.addChild(this._originalSprite, ...children);
    this._renderer.render({ container: this._alphaContainer, target: this._buffer.getTarget(), clear: false });
    this._buffer.swap();
    this._alphaContainer.removeChild(this._originalSprite, ...children);
    this._texture = this._buffer.getSource();
    this._texture.update();
  }

  private async startLoading() {
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
      this.emit('complete');

    } catch (e: any) {
      this._loadingState = LoadingState.ERROR;
      this.emit('error', e);
    }


  }

  private ensureRenderTexture() {
    if (this._buffer.hasSource()) return;
    this._originalSprite.texture = this._texture;
    this._buffer.assign(this._originalSprite);
  }

  private updateScaleMode() {
    this._texture.source.scaleMode = this._scaleMode;
  }

  private refreshPaintOpacity() {
    this._alphaContainer.alpha = this.alphaConversion();
  }

  private alphaConversion(): number {
    return this._paintOpacity / 255;
  }

  private getColor(color: string): Color {
    return Color.shared.setValue(color);
  }


}
