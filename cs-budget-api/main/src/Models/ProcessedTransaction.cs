using System.Text.Json.Serialization;
using Utils;

namespace Models;

public class ProcessedTransaction(Guid id, string category, string description, decimal value, DateTimeOffset timestamp)
{
    public Guid Id { get; set; } = id;
    public string Category { get; set; } = category;
    public string Description { get; set; } = description;
    public decimal Value { get; set; } = value;

    [JsonConverter(typeof(DateTimeOffsetConverter))]
    public DateTimeOffset Timestamp { get; set; } = timestamp;
}
