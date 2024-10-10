using Errors;
using Filters;
using Services;
using Utils;

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

    public record PostCredentialRequestBody(string Username, string Password);

    static async Task<IResult> PostCredential(PostCredentialRequestBody body, CredentialService credentialService)
    {
        try
        {
            await credentialService.CreateCredentialAsync(body.Username, body.Password);
            return Results.NoContent();
        }
        catch (UniqueError)
        {
            var response = new { error = $"Unique error: Username not unique" };
            return Results.Json(response, statusCode: 400);
        }
    }

    static async Task<IResult> DeleteCredential(HttpContext context, CredentialService credentialService)
    {
        var credentialId = context.GetCredentialsId();

        await credentialService.DeleteCredentialAsync(credentialId);
        return Results.NoContent();
    }
}
