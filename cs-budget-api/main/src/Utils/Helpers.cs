using System.Security.Cryptography;
using System.Text;

namespace Utils;

public static class Helpers
{

    public static Guid GetCredentialsId(this HttpContext httpContext)
    {
        if (httpContext.Items["credentialId"] is Guid credentialId)
        {
            return credentialId;
        }
        else
        {
            throw new Exception("credentialId was not set in middleware");
        }
    }

    public static void SetCredentialsId(this HttpContext httpContext, Guid credentialsId)
    {
        httpContext.Items["credentialId"] = credentialsId;
    }

    public static string GenerateHash(string stringValue)
    {
        using (SHA256 sha256Hash = SHA256.Create())
        {
            var bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(stringValue));

            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i++)
            {
                builder.Append(bytes[i].ToString("x"));
            }
            return builder.ToString();
        }
    }
}
