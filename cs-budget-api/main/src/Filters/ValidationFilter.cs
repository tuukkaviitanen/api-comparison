
using FluentValidation;

namespace Filters;

public class ValidationFilter<TRequest>(IValidator<TRequest> validator) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var request = context.Arguments.OfType<TRequest>().First();

        var result = await validator.ValidateAsync(request, context.HttpContext.RequestAborted);

        if (result.IsValid is false)
        {
            return Results.Json(new { error = $"Validation error: {result}" }, statusCode: 400);
        }

        return await next(context);
    }
}
