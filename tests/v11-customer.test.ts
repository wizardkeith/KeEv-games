import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeCharacterParts,nativeSurfaceGeometry} from '../src/art/native-characters';
import {buildV10Character} from '../src/art/characters-v10';
import {frontZ} from '../src/art/garments-v11';
test('rebuilt customer retains every articulation/contact pivot and existing lower-body envelope',()=>{
 const old=buildV10Character('visitor-a'),parts=nativeCharacterParts('visitor-a');
 for(const p of old){const a=parts.find(a=>a.id===p.id)!;assert.ok(a);assert.equal(a.parent,p.parent);if(!/^(eye|eyelid|brow)-|^mouth$/.test(p.id))assert.deepEqual(a.pivot,p.pivot);}
 for(const id of ['leg-left','leg-right','shin-left','shin-right','socket-left','socket-right'])assert.deepEqual(parts.find(p=>p.id===id),old.find(p=>p.id===id));
 for(const side of ['left','right'])assert.equal(parts.find(p=>p.id==='hand-'+side)!.recipe.length,6,'palm, four distinct fingers and thumb');
 const head=parts.find(p=>p.id==='head')!;
 assert.ok(head.recipe.filter(p=>p.role==='hair').length>=20,'independent thick crown/fringe/back/side tufts');
 assert.ok(head.recipe.some(p=>p.baseColorTexture?.endsWith('visitor-a-skin.png')));
});
test('customer satchel strap joins actual shirt and pouch surfaces, while fitted placket does not float',()=>{
 const body=nativeCharacterParts('visitor-a').find(p=>p.id==='body')!,torso=body.recipe[0],pouch=body.recipe[8],bridge=body.recipe[11];
 assert.equal(torso.shape,'mesh');assert.equal(pouch.shape,'mesh');assert.equal(bridge.shape,'mesh');if(torso.shape!=='mesh'||pouch.shape!=='mesh'||bridge.shape!=='mesh')return;
 const g=nativeSurfaceGeometry(bridge),start=[.114,.75,frontZ(.114,.75,[torso])-.010],end=[.147,.810,frontZ(.147,.810,[pouch])-.003];
 for(const q of [start,end]){let nearest=Infinity;for(let i=0;i<g.positions.length;i+=3)nearest=Math.min(nearest,Math.hypot(...q.map((v,k)=>v-g.positions[i+k])));assert.ok(nearest<.014,'closed strap reaches measured support within its real width');}
 for(const index of [3,10]){const p=body.recipe[index];assert.equal(p.shape,'mesh');if(p.shape!=='mesh')continue;const a=p.geometry;for(let i=0;i<a.positions.length;i+=3){const [x,y,z]=a.positions.slice(i,i+3),gap=frontZ(x,y,[torso])-z;assert.ok(gap>=.001&&gap<=.012,`fitted garment gap ${gap}`);}}
 const bag=nativeSurfaceGeometry(pouch),maxX=Math.max(...bag.positions.filter((_,i)=>i%3===0));assert.ok(maxX<.301,'personal pouch stays inside prior travel envelope');
});

// A vertex-only fit misses a broad flap cutting through its curved support.
// Check actual triangle interiors as well, for both new customers.
test('both customers closed garment and satchel panels clear support at triangle interiors',()=>{
 for(const kind of ['visitor-a','visitor-b'] as const){
  const parts=nativeCharacterParts(kind),old=buildV10Character(kind),b=parts.find(p=>p.id==='body')!;
  for(const id of ['leg-left','leg-right','shin-left','shin-right','socket-left','socket-right'])assert.deepEqual(parts.find(p=>p.id===id),old.find(p=>p.id===id));
  const ids=kind==='visitor-a'?[3,9,10]:[1,3,4,7,9,10];
  for(const id of ids){const p=b.recipe[id],support=b.recipe[id===9?8:0];assert.equal(p.shape,'mesh');assert.equal(support.shape,'mesh');if(p.shape!=='mesh'||support.shape!=='mesh')continue;
   const g=p.geometry;for(let i=0;i<g.indices.length;i+=3)for(const weights of [[1/3,1/3,1/3],[.6,.2,.2],[.2,.6,.2],[.2,.2,.6]]){
    const q=[0,1,2].map(k=>g.indices.slice(i,i+3).reduce((n,a,j)=>n+g.positions[a*3+k]*weights[j],0)),gap=kind==='visitor-b'&&id===7?q[2]+frontZ(q[0],q[1],[{...support,geometry:{...support.geometry,positions:support.geometry.positions.map((v,i)=>i%3===2?-v:v)}}]):frontZ(q[0],q[1],[support])-q[2];
    assert.ok(gap>=.0001&&gap<.025,`${kind} panel${id} intersects/floats at triangle interior: ${gap}`);
   }
  }
 }
});
