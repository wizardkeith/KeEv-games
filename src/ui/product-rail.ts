/** Shared product browsing surface. No economy, save or transaction state. */
import {esc} from './copy';
export function productRail(id:string,label:string,previous:string,next:string,cards:string){
 return `<div class="rail-navigation"><button data-action="rail-move" data-direction="-1" aria-controls="${id}" aria-label="${esc(previous)}">←</button><span>${esc(label)}</span><button data-action="rail-move" data-direction="1" aria-controls="${id}" aria-label="${esc(next)}">→</button></div><div id="${id}" class="product-rail stock-grid" role="region" aria-label="${esc(label)}" tabindex="0" data-rail>${cards}</div>`;
}
