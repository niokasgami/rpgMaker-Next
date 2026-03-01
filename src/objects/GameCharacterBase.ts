


export abstract class GameCharacterBase {


  protected _x: number;
  protected _y: number;
  protected _realX : number;
  protected _realY : number;
  protected _moveSpeed: number;
  protected _moveFrequency: number;
  protected _opacity: number
  protected _blendMode: number; // TODO : pixijs use union strting
  protected _direction: number;
  protected _pattern: number;
  protected _priorityType: number;
  protected _tileId: number;
  protected _characterName: string;
  protected _characterIndex: number;
  protected _isObjectCharacter: boolean;
  protected _walkAnime : boolean;
  protected _stepAnime: boolean;
  protected _directionFix: boolean;
  protected _through: boolean;
  protected _transparent: boolean;
  protected _bushDepth: number;



  constructor() {
    this.initialize(...arguments);
  }

  initialize(...args: any[]) {
    this.initMembers();
  }

  protected initMembers(){
    this._x = 0;
    this._y = 0;
    this._realX = 0;
    this._realY = 0;
    this._moveSpeed = 4;
    this._moveFrequency = 6;
    this._opacity = 255;
    this._blendMode = 0;
    this._direction = 2;
    this._pattern = 1;
    this._priorityType = 1;
    this._tileId = 0;
    this._characterName = "";
    this._characterIndex = 0;
    this._isObjectCharacter = false;
    this._walkAnime = true;
    this._stepAnime = false;
    this._directionFix = false;
    this._through = false;
    this._transparent = false;
    this._bushDepth = 0;
    this._animationId = 0;
    this._balloonId = 0;
    this._animationPlaying = false;
    this._balloonPlaying = false;
    this._animationCount = 0;
    this._stopCount = 0;
    this._jumpCount = 0;
    this._jumpPeak = 0;
    this._movementSuccess = true;
  }
}
