import { Container, Graphics, RenderTexture, SCALE_MODE, TextureSource } from 'pixi.js';
import { Engine } from './Engine.ts';


interface bufferOptions {
  /**
   * The width of the buffer.
   */
  width: number;
  /**
   * The height of the buffer.
   */
  height: number;
  /**
   * The scale mode of the buffer which is either "linear" or "nearest".
   */
  scaleMode: SCALE_MODE;
  /**
   * The resolution of the buffer.
   */
  resolution: number;
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
 * const mySprite = Sprite.from(source);
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
export class PingPongBuffer {

  private readonly _textureA: RenderTexture;
  private readonly _textureB: RenderTexture;
  private readonly _graphics: Graphics;

  private _current: 'A' | 'B' = 'A';
  private _hasBeenInitialized: boolean = false;

  /**
   * Creates a new PingPongBuffer instance.
   * @param options - the buffer options
   */
  constructor(options: Partial<bufferOptions>) {
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


    // If constructed with real dimensions, the RenderTextures are valid blank
    // GPU textures immediately — no assign() call needed, mark as initialized.
    if (options.width > 0 && options.height > 0) {
      this._hasBeenInitialized = true;
    }
  }


  /**
   * Gets the current source texture (read from this).
   * This is the texture that contains the latest rendered content.
   *
   * @returns The current source RenderTexture
   */
  getSource(): RenderTexture {
    return this._current === 'A' ? this._textureA : this._textureB;
  }

  /**
   * Gets the current target texture (write to this).
   * This is the texture you should render to next.
   *
   * @returns The current target RenderTexture
   */
  getTarget(): RenderTexture {
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
  swap(): void {
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
  resize(width: number, height: number) {
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

  /**
   * manually assign an existing texture to the buffer.
   * @param container - a valid container to render from.
   */
  assign(container: Container){
    const renderer = Engine.app.renderer;
    const source = this.getSource();
    const target = this.getTarget();
    renderer.render({ container, target: source, clear: false });
    renderer.render({ container, target, clear: false });
    this._hasBeenInitialized = true;
  }

  /**
   * check whether the buffer already has a texture source.
   */
  hasSource(): boolean {
    return this._hasBeenInitialized;
  }
}
