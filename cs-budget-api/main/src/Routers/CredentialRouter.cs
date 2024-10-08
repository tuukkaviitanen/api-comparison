using Filters;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Routers;

public static class CredentialRouter
{
    public static void MapCredentialRouter(this IEndpointRouteBuilder app)
    {
        var endpoints = app.MapGroup("/credentials");

        endpoints.MapPost("/", PostCredential);
        endpoints.MapDelete("/", DeleteCredential)
            .AddEndpointFilter<AuthenticationFilter>();
    }

    static NoContent PostCredential()
    {
        return TypedResults.NoContent();
    }

    static NoContent DeleteCredential()
    {
        return TypedResults.NoContent();
    }
}
