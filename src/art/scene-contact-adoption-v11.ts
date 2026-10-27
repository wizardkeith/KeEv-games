import{sceneContactIntent,contactHierarchy}from'./scene-contact-intent-v11';
/** C44 narrow contact PASS. Development default only, no whole-target/release claim. */
export const contactDevelopmentActive=import.meta.env?.VITE_V11_SCENE_WINDOW===undefined||import.meta.env.VITE_V11_SCENE_WINDOW==='contact';
export const adoptedContactIntent={...sceneContactIntent,defaultAdopted:true}as const;
export const adoptedContactHierarchy={...contactHierarchy,mode:contactDevelopmentActive?'contact':'control',defaultAdopted:true,limits:'C44 narrow local-contact PASS, adopted into V11 development default. Original optical settings unchanged; not whole-target, GI, native or public-release acceptance.'};
export const contactDevelopmentAdoption={id:'v11.c45.local-contact-development-default',developmentDefault:true,active:contactDevelopmentActive,reviewedCandidate:'6c7f0a98c70f5c278e8a0f329065a7badb785779',reviewedApplication:'35301d7b59b42c1875558665d8daf21298c1d4ca',reviewedBuild:273,scope:'Exact C44 optics and accepted assets; metadata/default mapping only. Public V17 unchanged by this source task.'}as const;
