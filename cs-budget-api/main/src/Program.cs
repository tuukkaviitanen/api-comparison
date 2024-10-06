using System;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var PORT = Environment.GetEnvironmentVariable("PORT") ?? "8080";

app.MapGet("/", () => "Hello World!");

app.Run($"http://*:{PORT}");
