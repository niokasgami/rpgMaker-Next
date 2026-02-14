import { GameActor } from '@objects/GameActor.ts';
import { $dataActors } from '@managers';


/**
 * The wrapper class for an actor array.
 */
export class GameActors {

  protected _data: GameActor[];

  constructor(){
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this._data = [];
  }

  actor(actorId: number): GameActor {
    if ($dataActors[actorId]) {
      if (!this._data[actorId]) {
        this._data[actorId] = new GameActor(actorId);
      }
      return this._data[actorId];
    }
    return null;
  }
}
