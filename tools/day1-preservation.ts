import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
const base='503ce1dfc22d369cc512084c1a4db9aa2930885c';
const tracked=execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split('\n');
const protectedFiles=tracked.filter(p=>p.startsWith('src/core/')||p.startsWith('src/content/')||p.startsWith('assets/')||p.startsWith('public/assets/')||p.startsWith('public/fonts/')||['src/art/recipes.ts','src/art/geometry.ts','src/art/materials.ts','src/art/direction.ts','src/presentation/feedback.ts','src/presentation/config.ts','src/presentation/poses.ts','package.json','package-lock.json'].includes(p));
const changed=protectedFiles.filter(p=>!fs.existsSync(p)||execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()!==execFileSync('git',['rev-parse',base+':'+p],{encoding:'utf8'}).trim());
function contracts(code:string){const ast=ts.createSourceFile('test.ts',code,ts.ScriptTarget.Latest,true);const names:string[]=[],assertions:string[]=[];function visit(n:ts.Node){if(ts.isCallExpression(n)){const target=n.expression.getText(ast);if(target==='test')names.push(n.arguments[0].getText(ast));if(target.startsWith('assert.'))assertions.push(n.getText(ast));}ts.forEachChild(n,visit);}visit(ast);return {names,assertions};}
const tests=tracked.filter(p=>/^tests\/.*\.test\.ts$/.test(p)).map(p=>{const previous=contracts(execFileSync('git',['show',base+':'+p],{encoding:'utf8'})),now=contracts(fs.readFileSync(p,'utf8'));return {file:p,namedTests:previous.names.length,namesAndAssertionsUnchanged:JSON.stringify(previous)===JSON.stringify(now)};});
const result={baseline:base,protectedFiles:protectedFiles.length,changedProtectedFiles:changed,baselineNamedTests:tests.reduce((n,t)=>n+t.namedTests,0),tests,pass:!changed.length&&tests.every(t=>t.namesAndAssertionsUnchanged)};
fs.mkdirSync('evidence/day1',{recursive:true});fs.writeFileSync('evidence/day1/scope-preservation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(!result.pass)process.exitCode=1;
