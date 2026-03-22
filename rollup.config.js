import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from "@rollup/plugin-replace";
import importAsString from 'rollup-plugin-string-import';

const fileName = 'rm-next.mjs'
const output = "game/js/";

// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.ts',
  output: {
    file: output + fileName,
    format: 'es'
  },
  plugins: [
    typescript(),
    resolve({
      preferBuiltins: false,
      browser: true,
      exportConditions: ['default', 'module', 'import']
    }),
    commonjs({
      transformMixedEsModules: true
    }),
    importAsString({
      include: ["./src/**/*.frag", "./src/**/*.vert"]
    })
  ],
  external: [
    'pixi.js'
  ]

}
/**
 *
 * @type {import('rollup').RollupOptions}
 */
const config2 = {
  input: "main.ts",
  output: {
    file: output + "main.js",
    format: "es",
  },
  plugins: [
    typescript(),
    resolve({
      preferBuiltins: false,
      browser: true,
      exportConditions: ['default', 'module', 'import']
    }),
    replace({
      "./src" : JSON.stringify("rm-next.js"),
      delimiters: ['\'', '\'', '"', '"'],
      preventAssignment: true

    }),
    commonjs({
      transformMixedEsModules: true
    })
  ],
  external: [
    'pixi.js',
    './src',
    "rm-next.js"
  ]

}

export default [config, config2];
