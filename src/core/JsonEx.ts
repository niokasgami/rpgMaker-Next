/**
 * The static class that handles json with object informations.
 */
export class JsonEx {

  /**
   * The maximum depth of objects.
   *
   * @type number
   * @default 100
   */
  static maxDepth: number = 100;

  /**
   * Converts an object to a JSON string with object information.
   *
   * @param {object} object - The object to be converted.
   * @returns {string} The JSON string.
   */
  static stringify(object: object): string {
    return JSON.stringify(this.encode(object,0));
  }

  /**
   * Parses a JSON string and reconstructs the corresponding object.
   *
   * @param {string} json - The JSON string.
   * @returns  The reconstructed object.
   */
  static parse<T>(json: string): T {
    return this.decode(JSON.parse(json));
  }

  /**
   * Makes a deep copy of the specified object.
   *
   * @param {object} object - The object to be copied.
   * @returns {object} The copied object.
   */
  static makeDeepCopy(object: object): any {
    return this.parse(this.stringify(object));
  }

  private static encode(value: any, depth: number = 0) {
    if(depth >=  this.maxDepth) throw new Error('Object too deep');

    const type = Object.prototype.toString.call(value);
    if (type === "[object Object]" || type === "[object Array]") {
      const constructorName = value.constructor.name;
      if (constructorName !== "Object" && constructorName !== "Array") {
        value["@"] = constructorName;
      }
      for (const key of Object.keys(value)) {
        value[key] = this.encode(value[key], depth + 1);
      }
    }
    return value;
  }

  private static decode(value: any) : any {
    const type = Object.prototype.toString.call(value);
    if (type === "[object Object]" || type === "[object Array]") {
      if (value["@"]) {
        const constructor = window[value["@"]];
        if (constructor) {
          // @ts-ignore
          Object.setPrototypeOf(value, constructor.prototype);
        }
      }
      for (const key of Object.keys(value)) {
        value[key] = this.decode(value[key]);
      }
    }
    return value;
  }
}
