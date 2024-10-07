using Routers;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var PORT = Environment.GetEnvironmentVariable("PORT") ?? "8080";

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
