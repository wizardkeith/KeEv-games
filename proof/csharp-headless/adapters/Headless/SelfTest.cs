using System;
using System.Linq;
using KeEv.Sim;
static class SelfTest {
 static int passed=0;static void Check(bool yes,string name){if(!yes)throw new Exception("FAIL "+name);Console.WriteLine("PASS "+name);passed++;}
 static Config Config()=>new Config{Offerings=new[]{new Offering{Id="off.notebook",Cost=40,SuggestedPrice=80}},SetPieces=new string[0]};
 static State Setup(Config c){var s=Economy.Create(c,"sandbox",1767232800000);Cmd(s,c,"buy",10);Cmd(s,c,"display");Cmd(s,c,"open");return s;}
 static void Cmd(State s,Config c,string kind,int q=0,long t=0,string id=""){Economy.Apply(s,c,new Command{Id=id==""?Guid.NewGuid().ToString():id,Kind=kind,ItemId="off.notebook",Quantity=q,Target=t});}
 public static void Run(){var c=Config();var s=Setup(c);long t=s.Watermark;Check(s.Cash==4600&&s.Inventory["off.notebook"].Stock==10&&s.Reports.Count==0,"purchase not expensed");Cmd(s,c,"settle",t:t+3600000);var r=s.Reports.Single();Check(r.Units==6&&r.Sales==480&&r.Cogs==240&&r.Salary==30&&r.Rent==20&&r.Operating==10&&r.Net==180&&s.Cash==5020&&s.Inventory["off.notebook"].Stock==4&&s.Inventory["off.notebook"].BookCost==160,"golden 60-minute explicit expected P&L");
 var a=Setup(c);Cmd(a,c,"settle",t:t+1800000);Cmd(a,c,"settle",t:t+3600000);Check(a.Cash==s.Cash&&a.Reports[0].Net==r.Net&&a.Inventory["off.notebook"].DemandRemainder==s.Inventory["off.notebook"].DemandRemainder,"60 equals 30+30");long cash=s.Cash;Cmd(s,c,"settle",t:t+3600000);Check(s.Cash==cash,"repeated settlement");var b=Economy.Create(c,"normal",t);Cmd(b,c,"buy",2,id:"same");Cmd(b,c,"buy",2,id:"same");Check(b.Inventory["off.notebook"].Stock==2&&b.Cash==4920,"duplicate command once");
 Check(Economy.CapGroup(new[]{2000,2000},3000)==3000,"aggregate group then cap");Check(Economy.RoundEven(5,2)==2&&Economy.RoundEven(7,2)==4,"half even");
 bool fails=false;try{Cmd(b,c,"buy",-1);}catch{fails=true;}Check(fails,"reject negative quantity");fails=false;try{Cmd(b,c,"settle",t:t-1);}catch{fails=true;}Check(fails,"clock rollback rejected");
 fails=false;try{Cmd(b,c,"price");}catch{fails=true;}Check(fails,"invalid pricing rejected");
 c.DiscountBp=9000;var dis=Economy.Create(c,"sandbox",t);Cmd(dis,c,"buy",1);Check(dis.Cash==4968,"supplier discount capped at 20 percent");
 var serialized=Bridge.Execute(System.Text.Json.JsonSerializer.Serialize(new{op="validate",config=c,state=s},new System.Text.Json.JsonSerializerOptions{PropertyNamingPolicy=System.Text.Json.JsonNamingPolicy.CamelCase}));Check(serialized.Contains("\"ok\":true"),"save roundtrip");
 s.SchemaVersion=2;fails=false;try{Economy.Validate(s,c);}catch{fails=true;}Check(fails,"future version rejected");s.SchemaVersion=1;
 Check(!s.RankingEligible&&b.Mode=="normal"&&s.Mode=="sandbox","test and normal ineligible prototype modes");
 Console.WriteLine($"RESULT {passed} passed");
 }
}
