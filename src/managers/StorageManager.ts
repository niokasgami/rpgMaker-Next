import { JsonEx, Utils } from '@core';
import pako from 'pako';
import localforage from 'localforage';
import fs from 'fs';
import path from 'path';
import { $dataSystem } from '@managers/DataManager.ts';


/**
 * The static class that manage storage for saving game data.
 */
export class StorageManager {

  private static _forageKeys: unknown[];
  private static _forageKeysUpdated: boolean = false;

  /**
   * check the game is played on desktop or in the browser
   * @return {boolean}
   */
  static isLocalMode(): boolean {
    return Utils.isNwjs();
  }

  /**
   * Save the object to a zip / save file
   * @param saveName - the savefile name
   * @param object = the object to save
   */
  static async saveObject(saveName: string, object: object): Promise<void> {
    const json = await this.objectToJson(object);
    const zip = await this.jsonToZip(json); // Remove await if jsonToZip is synchronous
    await this.saveZip(saveName, zip);
  }

  /**
   * Load the savefile from a zip and convert it back into a proper object.
   * @param saveName - the savefile name
   */
  static async loadObject(saveName: string): Promise<any> {
    const zip = await this.loadZip(saveName);
    const json = await this.zipToJson(zip);
    return await this.jsonToObject(json);
  }

  /**
   * convert the object to a JSON string
   * @param object - the object to convery into a JSON
   */
  static async objectToJson(object: any): Promise<string> {
    return JsonEx.stringify(object);
  }

  /**
   * Parse a JSON string back to an object.
   * @param json - the JSON string
   */
  static async jsonToObject<T>(json: string): Promise<T> {
    return JsonEx.parse<T>(json);
  }

  /**
   * Convert a JSON to a Zip file
   * @param json - the JSON string to convert
   */
  static async jsonToZip(json: string): Promise<Uint8Array> {
    const zip = pako.deflate(json, { level: 1 });
    if (zip.length >= 50000) {
      console.warn('Save data is too big.');
    }
    return zip;
  }

  /**
   * Parse a zip file back to a JSON string.
   * @param zip - the zip file to convert
   */
  static async zipToJson(zip: Uint8Array | null): Promise<string> {
    if (!zip) {
      return 'null';
    }
    return pako.inflate(zip, { to: 'string' }) as string;
  }

  /**
   * save a zip file to either the desktop or browser
   * @param saveName - the savefile name
   * @param zip - the zip file
   */
  static async saveZip(saveName: string, zip: Uint8Array| null): Promise<void> {
    if (!zip) {
      throw new Error('Cannot save null data');
    }

    if (this.isLocalMode()) {
      await this.saveToLocalFile(saveName, zip);
    } else {
      await this.saveToForage(saveName, zip);
    }
  }

  /**
   * Load the zip file from the desktop or browser storage
   * @param saveName - the savefile name
   */
  static async loadZip(saveName: string): Promise<Uint8Array> {
    let data: Uint8Array | null;

    if (this.isLocalMode()) {
      data = await this.loadFromLocalFile(saveName);
    } else {
      data = await this.loadFromForage(saveName);
    }
    if (!data) {
      throw new Error('Save file not found');
    }
    return data;
  }

  static exists(saveName: string){
    if (this.isLocalMode()) {
      return this.localFileExists(saveName);
    } else {
      return this.forageExists(saveName);
    }
  }

  static remove(saveName: string){
    if (this.isLocalMode()) {
      return this.removeLocalFile(saveName);
    } else {
      return this.removeForage(saveName);
    }
  }

  static async saveToLocalFile(saveName: string, zip: Uint8Array): Promise<void> {
    const dirPath = this.fileDirectoryPath();
    const filePath = this.filePath(saveName);
    const backupFilePath = filePath + "_";

    this.fsMkdir(dirPath);
    this.fsUnlink(backupFilePath);
    this.fsRename(filePath, backupFilePath);

    try {
      this.fsWriteFile(filePath, zip);
      this.fsUnlink(backupFilePath);
    } catch (e) {
      try {
        this.fsUnlink(filePath);
        this.fsRename(backupFilePath, filePath);
      } catch (e2) {
        // Ignore restoration errors
      }
      throw e;
    }
  }

  static async loadFromLocalFile(saveName: string): Promise<Uint8Array> {
    const filePath = this.filePath(saveName);
    const data = this.fsReadFile(filePath);

    if (!data) {
      throw new Error("Savefile not found");
    }

    return data;
  }

  static localFileExists(saveName: string): boolean {
    return fs.existsSync(this.filePath(saveName));
  }

  static removeLocalFile(saveName: string){
    this.fsUnlink(this.filePath(saveName));
  }

  static async saveToForage(saveName: string, zip: Uint8Array): Promise<void> {
    const key = this.forageKey(saveName);
    const testKey = this.forageTestKey();

    // Test write first
    await localforage.setItem(testKey, zip);

    // Clean up test key after a delay
    setTimeout(() => localforage.removeItem(testKey), 0);

    // Save actual data
    await localforage.setItem(key, zip);

    // Update key cache
    await this.updateForageKeys();
  }

  static async loadFromForage(saveName: string): Promise<Uint8Array> {
    const key = this.forageKey(saveName);
    const data = await localforage.getItem<Uint8Array>(key);

    if (!data) {
      throw new Error("Savefile not found");
    }
    return data;
  }

  static forageExists(saveName: string): boolean {
    const key = this.forageKey(saveName);
    return this._forageKeys.includes(key);
  }

  static async removeForage(saveName: string): Promise<void> {
    const key = this.forageKey(saveName);
    await localforage.removeItem(key);
    await this.updateForageKeys();
  }

  static async updateForageKeys(): Promise<void> {
    this._forageKeysUpdated = false;
    this._forageKeys = await localforage.keys();
    this._forageKeysUpdated = true;
  }

  static forageKeysUpdated(): boolean {
    return this._forageKeysUpdated;
  }

  static fsMkdir(path: string){
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  static fsRename(oldPath: string, newPath: string){
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  }

  static fsUnlink(path: string){
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }

  static fsReadFile(path: string): Buffer | null {
    if (!fs.existsSync(path)) {
      return null;
    }
    return fs.readFileSync(path);
  }

  static fsWriteFile(path: string, data: any){
    fs.writeFileSync(path, data);
  }

  static fileDirectoryPath(): string {
    const base = path.dirname(require.main?.filename || process.cwd());
    return path.join(base, "save/");
  }

  static filePath(saveName: string): string {
    const dir = this.fileDirectoryPath();
    return `${dir + saveName}.rmmzsave`;
  }

  static forageKey(saveName: string ): string {
    const gameId = $dataSystem.advanced.gameId;
    return `rmmzsave.${gameId}.${saveName}`;
  }

  static forageTestKey(): string {
    return "rmmzsave.test";
  }
}
