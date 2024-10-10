using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Entities;

public class Transaction
{
    public Guid Id { get; init; }

    [MaxLength(50)]
    public required string Category { get; set; }

    [MaxLength(200)]
    public required string Description { get; set; }

    public decimal Value { get; set; }

    public DateTime Timestamp { get; set; }

    [ForeignKey(nameof(CredentialId))]
    public virtual Credential Credential { get; set; } = null!;

    public required Guid CredentialId { get; set; }
}
