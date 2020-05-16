import { terser } from "rollup-plugin-terser";
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import pkg from './package.json';


export default [
    {
        input: 'src/tinro.js',
        output: [
        { file: 'dist/tinro_lib.js', format: 'es' }
        ],
        external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
		'svelte',
		'svelte/store'
        ],
        plugins: [resolve({dedupe: ['svelte']}),terser()]
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
    }
]