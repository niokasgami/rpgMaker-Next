/**
 * The static class that handles the player input.
 */
export class Input {

  private static _inputMap: Map<string, AbstractInput[]>;

  static registerAction(name: string, input: AbstractInput | AbstractInput[]){
    if(this._inputMap.has(name)){
      const inputs = this._inputMap.get(name);
      if(Array.isArray(input)){
        inputs.push(...input);
      } else {
        inputs.push(input);
      }
    }
    else {
      if(input instanceof Array){
        this._inputMap.set(name, input);
      } else {
        this._inputMap.get(name).push(input);
      }
    }
  }
}

interface AbstractInput {
  name: string;
  type: "keyboard" | "mouse" | "touch" | "gamepad";
}
