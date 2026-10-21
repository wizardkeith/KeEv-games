using System;
using System.Collections.Generic;
using System.Linq;
namespace KeEv.Sim {
 public sealed class Offering { public string Id {get;set;}=""; public int Cost {get;set;} public int SuggestedPrice {get;set;} }
 public sealed class Config { public int InitialCash {get;set;}=5000; public int SalaryPerHour {get;set;}=30; public int RentPerHour {get;set;}=20; public int OperatingPerHour {get;set;}=10; public int BaseDemandPerHour {get;set;}=6; public int CapacityPerHour {get;set;}=12; public int ConversionBp {get;set;}=10000; public int DemandCapBp {get;set;}=3000; public int DiscountCapBp {get;set;}=2000; public int DiscountBp {get;set;} public int OpenHour {get;set;}=10; public int CloseHour {get;set;}=20; public string[] SetPieces {get;set;}=new string[0]; public int SetBonusBp {get;set;}=1000; public Offering[] Offerings {get;set;}=new Offering[0]; }
 public sealed class Item { public int Stock {get;set;} public int Price {get;set;} public long BookCost {get;set;} public long DemandRemainder {get;set;} }
 public sealed class Report { public string Day {get;set;}=""; public long Sales {get;set;} public long Cogs {get;set;} public long Salary {get;set;} public long Rent {get;set;} public long Operating {get;set;} public long Units {get;set;} public long Net {get;set;} }
 public sealed class Stage { public string Id {get;set;}=""; public long Value {get;set;} public string Unit {get;set;}="bp"; }
 public sealed class State {
  public int SchemaVersion {get;set;}=1; public string ContentVersion {get;set;}="w1-provisional-1"; public string SimulationVersion {get;set;}="csharp-w1-1"; public string Mode {get;set;}="normal"; public bool RankingEligible {get;set;} public string WorldStateId {get;set;}="tokyo.static.w1";
  public string ShopName {get;set;}=""; public string CompanyName {get;set;}=""; public string Logo {get;set;}="◇"; public string ShopId {get;set;}="shop.player.1"; public string Region {get;set;}="tokyo"; public string District {get;set;}="ikebukuro";
  public long Cash {get;set;}=5000; public long Purchases {get;set;} public long Watermark {get;set;} public long LastWallTime {get;set;} public long Revision {get;set;} public bool Open {get;set;} public bool Revealed {get;set;} public int Tutorial {get;set;} public long EventSequence {get;set;}
  public Dictionary<string,Item> Inventory {get;set;}=new Dictionary<string,Item>(); public string[] Shelves {get;set;}=new string[]{"","",""}; public List<string> CommandIds {get;set;}=new List<string>(); public List<Report> Reports {get;set;}=new List<Report>(); public List<Stage> Breakdown {get;set;}=new List<Stage>(); public long SalaryRemainder {get;set;} public long RentRemainder {get;set;} public long OperatingRemainder {get;set;}
 }
 public sealed class Command { public string Id {get;set;}=""; public string Kind {get;set;}=""; public string ItemId {get;set;}=""; public int Quantity {get;set;} public int Slot {get;set;} public int Price {get;set;} public long Target {get;set;} public string Text {get;set;}=""; public string Company {get;set;}=""; public string Logo {get;set;}="◇"; }
 public static class Economy {
  public const long Limit=1000000000000L; public const long MaxGap=31L*86400000;
  public static void Require(bool condition,string code){if(!condition)throw new InvalidOperationException(code);}
  public static int CapGroup(int[] effects,int cap) { long sum=0; foreach(var x in effects)sum+=x;return (int)Math.Max(-9000,Math.Min(cap,sum)); }
  public static long RoundEven(long n,long d){Require(n>=0&&d>0,"number");long q=n/d,r=n%d;return q+(r*2>d||(r*2==d&&q%2==1)?1:0);}
  public static State Create(Config c,string mode,long time){Require(mode=="normal"||mode=="sandbox","mode");var s=new State{Mode=mode,Watermark=time,LastWallTime=time,Cash=c.InitialCash};foreach(var o in c.Offerings)s.Inventory[o.Id]=new Item{Price=o.SuggestedPrice};return s;}
  public static void Validate(State s,Config c){
   Require(s.SchemaVersion==1,"version"); Require(s.ContentVersion=="w1-provisional-1"&&s.SimulationVersion=="csharp-w1-1","version");Require((s.Mode=="normal"||s.Mode=="sandbox")&&!s.RankingEligible,"mode");
   Require(s.Watermark>=0&&s.Watermark<=4102444800000L&&s.LastWallTime>=0&&s.LastWallTime<=4102444800000L,"clock");Require(s.Cash>=-Limit&&s.Cash<=Limit&&s.Purchases>=0&&s.Purchases<=Limit&&s.Revision>=0,"bounds");Require(s.Shelves.Length==3,"layout");Require(s.CommandIds.Count<=100000&&s.CommandIds.Distinct().Count()==s.CommandIds.Count,"commands");
   Require(s.Inventory.Count==c.Offerings.Length,"references");foreach(var o in c.Offerings){Require(s.Inventory.ContainsKey(o.Id),"references");var i=s.Inventory[o.Id];Require(i.Stock>=0&&i.Stock<=100000&&i.Price>=1&&i.Price<=100000&&i.BookCost>=0&&i.BookCost<=Limit&&i.DemandRemainder>=0&&i.DemandRemainder<600000,"inventory");Require(i.Stock>0||i.BookCost==0,"inventory");}Require(s.Shelves.All(x=>x==""||s.Inventory.ContainsKey(x)),"references");Require(s.Shelves.Where(x=>x!="").Distinct().Count()==s.Shelves.Count(x=>x!=""),"layout");Require(s.Reports.Count<=40000&&s.Reports.All(r=>r.Day.Length==10&&r.Sales>=0&&r.Cogs>=0&&r.Salary>=0&&r.Rent>=0&&r.Operating>=0&&r.Net==r.Sales-r.Cogs-r.Salary-r.Rent-r.Operating),"report");Require(s.SalaryRemainder>=0&&s.SalaryRemainder<60&&s.RentRemainder>=0&&s.RentRemainder<60&&s.OperatingRemainder>=0&&s.OperatingRemainder<60,"remainder");Require(s.ShopName.Length<=32&&s.CompanyName.Length<=32&&s.Logo.Length<=8,"identity");
  }
  public static void Apply(State s,Config c,Command cmd){
   Validate(s,c);Require(cmd.Id.Length>0&&cmd.Id.Length<100,"command");if(s.CommandIds.Contains(cmd.Id))return;Require(s.CommandIds.Count<100000,"command_limit");
   Item? item=null;Offering? o=null;if(cmd.Kind=="buy"||cmd.Kind=="price"||cmd.Kind=="display"){Require(s.Inventory.ContainsKey(cmd.ItemId),"references");item=s.Inventory[cmd.ItemId];o=c.Offerings.First(x=>x.Id==cmd.ItemId);}
   switch(cmd.Kind){
    case "buy": Require(cmd.Quantity>0&&cmd.Quantity<=1000&&item!.Stock+cmd.Quantity<=100000,"quantity");long cost=RoundEven(o!.Cost*(10000L-Math.Max(0,Math.Min(c.DiscountCapBp,c.DiscountBp))),10000);long total=cost*cmd.Quantity;Require(s.Cash>=total,"cash");s.Cash-=total;s.Purchases+=total;item!.Stock+=cmd.Quantity;item.BookCost+=total;s.Tutorial=Math.Max(s.Tutorial,1);break;
    case "display":Require(cmd.Slot>=0&&cmd.Slot<3,"slot");for(int j=0;j<3;j++)if(s.Shelves[j]==cmd.ItemId)s.Shelves[j]="";s.Shelves[cmd.Slot]=cmd.ItemId;s.Tutorial=Math.Max(s.Tutorial,2);break;
    case "clear":Require(cmd.Slot>=0&&cmd.Slot<3,"slot");s.Shelves[cmd.Slot]="";break;
    case "price":Require(cmd.Price>=1&&cmd.Price<=100000,"price");item!.Price=cmd.Price;break;
    case "open":s.Open=!s.Open;s.Tutorial=Math.Max(s.Tutorial,3);break;
    case "identity":Require(cmd.Text.Trim().Length>0&&cmd.Text.Length<=32&&cmd.Company.Length<=32&&cmd.Logo.Length<=8,"identity");s.ShopName=cmd.Text.Trim();s.CompanyName=cmd.Company.Trim();s.Logo=cmd.Logo;break;
    case "reveal":Require(s.Reports.Sum(r=>r.Units)>=1,"discovery_locked");s.Revealed=true;s.Tutorial=5;break;
    case "settle":Settle(s,c,cmd.Target);break;
    default:throw new InvalidOperationException("command");
   }
   if(cmd.Kind!="settle")s.CommandIds.Add(cmd.Id);s.Revision++;Validate(s,c);
  }
  static void Settle(State s,Config c,long target){
   Require(target>=s.Watermark,"rollback");Require(target<=4102444800000L&&target-s.Watermark<=MaxGap,"long_gap");
   // Complete absolute minute boundaries only. Watermark carries partial-minute time.
   long start=s.Watermark/60000,end=target/60000;
   var active=s.Shelves.Where(x=>x!="").ToArray();bool set=c.SetPieces.Length>0&&c.SetPieces.All(x=>active.Contains(x));int bonus=CapGroup(new[]{set?c.SetBonusBp:0},c.DemandCapBp);
   long rate=c.BaseDemandPerHour*(10000L+bonus);if(active.Length>0)rate=Math.Min(rate,c.CapacityPerHour*10000L/active.Length);
   s.Breakdown=new List<Stage>{new Stage{Id="base",Value=c.BaseDemandPerHour,Unit="units/h"},new Stage{Id="world",Value=0},new Stage{Id="offering",Value=0},new Stage{Id="staff",Value=0},new Stage{Id="equipment",Value=0},new Stage{Id="set",Value=bonus},new Stage{Id="event",Value=0},new Stage{Id="capacity",Value=c.CapacityPerHour,Unit="units/h"},new Stage{Id="conversion",Value=c.ConversionBp},new Stage{Id="sales"},new Stage{Id="variable"},new Stage{Id="period"},new Stage{Id="net"},new Stage{Id="ratings",Value=0}};
   for(long m=start;m<end;m++){
    var utc=DateTimeOffset.FromUnixTimeMilliseconds(m*60000);var tokyo=utc.ToOffset(TimeSpan.FromHours(9));string day=tokyo.ToString("yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture);var report=s.Reports.LastOrDefault();if(report==null||report.Day!=day){report=new Report{Day=day};s.Reports.Add(report);}
    bool operating=s.Open&&tokyo.Hour>=c.OpenHour&&tokyo.Hour<c.CloseHour;
    long rent=(s.RentRemainder+c.RentPerHour)/60;s.RentRemainder=(s.RentRemainder+c.RentPerHour)%60;report.Rent+=rent;s.Cash-=rent;
    if(operating){long salary=(s.SalaryRemainder+c.SalaryPerHour)/60;s.SalaryRemainder=(s.SalaryRemainder+c.SalaryPerHour)%60;long op=(s.OperatingRemainder+c.OperatingPerHour)/60;s.OperatingRemainder=(s.OperatingRemainder+c.OperatingPerHour)%60;report.Salary+=salary;report.Operating+=op;s.Cash-=salary+op;
     foreach(var id in active){var item=s.Inventory[id];var o=c.Offerings.First(x=>x.Id==id);if(item.Stock==0){item.DemandRemainder=0;continue;}
      long priceConversion=Math.Min(15000,o.SuggestedPrice*10000L/item.Price);long converted=rate*Math.Min(15000,c.ConversionBp*priceConversion/10000)/10000;
      long accum=item.DemandRemainder+converted;int n=(int)Math.Min(item.Stock,accum/600000);item.DemandRemainder=accum%600000;
      if(n>0){long used=n==item.Stock?item.BookCost:RoundEven(item.BookCost*n,item.Stock);item.Stock-=n;item.BookCost-=used;long sale=n*(long)item.Price;s.Cash+=sale;report.Sales+=sale;report.Cogs+=used;report.Units+=n;s.EventSequence+=n;s.Tutorial=Math.Max(s.Tutorial,4);}
     }
    }
    report.Net=report.Sales-report.Cogs-report.Salary-report.Rent-report.Operating;
   }
   s.Watermark=target;
  }
 }
}
