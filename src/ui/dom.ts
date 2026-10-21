// Small keyed DOM patcher: settlements retain the actual focused input nodes.
function key(n:Node){return n instanceof Element?(n.id||n.getAttribute('data-key')||''):'';}
function same(a:Node,b:Node){return a.nodeType===b.nodeType&&a.nodeName===b.nodeName&&key(a)===key(b);}
function patch(a:Node,b:Node){
 if(a.nodeType===Node.TEXT_NODE){if(a.textContent!==b.textContent)a.textContent=b.textContent;return;}
 if(!(a instanceof Element)||!(b instanceof Element))return;
 for(const att of Array.from(a.attributes))if(!b.hasAttribute(att.name)&&!(a instanceof HTMLDetailsElement&&att.name==='open'))a.removeAttribute(att.name);
 for(const att of Array.from(b.attributes))if(a.getAttribute(att.name)!==att.value)a.setAttribute(att.name,att.value);
 const old:Node[]=Array.from(a.childNodes),used=new Set<Node>();let cursor=a.firstChild;
 for(const desired of Array.from(b.childNodes)){
  let found:Node|undefined=key(desired)?old.find(n=>!used.has(n)&&same(n,desired)):old.find(n=>!used.has(n)&&!key(n)&&same(n,desired));
  if(!found){found=desired.cloneNode(true);a.insertBefore(found,cursor);}else{used.add(found);if(found!==cursor)a.insertBefore(found,cursor);patch(found,desired);}
  cursor=found.nextSibling;
 }
 for(const n of old)if(!used.has(n)&&n.parentNode===a)a.removeChild(n);
 if(a instanceof HTMLInputElement&&b instanceof HTMLInputElement){if(a.value!==b.value)a.value=b.value;a.checked=b.checked;}
 if(a instanceof HTMLSelectElement&&b instanceof HTMLSelectElement)a.value=b.value;
}
export function render(target:HTMLElement,html:string){const template=document.createElement('template');template.innerHTML=html;const fresh=target.cloneNode(false) as HTMLElement;fresh.append(template.content);patch(target,fresh);}
