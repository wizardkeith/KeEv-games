using System.Runtime.InteropServices.JavaScript;
public partial class GameExports {
 [JSExport] public static string Execute(string json)=>Bridge.Execute(json);
 public static void Main(){}
}
