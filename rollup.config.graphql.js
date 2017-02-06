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
  entry: 'src/graphql.js',
  plugins: [
    babel(babelrc())
  ],
  external: external,
  paths: paths,
  targets: [
    {
      dest: 'dist/graphql.js',
      format: 'umd',
      moduleName: 'GraphQLMagnus',
      sourceMap: true
    },
    {
      dest: 'dist/graphql.mjs',
      format: 'es',
      sourceMap: true
    }
  ]
};
