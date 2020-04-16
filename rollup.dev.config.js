import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';


const pkg = require('./package.json');

const compare = process.env.NODE_ENV === 'compare';

const bundles = [];

if(!compare) bundles.push({
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
	plugins: [resolve({dedupe: ['svelte']})]
});

if(!compare) bundles.push({
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
			dev: true,
			css: css => {
				css.write('tests/www/build/bundle.css');
			}
		}),
		resolve({dedupe: ['svelte']}),
		serve(),
		livereload('tests/www')
	],
	watch: {
		clearScreen: false
	}
});
if(compare) bundles.push({
	input: 'tests/app.js',
	output: {
		format: 'iife',
		name: 'app',
		file: 'tests/dist/compare/bundle_with_tinro.js'
	},
	plugins: [
		rollup_plugin_alias(),
		svelte({}),
		resolve({dedupe: ['svelte']}),
		terser()
	]
});

if(compare) bundles.push({
	input: 'tests/app.js',
	output: {
		format: 'iife',
		name: 'app',
		file: 'tests/dist/compare/bundle_no_tinro.js'
	},
	plugins: [
		rollup_plugin_mock_tinro(),
		svelte({}),
		resolve({dedupe: ['svelte']}),
		terser(),
		rollup_plugin_compare()
	]
});



function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'serve', '--', '--dev','--single'], {
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

function rollup_plugin_mock_tinro(){
	const cwd = process.cwd();
	const svelte = require('svelte/compiler');
	return {
		name: 'rollup_plugin_mock_tinro',
		resolveId(id,importer){
			return id==='tinro' ? this.resolve(`${cwd}/cmp/index.js`,importer) : 
				   id.endsWith('/dist/tinro_lib') ? `mock_tinro_lib` : 
				   id.endsWith('Route.svelte') ? 'mock_tinro_Route' : null;
		},
		load(id){
			if(id==='mock_tinro_lib'){
				return `
					export const router = {subscribe:()=>{}};
					export const formatPath = ()=>{};
					export const getPathData = ()=>{};
					export const err = ()=>{};
				`
			}

			if(id==='mock_tinro_Route'){
				return svelte.compile(`<slot></slot>`).js;
			}
		
			return null;
		}
	}
}

function rollup_plugin_compare(){
	const fs = require("fs");
	return {
		name: 'rollup_plugin_compare',
		writeBundle(){
			const with_tinro = fs.statSync("tests/dist/compare/bundle_with_tinro.js").size;
			const no_tinro = fs.statSync("tests/dist/compare/bundle_no_tinro.js").size;

			console.log('COMPARE:')
			console.log(` - With tinro: ${(with_tinro/1024).toFixed(2)} Kb`)
			console.log(` - No tinro: ${(no_tinro/1024).toFixed(2)} Kb`)
			console.log('---------------');
			console.log(` The tinro value is: ${( (with_tinro - no_tinro)/1024).toFixed(2)} Kb`);

			fs.unlinkSync('tests/dist/compare/bundle_with_tinro.js');
			fs.unlinkSync('tests/dist/compare/bundle_no_tinro.js');
			fs.rmdirSync('tests/dist/compare');
		}
	}
}

export default bundles;