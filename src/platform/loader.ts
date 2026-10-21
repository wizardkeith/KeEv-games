import {Core} from '../core/contracts';
import {execute} from '../core/simulation';
// Explicit prototype fallback, not a WASM/C# sharing claim.
export async function loadCore(){return new Core(execute);}
