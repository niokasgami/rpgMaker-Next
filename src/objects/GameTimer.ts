/**
 *  The game object class for the timer.
 *  @todo maybe implements an event emitter?
 */
export class GameTimer {

  private _frames: number;
  private _working: boolean;

  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this._frames = 0;
    this._working = false;
  }

  /**
   * update the timer
   * @param sceneActive - check whether the scene is active or not
   */
  update(sceneActive: boolean) {
    if(!sceneActive && this._working && this._frames < 0) return;
    this._frames--;
    if(this._frames === 0) this.onExpire();
  }

  /**
   * start the timer
   * @param count
   */
  start(count: number) {
    this._frames = count;
    this._working = true;
  }

  /**
   * stop the timer
   */
  stop(){
    this._working = false;
  }

  /**
   * check if the timer is currently working
   */
  isWorking(): boolean {
    return this._working;
  }

  /**
   * return the timer in seconds format
   */
  seconds(): number {
    return Math.floor(this._frames / 60);
  }

  /**
   * return the current timer frame
   */
  frames(): number {
    return this._frames;
  }

  /**
   * action executed once the timer expire
   */
  onExpire()  {
    BattleManager.abort();
  }
}
