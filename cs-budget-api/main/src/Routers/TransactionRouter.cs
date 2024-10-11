using Errors;
using Filters;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Models;
using Services;
using System.Text.Json;
using Utils;

namespace Routers;

public static class TransactionRouter
{
    public static void MapTransactionRouter(this IEndpointRouteBuilder app)
    {
        var endpoints = app.MapGroup("/transactions")
            .AddEndpointFilter<AuthenticationFilter>();

        endpoints.MapGet("/", GetAllTransactions)
            .AddEndpointFilter<ValidationFilter<GetAllTransactionsParams>>();
        endpoints.MapGet("/{transactionId}", GetSingleTransaction);
        endpoints.MapPost("/", PostTransaction)
            .AddEndpointFilter<ValidationFilter<TransactionRequest>>();
        endpoints.MapPut("/{transactionId}", PutTransaction)
            .AddEndpointFilter<ValidationFilter<TransactionRequest>>();
        endpoints.MapDelete("/{transactionId}", DeleteTransaction);
    }

    static readonly string[] SortOptions = ["category", "timestamp"];
    static readonly string[] OrderOptions = ["asc", "desc"];

    public record GetAllTransactionsParams(
        [FromQuery] string? Category,
        [FromQuery] DateTimeOffset? From,
        [FromQuery] DateTimeOffset? To,
        [FromQuery] string Sort = "timestamp",
        [FromQuery] string Order = "desc",
        [FromQuery] int Limit = 10,
        [FromQuery] int Skip = 0);

    public class GetAllTransactionsParamsValidator : AbstractValidator<GetAllTransactionsParams>
    {
        public GetAllTransactionsParamsValidator()
        {
            RuleFor(x => x.Category)
                .NotEmpty()
                .Must((category) => Helpers.ValidCategories.Contains(category?.ToLower()))
                .When(x => x.Category is not null)
                .WithMessage("Invalid category");
            RuleFor(x => x.Sort)
                .NotEmpty()
                .Must(sort => SortOptions.Contains(sort.ToLower()))
                .WithMessage("Invalid sort");
            RuleFor(x => x.Order)
                .NotEmpty()
                .Must(order => OrderOptions.Contains(order.ToLower()))
                .WithMessage("Invalid order");
            RuleFor(x => x.Limit)
                .GreaterThanOrEqualTo(1);
            RuleFor(x => x.Skip)
                .GreaterThanOrEqualTo(0);
        }
    }

    static async Task<IResult> GetAllTransactions(
        [AsParameters] GetAllTransactionsParams parameters,
        HttpContext context,
        TransactionService transactionService)
    {
        var credentialId = context.GetCredentialId();

        var transactions = await transactionService.GetTransactionsAsync(
            credentialId,
            parameters.Category?.ToLower(),
            parameters.From,
            parameters.To,
            parameters.Sort.ToLower(),
            parameters.Order.ToLower(),
            parameters.Limit,
            parameters.Skip);

        return Results.Json(transactions);
    }

    static async Task<IResult> GetSingleTransaction(Guid transactionId, HttpContext context, TransactionService transactionService)
    {
        var credentialId = context.GetCredentialId();

        try
        {
            var transaction = await transactionService.GetTransactionAsync(transactionId, credentialId);
            return Results.Json(transaction);
        }
        catch (NotFoundError)
        {
            return Results.Json(new { error = "Transaction not found" }, statusCode: 404);
        }
    }

    public class TransactionRequestValidator : AbstractValidator<TransactionRequest>
    {
        public TransactionRequestValidator()
        {
            RuleFor(x => x.Category)
                .NotEmpty()
                .Must((category) => Helpers.ValidCategories.Contains(category?.ToLower()))
                .WithMessage("Invalid category");
            RuleFor(x => x.Description)
                .NotEmpty()
                .Length(4, 200);
            RuleFor(x => x.Value)
                .Must(x => decimal.Round(x, 2) == x)
                .WithMessage("Value with too many decimal places")
                .GreaterThanOrEqualTo(-1_000_000_000)
                .LessThanOrEqualTo(1_000_000_000);
        }
    }

    static async Task<IResult> PostTransaction(TransactionRequest transactionRequest, HttpContext context, TransactionService transactionService)
    {
        var credentialId = context.GetCredentialId();

        var createdTransaction = await transactionService.CreateTransactionAsync(
            credentialId,
            new TransactionRequest(transactionRequest.Category.ToLower(),
            transactionRequest.Description,
            transactionRequest.Value,
            transactionRequest.Timestamp));

        return Results.Json(createdTransaction, statusCode: 201);
    }

    static async Task<IResult> PutTransaction(TransactionRequest transactionRequest, Guid transactionId, HttpContext context, TransactionService transactionService)
    {
        var credentialId = context.GetCredentialId();

        try
        {
            var updatedTransaction = await transactionService.UpdateTransactionAsync(
                transactionId,
                credentialId,
                new TransactionRequest(
                    transactionRequest.Category.ToLower(),
                    transactionRequest.Description,
                    transactionRequest.Value,
                    transactionRequest.Timestamp));

            var jsonSerializerOptions = new JsonSerializerOptions
            {
                Converters = { new DateTimeOffsetConverter() }
            };


            return Results.Json(updatedTransaction, statusCode: 200);
        }
        catch (NotFoundError)
        {
            return Results.Json(new { error = "Transaction not found" }, statusCode: 404);
        }
    }

    static async Task<IResult> DeleteTransaction(Guid transactionId, HttpContext context, TransactionService transactionService)
    {
        var credentialId = context.GetCredentialId();

        try
        {
            await transactionService.DeleteTransactionAsync(transactionId, credentialId);

            return Results.NoContent();
        }
        catch (NotFoundError)
        {
            return Results.Json(new { error = "Transaction not found" }, statusCode: 404);
        }
    }
}
