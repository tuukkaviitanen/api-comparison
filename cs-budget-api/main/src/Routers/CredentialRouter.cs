using Errors;
using Filters;
using FluentValidation;
using Services;
using Utils;

namespace Routers;

public static class CredentialRouter
{
    public static void MapCredentialRouter(this IEndpointRouteBuilder app)
    {
        var endpoints = app.MapGroup("/credentials");

        endpoints.MapPost("/", PostCredential)
            .AddEndpointFilter<ValidationFilter<PostCredentialRequestBody>>();

        endpoints.MapDelete("/", DeleteCredential)
            .AddEndpointFilter<AuthenticationFilter>();
    }

    public record PostCredentialRequestBody(string Username, string Password);

    public class PostCredentialValidator : AbstractValidator<PostCredentialRequestBody>
    {
        public PostCredentialValidator()
        {
            RuleFor(x => x.Username).NotEmpty().Length(4, 50);
            RuleFor(x => x.Password).NotEmpty().Length(8, 50);
        }
    }

    static async Task<IResult> PostCredential(PostCredentialRequestBody body, CredentialService credentialService)
    {
        try
        {
            await credentialService.CreateCredentialAsync(body.Username, body.Password);
            return Results.NoContent();
        }
        catch (UniqueError)
        {
            var response = new { error = $"Unique error: Username '{body.Username}' is already taken" };
            return Results.Json(response, statusCode: 400);
        }
    }

    static async Task<IResult> DeleteCredential(HttpContext context, CredentialService credentialService)
    {
        var credentialId = context.GetCredentialId();

        await credentialService.DeleteCredentialAsync(credentialId);
        return Results.NoContent();
    }
}
