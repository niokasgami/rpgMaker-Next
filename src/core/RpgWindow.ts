import { Container } from 'pixi.js';
import { Bitmap } from './Bitmap.ts';
import { IContractualClass } from './interfaces';


export class RpgWindow extends Container implements  IContractualClass{

  private _isWindow: boolean;
  private _windowskin: Bitmap;

  constructor() {
    super();
    this.initialize(...arguments);
  }

  initialize(...args: any[]): void {
    this._isWindow = true;
    this._windowskin = null;

  }
}
