// utils/jsExtensions.ts

// Array
export function cloneArray<T>(array: T[]): T[] {
  return array.slice(0);
}

export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (!b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] instanceof Array && b[i] instanceof Array) {
      if (!arraysEqual(a[i] as any[], b[i] as any[])) return false;
    } else if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function removeFromArray<T>(array: T[], element: T): T[] {
  for (;;) {
    const index = array.indexOf(element);
    if (index >= 0) {
      array.splice(index, 1);
    } else {
      return array;
    }
  }
}

// Math
export function randomInt(max: number): number {
  return Math.floor(max * Math.random());
}

// Number
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function mod(value: number, n: number): number {
  return ((value % n) + n) % n;
}

export function padZero(value: string | number, length: number): string {
  return String(value).padStart(length, "0");
}

// String
export function containsString(str: string, search: string): boolean {
  return str.includes(search);
}

export function formatString(template: string, ...args: any[]): string {
  return template.replace(/%([0-9]+)/g, (s, n) => args[Number(n) - 1]);
}



