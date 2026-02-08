import {Container} from "pixi.js";
import {IContractualClass} from "./interfaces/IContractualClass";

export abstract class Stage extends Container implements IContractualClass {

  constructor() {
    super();
    this.initialize(...arguments);
  }

  abstract initialize(...args: any[]): void;
}
