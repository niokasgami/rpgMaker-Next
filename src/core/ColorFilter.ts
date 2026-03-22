import { Filter, GlProgram } from 'pixi.js';
import fragment from './ColorFilter.frag';
import vertex from "./ColorFilter.vert";

// v8 has a default vertex shader you can use


export class ColorFilter extends Filter {
  constructor() {
    super({
      glProgram: new GlProgram({
        fragment,
        vertex,
      }),
      resources: {
        colorUniforms: {
          hue:        { value: 0,                  type: 'f32' },
          brightness: { value: 255,                type: 'f32' },
          colorTone:  { value: [0, 0, 0, 0],       type: 'vec4<f32>' },
          blendColor: { value: [0, 0, 0, 0],       type: 'vec4<f32>' },
        }
      }
    });
  }

  /**
   * Sets the hue rotation value.
   *
   * @param  hue - The hue value (-360, 360).
   */
  setHue(hue: number) {
    this.resources.colorUniforms.uniforms.hue = Number(hue);
  }

  /**
   * Sets the color tone.
   *
   * @param tone - The color tone [r, g, b, gray].
   */
  setColorTone(tone: number[]) {
    if(!(tone instanceof Array)) throw new Error("Argument must be an array");
    this.resources.colorUniforms.uniforms.colorTone = tone;
  }

  /**
   * Sets the blend color.
   *
   * @param  color - The blend color [r, g, b, a].
   */
  setBlendColor(color: number[]) {
    if(!(color instanceof Array)) throw new Error("Argument must be an array");
    this.resources.colorUniforms.uniforms.blendColor = color;
  }

  /**
   * Sets the brightness.
   *
   * @param {number} brightness - The brightness (0 to 255).
   */
  setBrightness(brightness: number) {
    this.resources.colorUniforms.uniforms.brightness = Number(brightness);
  }
}
