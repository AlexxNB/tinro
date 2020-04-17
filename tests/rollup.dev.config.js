import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';


const pkg = require('../package.json');

const test = process.env.NODE_ENV === 'test';

export default [
	{
		input: 'src/tinro.js',
		output: [
		{ file: 'tests/dist/tinro_lib_test.js', format: 'es', sourcemap: true }
		],
		external: [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
		'svelte',
		'svelte/store'
		],
		plugins: [
			resolve({dedupe: ['svelte']}),
			test && terser()
		]
	},
	{
		input: 'tests/app.js',
		output: {
			sourcemap: true,
			format: 'iife',
			name: 'app',
			file: 'tests/www/build/bundle.js'
		},
		plugins: [
			rollup_plugin_alias(),
			svelte({
				dev: !test,
				css: css => {
					css.write('tests/www/build/bundle.css');
				}
			}),
			resolve({dedupe: ['svelte']}),
			!test && serve(),
			!test && livereload('tests/www'),
			test && terser()
		],
		watch: {
			clearScreen: false
		}
	}
];

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('sirv', ['tests/www', '-D', '-q', '-s'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}

function rollup_plugin_alias(){
	const cwd = process.cwd();
	return {
        name: 'rollup_plugin_alias',
		resolveId(id,importer){
			return id==='tinro' ? this.resolve(`${cwd}/cmp/index.js`,importer) : 
			       id.endsWith('/dist/tinro_lib') ? this.resolve(`${cwd}/tests/dist/tinro_lib_test.js`,importer) : null
		}
	}
}