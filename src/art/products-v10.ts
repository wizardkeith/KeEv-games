/** V10 original merchandise sculpts. Existing ten SKU identities and envelopes;
 * physical hollow ceramics, bound paper, folded fabric and printed artwork.
 * No shelf/inventory authority exists here. Legacy W1/v9 sources are retained. */
import {geometry,type Geometry} from './geometry';
import type {NativeSurface,NativeMesh} from './native-characters';
import type {Part,V3} from './recipes';
import type {MaterialRole} from './materials';
import {finishSculpt,sculptLoft,sculptSweep,sculptCloth} from './sculpt-v10';
import {printPanel} from './shop-v10';
const mesh=(g:Geometry,color:string,role:MaterialRole,at:V3=[0,0,0]):NativeMesh=>({shape:'mesh',geometry:g,at,color,role});
const board=(size:V3,at:V3,color:string,role:MaterialRole='paper',radius=.004)=>mesh(geometry({shape:'round',size,at,color,role,radius}),color,role);
const sweep=(points:V3[],r:number,color:string,role:MaterialRole)=>mesh(sculptSweep(points,points.map(()=>r),points.map(()=>r),12,4),color,role);
function turned(profile:[number,number][],color:string,at:V3=[0,0,0],role:MaterialRole='ceramic',n=40):NativeMesh{
 const g:Geometry&{uvs:number[]}={positions:[],normals:[],indices:[],uvs:[]};for(let j=0;j<profile.length;j++)for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,[r,y]=profile[j];g.positions.push(Math.cos(a)*r,y,Math.sin(a)*r);g.uvs.push(i/n,j/(profile.length-1));}for(let j=0;j<profile.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;g.indices.push(a,b,a+1,a+1,b,b+1);}for(const [ring,reverse]of [[0,true],[profile.length-1,false]] as const){const c=g.positions.length/3;g.positions.push(0,profile[ring][1],0);g.uvs.push(.5,.5);for(let i=0;i<n;i++)g.indices.push(...(reverse?[c,ring*(n+1)+i,ring*(n+1)+i+1]:[c,ring*(n+1)+i+1,ring*(n+1)+i]));}return mesh(finishSculpt(g),color,role,at);
}
export function buildV10Product(id:string,color:string):NativeSurface[]{
 switch(id){
 case 'off.mug':return [turned([[.001,.030],[.070,.030],[.088,.038],[.097,.065],[.100,.213],[.103,.233],[.109,.240],[.116,.236],[.120,.221],[.116,.057],[.106,.017],[.084,.006],[.001,.006]],color),sweep([[.106,.192,0],[.169,.201,0],[.205,.153,0],[.196,.099,0],[.111,.073,0]],.015,color,'ceramic'),turned([[.001,.005],[.079,.005],[.083,.009],[.078,.014],[.001,.014]],'#D6C2A5')];
 case 'off.tea':return [turned([[.001,.004],[.103,.004],[.113,.016],[.113,.269],[.108,.285],[.001,.285]],color,[0,0,0],'metal'),turned([[.001,.285],[.117,.285],[.123,.292],[.123,.307],[.115,.316],[.001,.316]],'#C6B28E',[0,0,0],'metal'),board([.147,.153,.004],[0,.155,-.114],'#EFE4CE'),printPanel([0,.155,-.117],.128,.132,0)];
 case 'off.notebook':return [board([.342,.011,.450],[0,.006,0],color,'fabric',.006),board([.342,.013,.450],[0,.061,0],color,'fabric',.006),board([.309,.043,.423],[.007,.032,.002],'#EDE4D1'),mesh(sculptLoft([{y:0,x:.013,z:.222},{y:.025,x:.017,z:.225},{y:.067,x:.013,z:.224}],12),color,'fabric',[-.158,0,0]),...Array.from({length:8},(_,i)=>board([.302,.001,.0018],[.008,.015+i*.005,-.211],'#C8BBA4')),printPanel([.012,.068,-.020],.263,.362,1,true),board([.009,.002,.442],[.130,.070,0],'#8B9D86','fabric',.001)];
 case 'off.pencil':return [{shape:'cylinder',size:[.042,.43,.042],at:[0,.026,0],color,role:'paint',turn:[0,0,Math.PI/2],top:1,segments:6},{shape:'cylinder',size:[.042,.075,.042],at:[.2525,.026,0],color:'#C4A778',role:'wood',turn:[0,0,-Math.PI/2],top:0,segments:6},{shape:'cylinder',size:[.010,.022,.010],at:[.289,.026,0],color:'#554C43',role:'ink',turn:[0,0,-Math.PI/2],top:0,segments:12},...[-.221,-.230,-.239].map(x=>({shape:'cylinder' as const,size:[.046,.008,.046] as V3,at:[x,.026,0] as V3,color:'#B9AF95',role:'metal' as const,turn:[0,0,Math.PI/2] as V3,top:1})),board([.039,.041,.041],[-.264,.026,0],'#CCAEAA','fabric',.012)];
 case 'off.tote':return [mesh(sculptCloth([{y:.012,w:.136,z:.0},{y:.09,w:.158,z:.0},{y:.22,w:.148,z:.0},{y:.302,w:.149,z:.0}],.086,.006),color,'fabric'),sweep([[-.095,.281,-.039],[-.094,.395,-.039],[0,.427,-.039],[.094,.395,-.039],[.095,.281,-.039]],.012,'#D5C2A4','fabric'),sweep([[-.095,.281,.039],[-.094,.395,.039],[0,.427,.039],[.094,.395,.039],[.095,.281,.039]],.012,'#D5C2A4','fabric'),printPanel([0,.164,-.047],.145,.165,2),...[-.139,.139].map(x=>sweep([[x,.045,-.044],[x,.16,-.047],[x,.27,-.043]],.0015,'#AE9D86','fabric'))];
 case 'off.cookie':return [board([.29,.086,.23],[0,.044,0],'#CDB48D','paper',.016),board([.294,.012,.234],[0,.092,0],'#DEC9A5','paper',.013),board([.040,.106,.238],[-.085,.052,0],'#E8DECA','paper',.003),turned([[.001,.099],[.077,.099],[.086,.105],[.083,.113],[.068,.119],[.001,.120]],'#C7A679'),...Array.from({length:7},(_,i)=>{const a=i*2.4;return board([.012,.006,.009],[Math.sin(a)*.058,.121,Math.cos(a)*.055],'#78604A','paint',.003);})];
 case 'off.card':return [board([.28,.014,.38],[0,.008,0],'#F0E8D7','paper',.005),printPanel([0,.016,0],.258,.358,3,true)];
 case 'off.towel':return [board([.329,.085,.269],[0,.045,0],color,'fabric',.031),board([.320,.065,.252],[0,.115,0],color,'fabric',.024),...[-.143,.143].map(x=>sweep([[x,.131,-.100],[x,.147,0],[x,.131,.100]],.0025,'#DED4BE','fabric')),board([.060,.153,.273],[0,.079,0],'#EEE3CC','paper',.003),printPanel([0,.157,0],.048,.13,2,true)];
 case 'off.tray':return [board([.38,.023,.29],[0,.013,0],'#AD8B64','wood',.019),...[-1,1].flatMap(s=>[mesh(sculptSweep([[s*.166,.025,-.122],[s*.181,.046,0],[s*.166,.025,.122]],[.012,.014,.012],[.018,.020,.018],12,6),'#A17C56','wood'),mesh(sculptSweep([[-.166,.025,s*.122],[0,.046,s*.133],[.166,.025,s*.122]],[.012,.014,.012],[.018,.020,.018],12,6),'#A17C56','wood')])];
 case 'off.vase':return [turned([[.001,.010],[.075,.010],[.105,.035],[.121,.099],[.113,.176],[.077,.239],[.050,.279],[.049,.366],[.055,.384],[.049,.393],[.041,.386],[.039,.280],[.067,.242],[.101,.172],[.109,.099],[.094,.046],[.068,.027],[.001,.027]],color),turned([[.001,.005],[.074,.005],[.078,.010],[.074,.017],[.001,.017]],'#C5B297')];
 default:throw new Error('Unknown existing product '+id);
 }
}
