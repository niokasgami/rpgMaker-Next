import { Bitmap, Engine, Sprite } from '@core';
import {Stage} from "@core";
import * as PIXI from "pixi.js";


class Dummy extends Stage {

  private _bitmap: Bitmap;
  constructor() {
    super();

  }
  initialize(...args: any[]) {
    let square =  new PIXI.Graphics()
      .rect(350, 10, 10,10)
      .fill(0xFF0000);
    this.addChild(square);

    this.runAsync();
  }

  async runAsync(){
    this._bitmap = await Bitmap.load("assets/bunny.png");
    let x = this._bitmap.width / 2;
    let y = this._bitmap.height / 2;
    const rect = new PIXI.Rectangle(0, 0, this._bitmap.width, this._bitmap.height);
    // this._bitmap.fillAll("0xFF0000")
    //this._bitmap.strokeRect(rect,"#0000ff",4)
    //this._bitmap.gradientFillRect(rect,"0xFF0000", "0x0000FF");
    let sprite = new Sprite();
    sprite.bitmap = this._bitmap;
   // sprite.setHue(204);
    // sprite.position.set(100,20);
    this.addChild(sprite);

  }
}

class Main {
  constructor() {

  }

  async run(){
    await Engine.initialize();
    Engine.resize(800,600)
    Engine.startGameLoop();
    Engine.setStage(new Dummy());
  }
}
// Asynchronous IIFE
(async () =>
{
  const main = new Main();
  await main.run();
})();
