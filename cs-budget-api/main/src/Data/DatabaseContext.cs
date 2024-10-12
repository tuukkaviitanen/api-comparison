using Entities;
using Microsoft.EntityFrameworkCore;

namespace Data;

public class DatabaseContext : DbContext
{
    public virtual required DbSet<Credential> Credentials { get; set; }
    public virtual required DbSet<Transaction> Transactions { get; set; }

    public DatabaseContext(){}

    public DatabaseContext(DbContextOptions options) : base(options) {}
}
