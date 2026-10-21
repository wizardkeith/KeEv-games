// Original, shared 24px line icons. No text-glyph or font dependency.
const paths:Record<string,string>={
 shelves:'<path d="M4 7h16M4 12h16M4 18h16M5 5v15M19 5v15M8 8v3m4-3v3m4-3v3M8 14v3m5-3v3"/>',
 stock:'<path d="m4 8 8-4 8 4v11H4ZM4 8h16M12 8v11M9 13h6m-3-3v6"/>',
 report:'<path d="M6 3h12v18H6ZM9 7h6M9 11h6M9 15h2m2 0h2M9 18h6"/>',
 journal:'<path d="M5 4h13a1 1 0 0 1 1 1v15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 0v16m4-11 2-2 2 2-2 2Z"/>',
 settings:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>'
};
export function icon(name:string){return `<svg viewBox="0 0 24 24" class="nav-icon" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]??paths.journal}</svg>`;}
