using Filters;
using Microsoft.AspNetCore.Mvc;
using Services;
using Utils;

namespace Routers;

public static class ReportRouter
{
    public static void MapReportRouter(this IEndpointRouteBuilder app)
    {
        var endpoints = app.MapGroup("/reports")
            .AddEndpointFilter<AuthenticationFilter>(); ;

        endpoints.MapGet("/", GetReport);
    }

    static async Task<IResult> GetReport(
        HttpContext context,
        ReportService reportService,
        [FromQuery] string? category,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to)
    {
        var credentialId = context.GetCredentialsId();

        var budgetReport = await reportService.GenerateReportAsync(credentialId, category, to, from);

        return Results.Json(budgetReport);
    }
}
