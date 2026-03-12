import { Point } from 'pixi.js';
import { GameCommonEvent } from '@objects/GameCommonEvent.ts';
import { Utils } from '@core';
import { GameBattler } from '@objects/GameBattler.ts';
import { $dataAnimations, $dataCommonEvents, $gameParty } from '@managers';
import { DataCommonEvent } from '@data';


export type TouchState = 'select' | 'click' | '';

export interface AnimationRequest {
  targets: unknown,
  animationId: number,
  mirror: boolean,
}

export interface BalloonRequest {
  targets: unknown,
  balloonId: number,
}

export class GameTemp {

  private _isPlaytest: boolean;
  private _destinationX: number;
  private _destinationY: number;
  private _touchTarget: GameBattler;
  private _touchState: TouchState;
  private _needsBattleRefresh: boolean;
  private _commonEventQueue: number[];
  private _animationQueue: AnimationRequest[];
  private _balloonQueue: BalloonRequest[];
  private _lastActionData: number[];


  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this._isPlaytest = Utils.isOptionValid('test');
    this._destinationX = null;
    this._destinationY = null;
    this._touchTarget = null;
    this._touchState = '';
    this._needsBattleRefresh = false;
    this._commonEventQueue = [];
    this._animationQueue = [];
    this._lastActionData = [0, 0, 0, 0, 0, 0];
  }

  /**
   * check whether the game is in playtest mode or not.
   */
  isPlaytest(): boolean {
    return this._isPlaytest;
  }

  setDestination(x: number, y: number) {
    this._destinationX = x;
    this._destinationY = y;
  }

  clearDestination() {
    this._destinationX = null;
    this._destinationY = null;
  }

  isDestinationValid(): boolean {
    return this._destinationX !== null;
  }

  get destinationX(): number {
    return this._destinationX;
  }

  get destinationY(): number {
    return this._destinationY;
  }

  setTouchState(target: GameBattler, state: TouchState) {
    this._touchTarget = target;
    this._touchState = state;
  }

  clearTouchState() {
    this._touchTarget = null;
    this._touchState = '';
  }

  get touchTarget(): GameBattler {
    return this._touchTarget;
  }

  get touchState(): TouchState {
    return this._touchState;
  }

  requestBattleRefresh() {
    if (!$gameParty.inBattle()) return;
    this._needsBattleRefresh = true;
  }

  clearBattleRefreshRequest() {
    this._needsBattleRefresh = false;
  }

  isBattleRefreshRequested(): boolean {
    return this._needsBattleRefresh;
  }

  reserveCommonEvent(commonEventId: number) {
    this._commonEventQueue.push(commonEventId);
  }

  retrieveCommonEvent(): DataCommonEvent {
    return $dataCommonEvents[this._commonEventQueue.shift()];
  }

  clearCommonEventReservation() {
    this._commonEventQueue.length = 0;
  }

  isCommonEventReserved(): boolean {
    return this._commonEventQueue.length > 0;
  }

  requestAnimation(targets: unknown[], animationId: number, mirror = false) {
    if (!$dataAnimations[animationId]) return;
    const request = {
      targets: targets,
      animationId: animationId,
      mirror: mirror
    };
    this._animationQueue.push(request);
    for (const target of targets) {
      if (target.startAnimation) {
        target.startAnimation();
      }
    }
  }

  retrieveAnimation(): AnimationRequest {
    return this._animationQueue.shift();
  }

  requestBalloon(target: unknown, balloonId){
    const request = { target: target, balloonId: balloonId };
    this._balloonQueue.push(request);
    if (target.startBalloon) {
      target.startBalloon();
    }
  }

  retrieveBalloon(): BalloonRequest {
    return this._balloonQueue.shift();
  }

  lastActionData(type: number): number {
    return this._lastActionData[type] || 0;
  }

  setLastActionData(type: number, value: number) {
    this._lastActionData[type] = value;
  }

  setLastUsedSkillId(skillId: number) {
    this.setLastActionData(0, skillId);
  }

  setLastUsedItemId(itemId: number) {
    this.setLastActionData(1, itemId);
  }

  setLastSubjectActorId(actorId: number) {
    this.setLastActionData(2, actorId);
  }

  setLastSubjectEnemyIndex(enemyIndex: number) {
    this.setLastActionData(3,enemyIndex);
  }

  setLastTargetActorId(actorId: number) {
    this.setLastActionData(4, actorId);
  }

  setLastTargetEnemyIndex(enemyIndex: number){
    this.setLastActionData(5,enemyIndex);
  }
}
