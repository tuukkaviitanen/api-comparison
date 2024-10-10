namespace Models;

public record TransactionRequest(
    string Category,
    string Description,
    decimal Value,
    DateTimeOffset Timestamp);
