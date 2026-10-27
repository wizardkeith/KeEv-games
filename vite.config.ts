import {defineConfig} from 'vite';
/** Unadopted C31 art experiments must be stripped from ordinary builds.
 * Vite7 loadEnv copies VITE_ process keys after this config is evaluated.
 * Explicit authoring modes remain available; this is no player setting. */
process.env.VITE_V11_FORM_VALUES??='control';
if(!['control','shape','values','combined'].includes(process.env.VITE_V11_FORM_VALUES))throw Error('Unknown bounded C31 authoring variant');
process.env.VITE_V11_GRAY_FORMS??='control';
if(!['control','old-gray','gray'].includes(process.env.VITE_V11_GRAY_FORMS))throw Error('Unknown C32 gray gate variant');
process.env.VITE_V11_BOUNDED_MATERIAL??=process.env.VITE_V11_GRAY_FORMS!=='control'||process.env.VITE_V11_FORM_VALUES!=='control'?'control':'values';
if(!['control','base','values'].includes(process.env.VITE_V11_BOUNDED_MATERIAL))throw Error('Unknown C34 bounded material variant');
process.env.VITE_V11_BACKWALL_FORMS??='shape';
if(!['control','shape','old-gray','gray'].includes(process.env.VITE_V11_BACKWALL_FORMS))throw Error('Unknown C37 backwall form gate variant');
process.env.VITE_V11_BACKWALL_MATERIAL??=process.env.VITE_V11_BACKWALL_FORMS==='shape'?'values':'control';
if(!['control','base','values'].includes(process.env.VITE_V11_BACKWALL_MATERIAL))throw Error('Unknown C39 backwall material variant');
process.env.VITE_V11_SCENE_WINDOW??='control';
if(!['control','aperture','balanced','occluded','contact'].includes(process.env.VITE_V11_SCENE_WINDOW))throw Error('Unknown C41 window-light mode');
export default defineConfig({});
