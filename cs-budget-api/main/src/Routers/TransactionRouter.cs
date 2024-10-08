using Filters;
using Microsoft.AspNetCore.Http.HttpResults;

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

    static NoContent GetAllTransactions()
    {
        return TypedResults.NoContent();
    }

    static NoContent GetSingleTransaction()
    {
        return TypedResults.NoContent();
    }

    static NoContent PostTransaction()
    {
        return TypedResults.NoContent();
    }

    static NoContent PutTransaction()
    {
        return TypedResults.NoContent();
    }

    static NoContent DeleteTransaction()
    {
        return TypedResults.NoContent();
    }
}
