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
process.env.VITE_V11_SCENE_WINDOW??='contact';
if(!['control','aperture','balanced','occluded','contact','daylight','reach'].includes(process.env.VITE_V11_SCENE_WINDOW))throw Error('Unknown C41 window-light mode');
if(process.env.VITE_V11_DAYLIGHT_SHADOW!==undefined&&!['on','off'].includes(process.env.VITE_V11_DAYLIGHT_SHADOW))throw Error('Unknown C46 shadow diagnostic');
process.env.VITE_V11_SOURCE_SEPARATION??='off';
if(!['off','key','base','composite','balance'].includes(process.env.VITE_V11_SOURCE_SEPARATION))throw Error('Unknown C48 source separation');
if(process.env.VITE_V11_SOURCE_SEPARATION!=='off'&&process.env.VITE_V11_SCENE_WINDOW!=='reach')throw Error('C48 requires explicit reach authoring mode');
if(process.env.VITE_V11_SOURCE_FILTER!==undefined&&!['same','hard'].includes(process.env.VITE_V11_SOURCE_FILTER))throw Error('Unknown C48 filter diagnostic');
if(process.env.VITE_V11_SOURCE_FILTER==='hard'&&process.env.VITE_V11_SOURCE_SEPARATION!=='key')throw Error('C48 hard filter requires key-only diagnostic');
if(process.env.VITE_V11_SOURCE_LEAF_SHADOW!==undefined&&!['same','two-sided'].includes(process.env.VITE_V11_SOURCE_LEAF_SHADOW))throw Error('Unknown C48 leaf shadow diagnostic');
if(process.env.VITE_V11_SOURCE_LEAF_SHADOW==='two-sided'&&process.env.VITE_V11_SOURCE_SEPARATION!=='key')throw Error('C48 leaf shadow override requires key-only diagnostic');
if(process.env.VITE_V11_SOURCE_DEPTH!==undefined&&!['off','on'].includes(process.env.VITE_V11_SOURCE_DEPTH))throw Error('Unknown C48 depth readback');
if(process.env.VITE_V11_SOURCE_DEPTH==='on'&&process.env.VITE_V11_SOURCE_SEPARATION!=='key')throw Error('C48 depth readback requires key-only');
export default defineConfig({});
