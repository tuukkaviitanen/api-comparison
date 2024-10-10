namespace Models;

public record ProcessedTransaction(Guid Id, string Category, string Description, decimal Value, DateTime Timestamp);
