import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';


export default [
	{
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
	},{
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
	}
]


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

			const with_tinro_kb = `${(with_tinro/1024).toFixed(2)} Kb`;
			const no_tinro_kb = `${(no_tinro/1024).toFixed(2)} Kb`;
			const tinro_value_kb = `${((with_tinro - no_tinro)/1024).toFixed(2)} Kb`;

			fs.unlinkSync('tests/dist/compare/bundle_with_tinro.js');
			fs.unlinkSync('tests/dist/compare/bundle_no_tinro.js');
			fs.rmdirSync('tests/dist/compare');

			fs.writeFileSync('COMPARE.md',`# How much tinro adds to your bandle?

Current tinro value is **${tinro_value_kb}** 

## Comparsion

* bundle.js with tinro inside: **${with_tinro_kb}**
* bundle.js with mocked tinro : **${no_tinro_kb}**

## How do we compare?

Comparsion made by building [testing app](https://github.com/AlexxNB/tinro/tree/master/tests) two times. First one with tinro letest version inside. In the second case - all imports from tinro are mocked by empty exports.
			`);

			console.log('COMPARE:')
			console.log(` - With tinro: ${with_tinro_kb}`)
			console.log(` - No tinro: ${no_tinro_kb}`)
			console.log('---------------');
			console.log(` The tinro value is: ${tinro_value_kb}`);

			
		}
	}
}