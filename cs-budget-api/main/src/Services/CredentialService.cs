using Data;
using Entities;
using Errors;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Utils;

public class CredentialService(DatabaseContext dbContext)
{

    private DatabaseContext DbContext => dbContext;

    public async Task<Guid?> GetCredentialIdAsync(string username, string password)
    {
        var asd = "asd";
        var passwordHash = Helpers.GenerateHash(password);
        var credential = await DbContext.Credentials
            .FirstOrDefaultAsync((credential) => credential.Username == username &&
                credential.PasswordHash == passwordHash);

        Console.WriteLine($"username: {username}, passwordHash: {passwordHash}, ID: {credential?.Id}, asd: {asd}");
        return credential?.Id;
    }

    public async Task CreateCredentialAsync(string username, string password)
    {
        try
        {
            var passwordHash = Helpers.GenerateHash(password);
            var credential = await DbContext.Credentials.AddAsync(new Credential
            {
                Username = username,
                PasswordHash = passwordHash
            });
            await DbContext.SaveChangesAsync();
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
        await DbContext.Credentials
            .Where((credential) => credential.Id == credentialId)
            .ExecuteDeleteAsync();
    }
}
