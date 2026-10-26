/** Actual Cycles static-contact bake, not a screenshot/background. UV origin is
 * upper-left PNG/glTF convention. Projection is shared by Web and native GLB. */
export const floorContactBake={path:'/assets/native-v11/shop-floor-contact.png',strength:.45,analyticalImpact:.40,resolution:1024,bounds:{minX:-4.55,maxX:4.55,minZ:-3.3,maxZ:3.3},master:'assets/masters/native-v11/c22-contact/shop-floor-contact.png',provenance:'assets/masters/native-v11/c22-contact/shop-contact-provenance.json',source:'C22 mixed fixed displays;439 static meshes, no actor, inventory or hinged door'} as const;
export function floorContactUV(positions:readonly number[]){const uv:number[]=[];for(let i=0;i<positions.length;i+=3)uv.push((positions[i]+4.55)/9.1,(3.3-positions[i+2])/6.6);return uv;}
