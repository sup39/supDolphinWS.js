import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'Dolphin',
      sourcemap: true,
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(),
    typescript(),
    babel({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-env', {targets: {node: 'current'}}],
      ],
      exclude: 'node_modules/**',
    }),
  ],
};
