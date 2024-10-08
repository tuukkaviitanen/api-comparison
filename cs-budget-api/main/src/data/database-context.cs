using Microsoft.EntityFrameworkCore;
using Models;

namespace Data;

public class DatabaseContext(DbContextOptions options) : DbContext(options)
{
    public required DbSet<Credential> Credentials { get; set; }
    public required DbSet<Transaction> Transactions { get; set; }

}
