import {
  Container,
  extensions,
  ExtensionType,
  Graphics,
  ICanvas, Instruction, InstructionPipe,
  InstructionSet,
  Renderer,
  RenderPipe,
  WebGLRenderer
} from 'pixi.js';
import { UpdatableChildren } from '@core/RpgWindow.ts';

/**
 * The layer which contains game windows.
 * @remarks since v8 use render pipes most of its logics is transfered to
 * pixi render pipes, however for the moment it only supports webgl and webgpu will come later
 */
export class WindowLayer extends Container {

  override renderPipeId = "WindowLayer";

  constructor() {
    super();
    this.initialize(...arguments);
  }

  protected initialize(...args: any[]) {}

  update() {
    for (const child of this.children as UpdatableChildren[]) {
      if (child.update) {
        child.update();
      }
    }
  }

  /**
   * Destroys the window layer.
   */
  override destroy(): void {
    super.destroy({ children: true });
  }
}

/// @TODO I am not sure yet how to approach stencils


interface WindowLayerInstruction extends Instruction {
  layer: WindowLayer
}
class WindowLayerWebGLPipe implements RenderPipe<WindowLayer>,  InstructionPipe<WindowLayerInstruction> {

  static extension = {
    type: ExtensionType.WebGLPipes,
    name: 'windowLayer'
  };

  private readonly _renderer: WebGLRenderer;

  constructor(renderer: WebGLRenderer) {
    this._renderer = renderer;
  }
  addRenderable(renderable: WindowLayer, instructionSet: InstructionSet) {
    instructionSet.add({
      renderPipeId: "windowLayer",
      canBundle: false,
      layer: renderable
    } as WindowLayerInstruction)
  }

  execute(instruction: WindowLayerInstruction) {
    const layer = instruction.layer;
    const renderer = this._renderer;
    const gl = renderer.gl;

    if(!layer.visible) return;

    renderer.renderPipes.batch.break(instruction);
  }
  destroyRenderable(renderable: WindowLayer): void {
  }

  updateRenderable(renderable: WindowLayer): void {
  }

  validateRenderable(renderable: WindowLayer): boolean {
    return false;
  }

}
