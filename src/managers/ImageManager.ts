import { Bitmap, Utils } from '@core';
import { $dataSystem } from '@managers/DataManager.ts';

/**
 * The static class that loads images, creates bitmap objects and retains them.
 */
export class ImageManager {

  /**
   * The default icon width
   */
  static standardIconWidth: number = 32;

  /**
   * The default icon height
   */
  static standardIconHeight: number = 32;

  /**
   * The default face width
   */
  static standardFaceWidth: number = 144;

  /**
   * The default face height
   */
  static standardFaceHeight: number = 144;

  private static _cache : Map<string, Bitmap> = new Map();
  private static _system : Map<string, Bitmap> = new Map();

  private static _emptyBitmap: Bitmap | null = null;

  private static getEmptyBitmap(): Bitmap {
    if (!this._emptyBitmap) {
      this._emptyBitmap = new Bitmap(1, 1);
    }
    return this._emptyBitmap;
  }

  /**
   * The icon width
   */
  static  get iconWidth(): number {
    return this.getIconSize();
  }

  /**
   * The icon height
   */
  static get iconHeight(): number {
    return this.getIconSize();
  }

  /**
   * the face width
   */
  static get faceWidth(): number {
    return this.getFaceSize();
  }

  /**
   * the face height
   */
  static get faceHeight(): number {
    return this.getFaceSize();
  }

  /**
   * return the icon size dynamically based on either the user input or the default one.
   */
  static getIconSize(): number {
    if("iconSize" in $dataSystem) {
      return $dataSystem.iconSize;
    } else {
      return this.standardIconWidth
    }
  }

  /**
   * return the face size dynamically based on either the user input or the default one.
   */
  static getFaceSize(): number {
    if ("faceSize" in $dataSystem) {
      return $dataSystem.faceSize;
    } else {
      return this.standardFaceWidth;
    }
  }

  /**
   * load animations bitmap
   * @param filename - the image name
   */
  static async loadAnimation(filename: string): Promise<Bitmap>{
    return await this.loadBitmap("img/animations/", filename);
  }

  /**
   * load battleback1 bitmap
   * @param filename - the image name
   */
  static async loadBattleback1(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/battleback1/", filename);
  }

  /**
   * load battleback2 bitmap
   * @param filename - the image name
   */
  static async loadBattleback2(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/battleback2/", filename);
  }

  /**
   * load enemy bitmap
   * @param filename - the image name
   */
  static async loadEnemy(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/enemies", filename);
  }

  /**
   * load the character bitmap
   * @param filename - the image name
   */
  static async loadCharacter(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/characters/", filename);
  }

  /**
   * load the faceset bitmap
   * @param filename - the image name
   */
  static async loadFace(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/faces/", filename);
  }

  /**
   * load the parallax bitmap
   * @param filename - the image name
   */
  static async loadParallax(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/parallaxes/", filename);
  }

  /**
   * load the picture bitmap
   * @param filename - the image name
   */
  static async loadPicture(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/pictures/", filename);
  }

  /**
   * load the sideview actor bitmap
   * @param filename - the image name
   */
  static async loadSvActor(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/sv_actors/", filename);
  }

  /**
   * load the sideview enemy bitmap
   * @param filename - the image name
   */
  static async loadSvEnemy(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/sv_enemies/", filename);
  }

  /**
   * load the system bitmap
   * @param filename - the image name
   */
  static async loadSystem(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/systems/", filename);
  }

  /**
   * load the tileset bitmap
   * @param filename - the image name
   */
  static async loadTileset(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/tilesets/", filename);
  }

  /**
   * load the title1 bitmap
   * @param filename - the image name
   */
  static async loadTitle1(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/title1/", filename);
  }

  /**
   * load the title2 bitmap
   * @param filename - the image name
   */
  static async loadTitle2(filename: string): Promise<Bitmap> {
    return await this.loadBitmap("img/title2/", filename);
  }

  /**
   * load a image and convert it into a bitmap
   * @param folder - the img directory folder
   * @param filename - the image name
   */
  static async loadBitmap(folder: string, filename: string): Promise<Bitmap> {
    if (filename) {
      const url = folder + Utils.encodeURI(filename) + ".png";
      return await this.loadBitmapFromUrl(url);
    } else {
      return this.getEmptyBitmap(); // ← lazy, not static initializer
    }
  }

  /**
   * load the bitmap from url
   * @param url - the bitmap url
   */
  private static async loadBitmapFromUrl(url : string): Promise<Bitmap> {
    const cache = url.includes("/system/") ? this._system : this._cache;
    if(!cache.has(url)){
      const bitmap = await Bitmap.load(url);
      cache.set(url, bitmap);
    }
    return cache.get(url);
  }

  /**
   * clear the image manager cache
   */
  static clear() {
    const cache = this._cache;
    for (const bitmap of cache.values()) {
      bitmap.destroy();
    }
    this._cache.clear();
  }

  /**
   * check if all the bitmaps are done loading
   * @return {boolean} true if the bitmaps are ready
   */
  static isReady(): boolean {
    for (const cache of [this._cache, this._system]) {
      for (const [url, bitmap] of cache) {
        if (bitmap.isError()) {
          this.throwLoadError(bitmap);
        }
        if (!bitmap.isReady()) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * throw load error
   * @param bitmap - the bitmap that erorred
   */
  static throwLoadError(bitmap: Bitmap) {
    const retry = bitmap.retry.bind(bitmap);
    throw ["LoadError", bitmap.url, retry];
  }

  /**
   * return whether the current image is an object character
   * @param filename - the image name
   */
  static isObjectCharacter(filename: string) : boolean {
    const sign = Utils.extractFileName(filename).match(/^[!$]+/);
    return sign && sign[0].includes("!");
  }

  /**
   * return whether the current image is a big character sprite
   * @param filename - the image name
   */
  static isBigCharacter(filename:string): boolean {
    const sign = Utils.extractFileName(filename).match(/^[!$]+/);
    return sign && sign[0].includes("$");
  }

  /**
   * return whether the current image is a zero parallax sprite
   * @param filename - the image name
   */
  static isZeroParallax(filename: string): boolean {
    return Utils.extractFileName(filename).charAt(0) === "!";
  }
}
