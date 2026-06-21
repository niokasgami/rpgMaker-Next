import { Container, Rectangle } from 'pixi.js';
import { Bitmap} from '@core/Bitmap.ts';
import { Sprite } from '@core/Sprite';
import { RectangleLike } from '@core/interfaces';


export enum FramePiece {
  TopLeft = 0,
  TopRight = 1,
  BottomLeft = 2,
  BottomRight = 3,
  Top = 4,
  Bottom = 5,
  Left = 6,
  Right = 7,
}

export class FrameSprite extends Container {


  protected _pieces: Sprite[]; // index 0-7, internal/bulk ops
  protected _frame: Rectangle;
  protected _border: number;
  protected _destWidth: number;
  protected _destHeight: number;
  protected _bitmap: Bitmap;
  protected get topLeft(): Sprite { return this._pieces[FramePiece.TopLeft]; }
  protected get topRight(): Sprite { return this._pieces[FramePiece.TopRight]; }
  protected get bottomLeft(): Sprite { return this._pieces[FramePiece.BottomLeft]; }
  protected get bottomRight(): Sprite { return this._pieces[FramePiece.BottomRight]; }
  protected get top(): Sprite { return this._pieces[FramePiece.Top]; }
  protected get bottom(): Sprite { return this._pieces[FramePiece.Bottom]; }
  protected get left(): Sprite { return this._pieces[FramePiece.Left]; }
  protected get right(): Sprite { return this._pieces[FramePiece.Right]; }


  constructor(bitmap: Bitmap = null, border = 24){
    super();
    this.initialize(...arguments);
  }


  protected initialize(bitmap: Bitmap = null, border = 24, ...args: any[]){
    this._frame = new Rectangle();
    this._border = border;
    this._destWidth = 0;
    this._destHeight = 0;
    this._destWidth = 0;
    this._bitmap = bitmap;
    this.createSpritePieces();
    if(bitmap){
      console.log("this has been called in the frameSprite");
      this.refresh();
    }
  }

   get bitmap(): Bitmap {
    return this._bitmap;
  }

  set bitmap(bitmap: Bitmap) {
    this._bitmap = bitmap;
    if(this._bitmap === bitmap) return;
    this.refresh();
  }

  setFrame(x: number,y: number, width: number, height: number) {
    this._frame.x = x;
    this._frame.y = y;
    this._frame.width = width;
    this._frame.height = height;
    this.refresh();
  }

  setBorder(m: number){
    this._border = m;
    this.refresh();
  }

  resize(width: number, height: number){
    this._destWidth = width;
    this._destHeight = height;
    this.refresh();
  }

  move(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  protected createSpritePieces(): void {
    this._pieces = [];
    for (let i = 0; i < 8; i++) {
      const piece = new Sprite();
      this._pieces.push(piece);
      this.addChild(piece);
    }
  }

  protected refresh(){
    if (!this._bitmap) return;
    this.assignBitmapToPieces();
    this.setRectPartsGeometry();
  }

  protected assignBitmapToPieces(): void {
    for (const piece of this._pieces) {
      piece.bitmap = this._bitmap;
    }
  }

  protected setRectPartsGeometry() {
    const sx = this._frame.x;
    const sy = this._frame.y;
    const sw = this._frame.width;
    const sh = this._frame.height;
    const dw = this._destWidth;
    const dh = this._destHeight;
    const m = this._border;

    const smw = sw - m * 2;
    const smh = sh - m * 2;
    const dmw = dw - m * 2;
    const dmh = dh - m * 2;

    // corners
    this.topLeft.setFrame(sx, sy, m, m);
    this.topRight.setFrame(sx + sw - m, sy, m, m);
    this.bottomLeft.setFrame(sx, sy + sh - m, m, m); // fixed: sh, not sw
    this.bottomRight.setFrame(sx + sw - m, sy + sh - m, m, m);

    this.topLeft.position.set(0, 0);
    this.topRight.position.set(dw - m, 0);
    this.bottomLeft.position.set(0, dh - m);
    this.bottomRight.position.set(dw - m, dh - m);

    // edges
    this.top.setFrame(sx + m, sy, smw, m);
    this.bottom.setFrame(sx + m, sy + sh - m, smw, m); // fixed: sh, not sw
    this.left.setFrame(sx, sy + m, m, smh);
    this.right.setFrame(sx + sw - m, sy + m, m, smh);

    this.top.position.set(m, 0);
    this.bottom.position.set(m, dh - m);
    this.left.position.set(0, m);
    this.right.position.set(dw - m, m);

    this.top.scale.x = dmw / smw;
    this.bottom.scale.x = dmw / smw;
    this.left.scale.y = dmh / smh;
    this.right.scale.y = dmh / smh;

    const visible = dw > 0 && dh > 0;
    for (const piece of this._pieces) piece.visible = visible;
  }
}
