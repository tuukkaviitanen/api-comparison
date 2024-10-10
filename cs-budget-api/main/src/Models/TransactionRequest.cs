namespace Models;

public record TransactionRequest(string Category, string Description, decimal Value, DateTime Timestamp);
