import { Engine, Bitmap } from 'rm-next.js';
import { Stage } from "rm-next.js";
import * as PIXI from 'pixi.js';

class Dummy extends Stage {
    constructor() {
        super();
    }
    initialize(...args) {
        let square = new PIXI.Graphics()
            .rect(350, 10, 10, 10)
            .fill(0xFF0000);
        this.addChild(square);
        this.runAsync();
    }
    async runAsync() {
        this._bitmap = await Bitmap.load("./icon/icon.png");
        this._bitmap.width / 2;
        this._bitmap.height / 2;
        const rect = new PIXI.Rectangle(0, 0, this._bitmap.width, this._bitmap.height);
        // this._bitmap.fillAll("0xFF0000")
        //this._bitmap.strokeRect(rect,"#0000ff",4)
        this._bitmap.gradientFillRect(rect, "0xFF0000", "0x0000FF");
        let sprite = new PIXI.Sprite(this._bitmap.texture);
        // sprite.position.set(100,20);
        this.addChild(sprite);
    }
}
class Main {
    constructor() {
    }
    async run() {
        await Engine.initialize();
        Engine.resize(800, 600);
        Engine.startGameLoop();
        Engine.setStage(new Dummy());
    }
}
// Asynchronous IIFE
(async () => {
    const main = new Main();
    await main.run();
})();
