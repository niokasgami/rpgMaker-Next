import { Stage } from '../core';
import { IScene } from '../managers/SceneManager';

export abstract class SceneBase extends Stage implements IScene {

  constructor() {
    super();
  }

  initialize() {

  }

  async create(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  start(): void {
    throw new Error('Method not implemented.');
  }

  async terminate(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  update(): void {
    throw new Error('Method not implemented.');
  }


}
