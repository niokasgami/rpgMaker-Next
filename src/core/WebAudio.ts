import { Utils } from '@core/Utils.ts';
import { Assets } from 'pixi.js';

export class WebAudio {

  private _url: string;
  private static _context: AudioContext;
  private static _masterGainNode: GainNode;
  private static _masterVolume: number;

  private _data: null;
  private _fetchedSize: number;
  private _fetchedData: unknown[];
  private _buffers: AudioBuffer[];
  private _sourceNodes: AudioNode[];
  private _gainNode: GainNode;
  private _pannerNode: PannerNode;
  private _totalTime: number;
  private _sampleRate: number;
  private _loop: number;
  private _loopStart: number;
  private _loopLength: number;
  private _loopStartTime: number;
  private _loopLengthTime: number;
  private _startTime: number;
  private _volume: number;
  private _pitch: number;
  private _pan: number;
  private _endTimer: null;
  private _loadListeners: (() => void)[];
  private _stopListeners: (() => void)[];
  private _lastUpdateTime: number;
  private _isLoaded: boolean;
  private _isError: boolean;
  private _isPlaying: boolean;
  private _decoder: VorbisDecoder;


  constructor(url: string, ...args: any[]) {
    this.initialize(url, ...args);
  }

  initialize(url: string, ...args: any[]) {
    this.clear();
    this._url = url;
  }

  /**
   * Initializes the audio system.
   *
   * @returns {boolean} True if the audio system is available.
   */
  static initialize(): boolean {
    this._context = null;
    this._masterGainNode = null;
    this._masterVolume = 1;
    this.createContext();
    this.createMasterGainNode();
    this.setupEventHandlers();
    return !!this._context;
  }

  /**
   * Sets the master volume for all audio.
   * @param volume - The master volume (0 to 1).
   */
  static setMasterVolume(volume: number) {
    this._masterVolume = volume;
    this.resetVolume();
  }

  private static createContext() {
    try {
      const AudioContext = window.AudioContext;
      this._context = new AudioContext();
    } catch (e) {
      this._context = null;
    }
  }

  private static currentTime(): number {
    return this._context ? this._context.currentTime : 0;
  }

  private static createMasterGainNode() {
    const context = this._context;
    if (context) {
      this._masterGainNode = context.createGain();
      this.resetVolume();
      this._masterGainNode.connect(context.destination);
    }
  }

  private static setupEventHandlers(): void {
    const onUserGesture = this.onUserGesture.bind(this);
    const onVisibilityChange = this.onVisibilityChange.bind(this);
    document.addEventListener('keydown', onUserGesture);
    document.addEventListener('mousedown', onUserGesture);
    document.addEventListener('touchend', onUserGesture);
    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  private static onUserGesture() {
    const context = this._context;
    if (context && context.state === 'suspended') {
      context.resume();
    }
  }

  private static onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.onHide();
    } else {
      this.onShow();
    }
  }

  private static onHide() {
    if (this.shouldMuteOnHide()) {
      this.fadeOut(1);
    }
  }

  private static onShow() {
    if (this.shouldMuteOnHide()) {
      this.fadeIn(1);
    }
  }

  private static shouldMuteOnHide(): boolean {
    return Utils.isMobileDevice() && !window.matchMedia('(display-mode: standalone)').matches;
  }

  private static resetVolume() {
    if (this._masterGainNode) {
      const gain = this._masterGainNode.gain;
      const volume = this._masterVolume;
      const currentTime = this.currentTime();
      gain.setValueAtTime(volume, currentTime);
    }
  }

  private static fadeIn(duration: number) {
    if (this._masterGainNode) {
      const gain = this._masterGainNode.gain;
      const volume = this._masterVolume;
      const currentTime = this.currentTime();
      gain.setValueAtTime(0, currentTime);
      gain.linearRampToValueAtTime(volume, currentTime + duration);
    }
  }

  private static fadeOut(duration: number) {
    if (this._masterGainNode) {
      const gain = this._masterGainNode.gain;
      const volume = this._masterVolume;
      const currentTime = this.currentTime();
      gain.setValueAtTime(volume, currentTime);
      gain.linearRampToValueAtTime(0, currentTime + duration);
    }
  }

  clear() {
    this.stop();
    this._data = null;
    this._fetchedSize = 0;
    this._fetchedData = [];
    this._buffers = [];
    this._sourceNodes = [];
    this._gainNode = null;
    this._pannerNode = null;
    this._totalTime = 0;
    this._sampleRate = 0;
    this._loop = 0;
    this._loopStart = 0;
    this._loopLength = 0;
    this._loopStartTime = 0;
    this._loopLengthTime = 0;
    this._startTime = 0;
    this._volume = 1;
    this._pitch = 1;
    this._pan = 0;
    this._endTimer = null;
    this._loadListeners = []
    this._stopListeners = [];
    this._lastUpdateTime = 0;
    this._isLoaded = false;
    this._isError = false;
    this._isPlaying = false;
    this._decoder = null;
  }

  /**
   * the audio file url
   * @type string
   */
  get url(): string {
    return this._url;
  }

  /**
   * The volume of the audio.
   *
   * @type number
   * @name WebAudio#volume
   */
  get volume(): number {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = value;
    if (this._gainNode) {
      this._gainNode.gain.setValueAtTime(
        this._volume,
        WebAudio.currentTime()
      );
    }
  }

  /**
   * The pitch of the audio.
   *
   * @type number
   * @name WebAudio#pitch
   */
  get pitch(): number {
    return this._pitch;
  }

  set pitch(value: number) {
    if (this._pitch !== value) {
      this._pitch = value;
      if (this.isPlaying()) {
        this.play(this._loop, 0);
      }
    }
  }

  /**
   * The pan of the audio.
   *
   * @type number
   * @name WebAudio#pan
   */
  get pan(): number {
    return this._pan;
  }

  set pan(value: number) {
    this._pan = value;
    this.updatePanner();
  }

  /**
   * Checks whether the audio data is ready to play.
   *
   * @returns {boolean} True if the audio data is ready to play.
   */
  isReady(): boolean {
    return this._buffers && this._buffers.length > 0;
  }

  /**
   * Checks whether a loading error has occurred.
   *
   * @returns {boolean} True if a loading error has occurred.
   */
  isError(): boolean {
    return this._isError;
  }

  /**
   * Checks whether the audio is playing.
   *
   * @returns {boolean} True if the audio is playing.
   */
  isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Plays the audio.
   *
   * @param {boolean} loop - Whether the audio data play in a loop.
   * @param {number} offset - The start position to play in seconds.
   */
  play(loop: number, offset: number) {
    this._loop = loop;
    if (this.isReady()) {
      offset = offset || 0;
      this.startPlaying(offset);
    } else if (WebAudio._context) {
      this.addLoadListener(() => this.play(loop, offset));
    }
    this._isPlaying = true;
  }

  /**
   * Stop the audio
   */
  stop() {
    this._isPlaying = false;
    this.removeEndTimer();
    this.removeNodes();
    this._loadListeners = [];
    if (this._stopListeners) {
      while (this._stopListeners.length > 0) {
        const listner = this._stopListeners.shift();
        listner();
      }
    }
  }

  /**
   * Destroy the audio
   */
  destroy() {
    this.destroyDecoder();
    this.clear();
  }

  /**
   * Performs the audio fade-in.
   *
   * @param {number} duration - Fade-in time in seconds.
   */
  fadeIn(duration: number) {
    if (this.isReady()) {
      if (this._gainNode) {
        const gain = this._gainNode.gain;
        const currentTime = WebAudio.currentTime();
        gain.setValueAtTime(0, currentTime);
        gain.linearRampToValueAtTime(this._volume, currentTime + duration);
      }
    } else {
      this.addLoadListener(() => this.fadeIn(duration));
    }
  }

  fadeOut(duration: number) {
    if (this._gainNode) {
      const gain = this._gainNode.gain;
      const currentTime = WebAudio.currentTime();
      gain.setValueAtTime(this._volume, currentTime);
      gain.linearRampToValueAtTime(0, currentTime + duration);
    }
    this._isPlaying = false;
    this._loadListeners = [];
  }

  /**
   * Gets the seek position of the audio.
   */
  seek(): number {
    if (WebAudio._context) {
      let pos = (WebAudio.currentTime() - this._startTime) * this._pitch;
      if (this._loopLengthTime > 0) {
        while (pos >= this._loopStartTime + this._loopLengthTime) {
          pos -= this._loopLengthTime;
        }
      }
      return pos;
    } else {
      return 0;
    }
  }

  /**
   * Adds a callback function that will be called when the audio data is loaded.
   *
   * @param listner - The callback function.
   */
  addLoadListener(listner: () => void) {
    this._loadListeners.push(listner);
  }

  /**
   * Adds a callback function that will be called when the playback is stopped.
   *
   * @param {function} listner - The callback function.
   */
  addStopListener(listner: () => void) {
    this._stopListeners.push(listner);
  }

  /**
   * Tries to load the audio again.
   */
  retry() {
    this.startLoading();
    if (this._isPlaying) {
      this.play(this._loop, 0);
    }
  }

  private async startLoading(){
    if(WebAudio._context) return;

    const url = this.realUrl();
    const currentTime = WebAudio.currentTime();

    this._lastUpdateTime = currentTime - 0.5;
    this._isError = false;
    this._isLoaded = false;
    this.destroyDecoder();

    if(this.shouldUseDecoder()){
      this.createDecoder();
    }

    if(Utils.isLocal()){
      this.startNodeLoading(url);
    } else {
      this.startFetching(url)
    }
  }

  private realUrl(): string {
    return this._url + (Utils.hasEncryptedAudio() ? "_" : "");
  }

  private shouldUseDecoder(): boolean {
    return !Utils.canPlayOgg() && typeof VorbisDecoder === "function";
  }

  private createDecoder() {
    this._decoder = new VorbisDecoder(
      WebAudio._context,
      this.onDecode.bind(this),
      this.onError.bind(this),
    );
  }

  private destroyDecoder(){
    if(!this._decoder) return;
    this._decoder.destroy();
    this._decoder = null;
  }

  private async startNodeLoading(url: string) {
    try {
      const arrayBuffer = await Assets.load<ArrayBuffer>({
        src: url,
        loadParser: "load"
      })
    }
  }
}
