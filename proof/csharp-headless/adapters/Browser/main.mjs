import { dotnet } from './_framework/dotnet.js';
const {getAssemblyExports,getConfig}=await dotnet.withDiagnosticTracing(false).create();
const exports=await getAssemblyExports(getConfig().mainAssemblyName);
export const execute=exports.GameExports.Execute;
