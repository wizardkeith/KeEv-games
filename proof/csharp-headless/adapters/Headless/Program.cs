using System;
using KeEv.Sim;
if(args.Length>0&&args[0]=="test") { SelfTest.Run(); return; }
string? line;while((line=Console.ReadLine())!=null)Console.WriteLine(Bridge.Execute(line));
