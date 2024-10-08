namespace Entities;

public class Transaction
{
    public Guid Id { get; init; }
    public required string Category { get; set; }
    public required string Description { get; set; }
    public double Value { get; set; }
    public DateTime Timestamp { get; set; }

    public required Credential Credential { get; set; }
    public required string CredentialId { get; set; }
}
