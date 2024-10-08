using Filters;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Routers;

public static class ReportRouter
{
    public static void MapReportRouter(this IEndpointRouteBuilder app)
    {
        var endpoints = app.MapGroup("/reports")
            .AddEndpointFilter<AuthenticationFilter>(); ;

        endpoints.MapGet("/", GetReport);
    }

    static NoContent GetReport()
    {
        return TypedResults.NoContent();
    }
}
