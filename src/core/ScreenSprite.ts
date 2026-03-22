import { Container, DestroyOptions, Graphics } from 'pixi.js';


export class ScreenSprite extends Container {

  protected _graphics: Graphics;
  protected _red: number;
  protected _green: number;
  protected _blue: number;



  constructor() {
    super();
    this.initialize(...arguments);
  }

  protected initialize(...args: any[]) {
    this._graphics = new Graphics();
    this.addChild(this._graphics);
    this.opacity = 0;
    this._red = -1;
    this._green = -1;
    this._blue = -1;
    this.setBlack();
  }

  /**
   * The opacity of the sprite (0 to 255).
   *
   * @type number
   * @name ScreenSprite#opacity
   */
  get opacity(): number {
    return this.alpha * 255;
  }

  set opacity(value: number) {
    this.alpha = value.clamp(0, 255) / 255;
  }

  override destroy() {
    const options = { children: true, texture: true };
    super.destroy(options);
  }

  setBlack(){
    this.setColor(0, 0, 0);
  }

  setWhite(){
    this.setColor(255, 255, 255);
  }

  setColor(r: number, g: number, b: number) {
    if (!(this._red !== r || this._green !== g || this._blue !== b)) return;
    r = Math.round(r || 0).clamp(0, 255);
    g = Math.round(g || 0).clamp(0, 255);
    b = Math.round(b || 0).clamp(0, 255);
    this._red = r;
    this._green = g;
    this._blue = b;
    const color = (r << 16) | (g << 8) | b;
    this._graphics
      .clear()
      .rect(-50000, -50000, 100000, 100000)
      .fill(color);
  }
}
