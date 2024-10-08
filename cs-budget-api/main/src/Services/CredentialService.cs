using Data;
using Microsoft.EntityFrameworkCore;

public class CredentialService(DatabaseContext dbContext)
{

    private DatabaseContext DbContext => dbContext;

    public async Task<Guid?> GetCredentialIdAsync(string username, string password)
    {
        var passwordHash = password;
        var credential = await DbContext.Credentials
            .FirstOrDefaultAsync((credential) => credential.Username == username &&
                credential.PasswordHash == passwordHash);
        return credential?.Id;
    }
}
