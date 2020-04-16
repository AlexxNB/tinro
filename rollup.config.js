import { terser } from "rollup-plugin-terser";
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';

const pkg = require('./package.json');

export default [
    {
        input: 'src/tinro.js',
        output: [
        { file: 'dist/tinro_lib.js', format: 'es' }
        ],
        external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ],
        plugins: [terser()]
    },
    {
        input: 'src/index.js',
        output: [
        { file: pkg.main, format: 'cjs' },
        { file: pkg.module, format: 'es' }
        ],
        external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ],
        plugins: [svelte(),resolve({dedupe: ['svelte']}),terser()]
    },
    {
        input: 'src/index.js',
        output:{ 
            file: pkg.browser, 
            name: 'cjs2es',
            format: 'umd' 
        },
        external: false,
        plugins: [svelte(),resolve({ browser: true ,dedupe: ['svelte']}),terser({ module: true})]
    }

]