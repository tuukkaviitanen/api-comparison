using Errors;
using Filters;
using Models;
using Services;
using Utils;

namespace Routers;

public static class TransactionRouter
{
    public static void MapTransactionRouter(this IEndpointRouteBuilder app)
    {
        var endpoints = app.MapGroup("/transactions")
            .AddEndpointFilter<AuthenticationFilter>();

        endpoints.MapGet("/", GetAllTransactions);
        endpoints.MapGet("/{transactionId}", GetSingleTransaction);
        endpoints.MapPost("/", PostTransaction);
        endpoints.MapPut("/{transactionId}", PutTransaction);
        endpoints.MapDelete("/{transactionId}", DeleteTransaction);
    }

    static async Task<IResult> GetAllTransactions(HttpContext context, TransactionService transactionService)
    {
        var credentialId = context.GetCredentialsId();

        var transactions = await transactionService.GetTransactionsAsync(credentialId);

        return Results.Json(transactions);
    }

    static async Task<IResult> GetSingleTransaction(Guid transactionId, HttpContext context, TransactionService transactionService)
    {
        var credentialId = context.GetCredentialsId();

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

    static async Task<IResult> PostTransaction(TransactionRequest transactionRequest, HttpContext context, TransactionService transactionService)
    {
        var credentialId = context.GetCredentialsId();

        var createdTransaction = await transactionService.CreateTransaction(credentialId, transactionRequest);
        return Results.Json(createdTransaction, statusCode: 201);
    }

    static async Task<IResult> PutTransaction(Guid transactionId, TransactionRequest transactionRequest, HttpContext context, TransactionService transactionService)
    {
        var credentialId = context.GetCredentialsId();

        try
        {
            var updatedTransaction = await transactionService.UpdateTransaction(transactionId, credentialId, transactionRequest);

            return Results.Json(updatedTransaction, statusCode: 200);
        }
        catch (NotFoundError)
        {
            return Results.Json(new { error = "Transaction not found" }, statusCode: 404);
        }
    }

    static async Task<IResult> DeleteTransaction(Guid transactionId, HttpContext context, TransactionService transactionService)
    {
        var credentialId = context.GetCredentialsId();

        try
        {
            await transactionService.DeleteTransaction(transactionId, credentialId);

            return Results.NoContent();
        }
        catch (NotFoundError)
        {
            return Results.Json(new { error = "Transaction not found" }, statusCode: 404);
        }
    }
}
