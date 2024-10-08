using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Entities;

[Index(nameof(Username), IsUnique = true)]
public class Credential
{
    public Guid Id { get; init; }

    [MaxLength(50)]
    public required string Username { get; init; }

    [MaxLength(64)]
    public required string PasswordHash { get; init; }
    public virtual List<Transaction> Transactions { get; } = [];
}
