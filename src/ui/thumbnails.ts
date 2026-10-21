// Original vector thumbnails share colors/silhouettes with the 3D fixture recipe.
export function thumbnail(id:string,color:string){
 const shapes:Record<string,string>={
 notebook:'<rect x="16" y="10" width="32" height="43" rx="3" fill="currentColor"/><path d="M21 11v41M26 24h14M26 29h10" stroke="#fff8ef" stroke-width="2"/><path d="M18 48h28m-25-2h24m-24-3h24" stroke="#eee4d5" stroke-width="1.3"/><rect x="36" y="11" width="3" height="11" rx="1" fill="#bba2ca"/>',
 pencil:'<g transform="rotate(32 32 32)"><path d="M27 12h10v36l-5 9-5-9z" fill="currentColor"/><path d="M27 48h10l-5 9z" fill="#dfbd8a"/><path d="M30 54h4l-2 3z" fill="#493b35"/><rect x="27" y="9" width="10" height="9" rx="2" fill="#d9a8aa"/><path d="M32 19v27" stroke="#fff0c9"/></g>',
 mug:'<path d="M44 24h7c10 0 10 18 0 18h-7" fill="none" stroke="currentColor" stroke-width="6"/><path d="M14 22h32v24q0 9-16 9t-16-9z" fill="currentColor"/><ellipse cx="30" cy="22" rx="16" ry="5" fill="#f9eee1"/><ellipse cx="30" cy="23" rx="12" ry="3" fill="#c4bbaf"/>',
 tote:'<path d="M17 24h32l3 31H14z" fill="currentColor"/><path d="M24 28V18c0-13 18-13 18 0v10" fill="none" stroke="#8d7760" stroke-width="4"/><path d="M19 29l-1 22h29l-1-22M24 38h18M24 42h12" fill="none" stroke="#f6eadb" stroke-width="1.4"/>',
 tea:'<rect x="16" y="13" width="33" height="43" rx="4" fill="currentColor"/><path d="M16 22h33" stroke="#e7e6ca" stroke-width="3"/><path d="M27 43q-10-19 12-14 0 18-12 14" fill="#f2f2db"/>',
 cookie:'<rect x="12" y="19" width="40" height="34" rx="5" fill="currentColor"/><path d="M12 25h40" stroke="#f4dfbd" stroke-width="3"/><circle cx="32" cy="37" r="10" fill="#ebc58c"/><path d="M28 34h2m6 3h2m-9 5h2" stroke="#87543b" stroke-width="3"/>',
 card:'<path d="M10 18h44v32H10z" fill="currentColor"/><path d="M14 45l12-16 10 13 6-8 8 11" fill="#f4edde"/><circle cx="43" cy="26" r="4" fill="#e9ca89"/>',
 towel:'<rect x="12" y="26" width="40" height="25" rx="6" fill="currentColor"/><rect x="15" y="14" width="34" height="25" rx="5" fill="currentColor" stroke="#fff6e5"/><path d="M20 18v16m4-16v16" stroke="#e6e9dc" stroke-width="2"/>',
 tray:'<rect x="9" y="23" width="46" height="25" rx="8" fill="currentColor"/><rect x="15" y="28" width="34" height="13" rx="4" fill="#d3b497"/><path d="M20 33h25" stroke="#bc9273"/>',
 vase:'<path d="M26 10h12v15c0 7 13 11 13 22 0 13-38 13-38 0 0-11 13-15 13-22z" fill="currentColor"/><ellipse cx="32" cy="11" rx="6" ry="2" fill="#655973"/><path d="M22 39q-8 13 2 13" fill="none" stroke="#dfd6e7" stroke-width="2"/>'
 };
 return `<svg class="thumbnail" viewBox="0 0 64 64" aria-hidden="true" style="color:${color}"><ellipse cx="32" cy="56" rx="23" ry="3" fill="#352d3509"/>${shapes[id.replace('off.','')]||shapes.notebook}</svg>`;
}
