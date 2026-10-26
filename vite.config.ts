import {defineConfig} from 'vite';
/** Unadopted C31 art experiments must be stripped from ordinary builds.
 * Vite7 loadEnv copies VITE_ process keys after this config is evaluated.
 * Explicit authoring modes remain available; this is no player setting. */
process.env.VITE_V11_FORM_VALUES??='control';
if(!['control','shape','values','combined'].includes(process.env.VITE_V11_FORM_VALUES))throw Error('Unknown bounded C31 authoring variant');
export default defineConfig({});
