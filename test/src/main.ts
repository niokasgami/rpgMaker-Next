import { Bitmap, Engine, NineSliceSprite, Sprite } from '@core';
import { Stage } from "@core";
import * as PIXI from "pixi.js";
import { Assets, Rectangle } from 'pixi.js';
import { WindowDummy } from 'rmmz/windows/WindowDummy';
import { FrameSprite } from '@core/FrameSprite.ts';


class Dummy extends Stage {

  private _bitmap: Bitmap;
  private _window: WindowDummy;
  constructor() {
    super();

  }
  initialize(...args: any[]) {
    let square = new PIXI.Graphics()
      .rect(350, 10, 10, 10)
      .fill(0xFF0000);
    this.addChild(square);

    this.runAsync().then();
  }

  async runAsync() {

    const font = new FontFace('GameFont', 'url(assets/fonts/mplus-1m-regular.woff)');
    await font.load();
    document.fonts.add(font);

    this._bitmap = new Bitmap(400,400);// await Bitmap.load("assets/bunny.png");
    const blit = await Bitmap.load("assets/bunny.png");
    const myTextSprite = new Sprite();
    const pixiSprite = new PIXI.Sprite(this._bitmap.texture);
   // this._bitmap.fontFace = "GameFont";
    this._bitmap.outlineColor = 'blue'
    this._bitmap.outlineWidth = 1
    this._bitmap.fontSize = 72
    this._bitmap.drawText("Test", 10,10,100,10,"left");
    myTextSprite.bitmap = this._bitmap;

    //this._bitmap.drawText("Waaah", 0, 0, 400, 10, 'center')

    const xText = 20;
    const maxWidth = Engine.width - xText * 2;
   // bitmapText.drawText("Waaah", 0, 0, maxWidth, bitmapText.fontSize, 'center')*/

    this.addChild(myTextSprite);



/*

    const bitmap = await Bitmap.load("assets/Window.png");

    const frame = new FrameSprite();
    frame.bitmap = bitmap;
    console.log("this is the window ",frame.children);
    frame.setBorder(24);
    frame.position.set(200, 200);
    frame.setFrame(96, 0, 96, 96);
    frame.resize(192, 96);
   // this.addChild(frame);
  /// this._window = new WindowDummy(new Rectangle(100,100,100,100));
    this._window = new WindowDummy(new Rectangle(0, 0, Engine.width, 100));
    this._window.alpha = 1;
    this._window.windowskin = bitmap;
    this._window.close();
    this._window.open();
    this._bitmap = await Bitmap.load("assets/bunny.png");
     let x = this._bitmap.width / 2;
     let y = this._bitmap.height / 2;
     const rect = new PIXI.Rectangle(0, 0, this._bitmap.width, this._bitmap.height);
    // // this._bitmap.fillAll("0xFF0000")
    // //this._bitmap.strokeRect(rect,"#0000ff",4)
    // //this._bitmap.gradientFillRect(rect,"0xFF0000", "0x0000FF");
    let sprite = new Sprite();
    sprite.bitmap = this._bitmap;
    // // sprite.setHue(204);
     //sprite.position.set(100,20);
     this._window.addChild(sprite);*/
   // this.addChild(this._window);

  }
}

class Main {
  constructor() {

  }

  async run() {
    await Engine.initialize();
    Engine.resize(800, 600)
    Engine.startGameLoop();
    Engine.setStage(new Dummy());
  }
}
// Asynchronous IIFE
(async () => {
  const main = new Main();
  await main.run();

})();
