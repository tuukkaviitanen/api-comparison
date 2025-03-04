using Data;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
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

builder.Services.AddDbContextPool<DatabaseContext>(options => options.UseNpgsql(CONNECTION_STRING), poolSize: 100);
builder.Services.AddScoped<CredentialService>();
builder.Services.AddScoped<TransactionService>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddCors();

// Makes parameter binding errors throw errors instead of automatically returning 400
builder.Services.Configure<RouteHandlerOptions>(options => options.ThrowOnBadRequest = true);

var app = builder.Build();

app.UseCors();

app.UseExceptionHandler(appError =>
{
    appError.Run(async context =>
    {
        var contextFeature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = contextFeature?.Error;

        if (exception is BadHttpRequestException)
        {
            await Results.Json(new { error = "Validation error: Parameter(s) of invalid type" }, statusCode: 400)
                .ExecuteAsync(context);
        }
        else
        {
            await Results.Json(new { error = "Unexpected error occurred" }, statusCode: 500)
                         .ExecuteAsync(context);
        }

    });
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
