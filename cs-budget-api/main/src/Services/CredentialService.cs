using Data;
using Entities;
using Errors;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Utils;

namespace Services;

public class CredentialService(DatabaseContext dbContext)
{
    public async Task<Guid?> GetCredentialIdAsync(string username, string password)
    {
        var passwordHash = Helpers.GenerateHash(password);
        var credential = await dbContext.Credentials
            .FirstOrDefaultAsync((credential) => credential.Username == username &&
                credential.PasswordHash == passwordHash);

        return credential?.Id;
    }

    public async Task CreateCredentialAsync(string username, string password)
    {
        try
        {
            var passwordHash = Helpers.GenerateHash(password);
            var credential = await dbContext.Credentials.AddAsync(new Credential
            {
                Username = username,
                PasswordHash = passwordHash
            });
            await dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException error)
        when (error.InnerException is PostgresException pgException
            && pgException.SqlState == "23505")
        {
            throw new UniqueError();
        }
    }

    public async Task DeleteCredentialAsync(Guid credentialId)
    {
        await dbContext.Credentials
            .Where((credential) => credential.Id == credentialId)
            .ExecuteDeleteAsync();
    }
}
