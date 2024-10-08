using System.Text;
using System.Text.RegularExpressions;

namespace Filters;

public partial class AuthenticationFilter(CredentialService credentialService) : IEndpointFilter
{
    private CredentialService CredentialService => credentialService;

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        string? authenticationHeader = context.HttpContext.Request.Headers.Authorization;

        if (authenticationHeader is null)
        {
            return UnauthorizedResult("Authorization header missing");
        }

        var basicAuthRegexMatch = BasicAuthRegex().Match(authenticationHeader);

        if (basicAuthRegexMatch.Success is false)
        {
            return UnauthorizedResult("Invalid authorization header");
        }

        var encryptedAuthString = basicAuthRegexMatch.Groups["authString"].Value!;

        var decryptedString = ParseBase64(encryptedAuthString);

        if (decryptedString is null)
        {
            return UnauthorizedResult("Invalid base64 string");
        }

        var decryptedAuthRegexMatch = BasicAuthDecryptedFormatRegex().Match(decryptedString);

        if (decryptedAuthRegexMatch.Success is false)
        {
            return UnauthorizedResult("Invalid credentials format");
        }

        var username = basicAuthRegexMatch.Groups["username"].Value!;
        var password = basicAuthRegexMatch.Groups["password"].Value!;

        var credentialId = await CredentialService.GetCredentialIdAsync(username, password);

        if (credentialId is null)
        {
            return UnauthorizedResult("Credentials invalid");
        }

        context.HttpContext.Items["credentialId"] = credentialId;

        return await next(context);
    }

    [GeneratedRegex(@"^basic (?<authString>.+)", RegexOptions.IgnoreCase)]
    private static partial Regex BasicAuthRegex();

    [GeneratedRegex(@"(?<username>.+):(?<password>.+)")]
    private static partial Regex BasicAuthDecryptedFormatRegex();

    private string? ParseBase64(string base64String)
    {
        try
        {
            var convertedBytes = Convert.FromBase64String(base64String);

            string decodedString = Encoding.UTF8.GetString(convertedBytes);

            return decodedString;
        }
        catch
        {
            return null;
        }
    }

    private IResult UnauthorizedResult(string message)
    {
        var response = new { error = $"Authentication error: {message}" };
        return Results.Json(response, statusCode: 401);
    }
}
