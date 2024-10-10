using Data;
using Microsoft.EntityFrameworkCore;
using Routers;
using Services;
using FluentValidation;

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
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

var app = builder.Build();

app.UseExceptionHandler(exceptionHandlerApp
    => exceptionHandlerApp.Run(async context
        => await Results.Json(new {error = "Unexpected error occurred"}, statusCode: 500)
                     .ExecuteAsync(context)));

app.Use(async (context, next) =>
{
    Console.WriteLine("This is a hard-coded message.");
    await next(context);
});
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
