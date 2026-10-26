/** C31 controlled NORMAL-scale form/value authoring. OFF by default until pixels pass. */
// Vite-only authoring flag: ordinary builds and engine-neutral exports stay control.
const requested=import.meta.env?.VITE_V11_FORM_VALUES;
export const formValueMode=requested==='shape'||requested==='values'||requested==='combined'?requested:'control';
export const designedShape=formValueMode==='shape'||formValueMode==='combined',designedValues=formValueMode==='values'||formValueMode==='combined';
export const formValueIntent={id:'v11.c31.normal-scale-form-values',mode:formValueMode,shape:'Thirty overlapping primary five-lobed corollas plus24 small perimeter flowers; two broad hanging cloth folds, original commodity support and C27 transforms',values:'Object UV warm-lit/cool-shadow form gradients only. No owned-stock/contact shadow painted into fixed textures, no billboard or emissive substitute',lighting:'Unchanged201 scene/exposure/camera and192 reflection; C30 transport OFF',acceptance:'Pending actual normal full frame and two oblique views; not target acceptance'}as const;
