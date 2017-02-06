import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import path from 'path';

let pkg = require('./package.json');
let index = path.resolve('./src/index.js');
let external = Object.keys(pkg.dependencies).concat([
  index
]);
let paths = {
  [index]: '@potatosalad/magnus'
};

export default {
  entry: 'src/vue.js',
  plugins: [
    babel(babelrc())
  ],
  external: external,
  paths: paths,
  targets: [
    {
      dest: 'dist/vue.js',
      format: 'umd',
      moduleName: 'VueMagnus',
      sourceMap: true
    },
    {
      dest: 'dist/vue.mjs',
      format: 'es',
      sourceMap: true
    }
  ]
};
