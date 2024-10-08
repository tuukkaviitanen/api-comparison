using Data;
using Microsoft.EntityFrameworkCore;
using Routers;
using Services;

var PORT = Environment.GetEnvironmentVariable("PORT") ?? "8080";
var CONNECTION_STRING = Environment.GetEnvironmentVariable("CONNECTION_STRING");

if (CONNECTION_STRING is null)
{
    Console.WriteLine("CONNECTION_STRING is not set");
    Environment.Exit(1);
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContextPool<DatabaseContext>(options => options.UseNpgsql(CONNECTION_STRING));
builder.Services.AddScoped<CredentialService>();
builder.Services.AddScoped<TransactionService>();
builder.Services.AddScoped<ReportService>();

var app = builder.Build();

app.MapTransactionRouter();
app.MapCredentialRouter();
app.MapReportRouter();

app.MapGet("/openapi.yaml", async (context) =>
{
    var filePath = Path.Combine(builder.Environment.ContentRootPath, "openapi.yaml");
    context.Response.ContentType = "text/yaml";
    await context.Response.SendFileAsync(filePath);
});

app.Run($"http://*:{PORT}");
