namespace Entities;

public class Credential
{
    public Guid Id { get; init; }
    public required string Username { get; init; }
    public required string PasswordHash { get; init; }
    public List<Transaction> Transactions { get; } = [];
}
