using Routers;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var PORT = Environment.GetEnvironmentVariable("PORT") ?? "8080";

app.MapTransactionRouter();
app.MapCredentialRouter();
app.MapReportRouter();

app.Run($"http://*:{PORT}");
