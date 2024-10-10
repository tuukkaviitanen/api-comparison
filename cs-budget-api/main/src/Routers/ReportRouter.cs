using Filters;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Services;
using Utils;

namespace Routers;

public static class ReportRouter
{
    public static void MapReportRouter(this IEndpointRouteBuilder app)
    {
        var endpoints = app.MapGroup("/reports")
            .AddEndpointFilter<AuthenticationFilter>()
            .AddEndpointFilter<ValidationFilter<GetReportParams>>();

        endpoints.MapGet("/", GetReport);
    }

    public record GetReportParams(
        [FromQuery] string? Category,
        [FromQuery] DateTimeOffset? From,
        [FromQuery] DateTimeOffset? To);

    public class GetReportParamsValidator : AbstractValidator<GetReportParams>
    {
        public GetReportParamsValidator()
        {
            RuleFor(x => x.Category)
                .Must((category) => Helpers.ValidCategories.Contains(category?.ToLower()))
                .WithMessage("Invalid category");
        }
    }

    static async Task<IResult> GetReport(
        [AsParameters] GetReportParams parameters,
        HttpContext context,
        ReportService reportService)
    {
        var credentialId = context.GetCredentialId();

        var budgetReport = await reportService.GenerateReportAsync(
            credentialId,
            parameters.Category,
            parameters.To,
            parameters.From);

        return Results.Json(budgetReport);
    }
}
