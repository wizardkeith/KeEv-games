using System;
using System.Text.Json;
using KeEv.Sim;
public static class Bridge {
 static readonly JsonSerializerOptions Options=new JsonSerializerOptions{PropertyNamingPolicy=JsonNamingPolicy.CamelCase,PropertyNameCaseInsensitive=true,IncludeFields=false};
 public static string Execute(string json){try{var req=JsonSerializer.Deserialize<Request>(json,Options)!;var config=req.Config!;State s;if(req.Op=="create")s=Economy.Create(config,req.Mode,req.Time);else{s=req.State!;Economy.Validate(s,config);if(req.Op=="command")Economy.Apply(s,config,req.Command!);else if(req.Op!="validate")throw new Exception("operation");}return JsonSerializer.Serialize(new{ok=true,state=s},Options);}catch(Exception e){return JsonSerializer.Serialize(new{ok=false,error=e.Message},Options);}}
 public sealed class Request {public string Op {get;set;}="";public Config? Config {get;set;}public State? State {get;set;}public Command? Command {get;set;}public string Mode {get;set;}="normal";public long Time {get;set;}}
}
