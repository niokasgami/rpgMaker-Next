export {};

declare global {
  export interface Document {
    fullscreenElement?: Element | null;
    fullScreenElement?: Element | null;
    mozFullScreen?: Element | null;
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;

    exitFullscreen: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    cancelFullScreen?: () => Promise<void>;
    webkitCancelFullScreen?: () => Promise<void>;
  }

  export interface HTMLElement {
    requestFullscreen: () => Promise<void>;
    requestFullScreen: () => Promise<void>;
    webkitRequestFullscreen: () => Promise<void>;
    webkitRequestFullScreen: (value: number) => Promise<void>;
    mozRequestFullScreen: () => Promise<void>;
    msRequestFullscreen: () => Promise<void>;
    cancelFullscreen: () => Promise<void>;


  }

  interface Element {
    ALLOW_KEYBOARD_INPUT?: number;
  }

}
