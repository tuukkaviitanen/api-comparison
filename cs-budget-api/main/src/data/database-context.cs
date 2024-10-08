using Microsoft.EntityFrameworkCore;
using Entities;

namespace Data;

public class DatabaseContext(DbContextOptions options) : DbContext(options)
{
    public required DbSet<Credential> Credentials { get; set; }
    public required DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Credentials table mapping
        modelBuilder.Entity<Credential>()
            .Property(credentail => credentail.Username)
            .IsRequired()
            .HasMaxLength(50);
        modelBuilder.Entity<Credential>()
            .HasIndex(credential => credential.Username).IsUnique();
        modelBuilder.Entity<Credential>()
            .Property(credential => credential.PasswordHash)
            .IsRequired()
            .HasMaxLength(64);

        // Transactions table mapping
        modelBuilder.Entity<Transaction>()
            .Property(transaction => transaction.Category)
            .IsRequired()
            .HasMaxLength(50);
        modelBuilder.Entity<Transaction>()
            .Property(transaction => transaction.Description)
            .IsRequired()
            .HasMaxLength(200);
        modelBuilder.Entity<Transaction>()
            .Property(transaction => transaction.Value)
            .HasColumnType("decimal");
        modelBuilder.Entity<Transaction>()
            .Property(transaction => transaction.Timestamp)
            .HasPrecision(3);

        // Map relations
        modelBuilder.Entity<Transaction>()
            .HasOne((transaction) => transaction.Credential)
            .WithMany((credential) => credential.Transactions)
            .HasForeignKey((transaction) => transaction.CredentialId);
    }
}
