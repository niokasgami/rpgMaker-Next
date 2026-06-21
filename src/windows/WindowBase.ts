import { DestroyOptions, Rectangle } from "pixi.js";
import { Bitmap, RpgWindow } from "@core";
import { $gameSystem } from "rmmz/managers/DataManager";
import { ImageManager } from '@managers';


export abstract class WindowBase extends RpgWindow {

    protected _opening: boolean;
    protected _closing: boolean;
    protected _dimmerSprite: unknown;

    constructor(rect: Rectangle) {
        super(...arguments);
    }

    override initialize(rect: Rectangle, ...args: any[]) {
        super.initialize(rect, ...args)
        //  this.loadWindowskin();
        this.checkRectObject(rect);
        this.move(rect.x, rect.y, rect.width, rect.height);
        this.updatePadding();
        this.updateBackOpacity();
        this.updateTone();
        this.createContents();
        this._opening = false;
        this._closing = false;
        this._dimmerSprite = null;
    }

    override destroy(options?: DestroyOptions): void {
        this.destroyContents();
        if (this._dimmerSprite) {
            //    this._dimmerSprite.bitmap.destroy
        }
        super.destroy(options);
    }

    /**
     * check whether the window use rect or not
     * @param rect the rect to check
     */
    protected checkRectObject(rect: object) {
        if (typeof rect !== "object" || !("x" in rect)) {
            throw new Error("Argument must be a Rectangle");
        }
    }

    lineHeight(): number {
        return 36;
    }

    itemWidth(): number {
        return this.innerWidth;
    }

    itemHeight(): number {
        return this.lineHeight();
    }

    itemPadding(): number {
        return 8;
    }

    baseTextRect(): Rectangle {
        const rect = new Rectangle(0, 0, this.innerWidth, this.innerHeight);
        rect.pad(-this.itemPadding(), 0);
        return rect;
    }

    async loadWindowskin(filename = "Window") {

        this.windowskin = await ImageManager.loadSystem(filename);
    }

    updatePadding() {
        this.padding = 12; // $gameSystem.windowPadding();
    }

    updateBackOpacity() {
        this.backOpacity = 125;// $gameSystem.windowOpacity();
    }

    fittingHeight(numLines: number): number {
        const stuff = 12;
        return numLines * this.itemHeight() + stuff * 2;
    }

    updateTone() {
        const tone = [17,119,170]
        this.setTone(tone[0], tone[1], tone[2]);
    }

    createContents() {
        const width = this.contentsWidth();
        const height = this.contentsHeight();
        this.destroyContents();
        this.contents = new Bitmap(width, height);
        this.contentsBack = new Bitmap(width, height);
       // this.resetFontSettings();
    }

    destroyContents() {
        if (this.contents) {
            this.contents.destroy();
        }
        if (this.contentsBack) {
            this.contentsBack.destroy();
        }
    }

    contentsWidth(): number {
        return this.innerWidth;
    }

    contentsHeight(): number {
        return this.innerHeight;
    }

    resetFontSettings() {
        this.contents.fontFace = $gameSystem.mainFontFace();
        this.contents.fontSize = $gameSystem.mainFontSize();
        //    this.resetTextColor();
    }

    override update(): void {
        super.update();
        this.updateTone();
        this.updateOpen();
        this.updateClose();
        //    this.updateBackgroundDimmer();
    }

    updateOpen() {
        if (!this._opening) return;
        this.openness += 32;
        if (!this.isOpen()) return;
        this._opening = false;
    }

    updateClose() {
        if (!this._closing) return;
        this.openness -= 32;
        if (!this.isClosed()) return;
        this._closing = false;
    }

    open() {
        if (!this.isOpen()) {
            this._opening = true;
        }
        this._closing = false;
    }

    close() {
        if (!this.isClosed()) {
            this._closing = true;
        }
        this._opening = false;
    }

    isOpening(): boolean {
        return this._opening;
    }

    isClosing(): boolean {
        return this._closing;
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    activate() {
        this.active = true;
    }

    deactivate() {
        this.active = false;
    }

    // systemColor(): number {
    //     return ColorManager.systemColor();
    // }

    changeTextColor(color: string) {
        this.contents.textColor = color;
    }
}
