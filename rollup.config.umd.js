import config from './rollup.config';

config.format = 'umd';
config.dest = 'dist/localforage-startswith.js';
config.moduleName = 'localforageStartsWith';

export default config;
