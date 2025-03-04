using Data;
using Entities;
using Errors;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Linq.Dynamic.Core;

namespace Services;

public class TransactionService(DatabaseContext dbContext)
{
    private static ProcessedTransaction MapToProcessedTransaction(Transaction transaction) => new(
            transaction.Id,
            transaction.Category,
            transaction.Description,
            transaction.Value,
            transaction.Timestamp);

    public async Task<List<ProcessedTransaction>> GetTransactionsAsync(
        Guid credentialId,
        string? category,
        DateTimeOffset? from,
        DateTimeOffset? to,
        string sort,
        string order,
        int limit,
        int skip)
    {
        var transactions = await dbContext.Transactions
            .Where(transaction => transaction.CredentialId == credentialId
                && (category == null || transaction.Category == category)
                && (from == null || transaction.Timestamp >= from)
                && (to == null || transaction.Timestamp <= to))
            .OrderBy($"{sort} {order}") // Dynamic Linq
            .Skip(skip)
            .Take(limit)
            .Select(transaction => MapToProcessedTransaction(transaction))
            .ToListAsync();

        return transactions;
    }

    public async Task<ProcessedTransaction> GetTransactionAsync(Guid transactionId, Guid credentialId)
    {
        var transaction = await dbContext.Transactions
            .Where(transaction => transaction.Id == transactionId
                && transaction.CredentialId == credentialId)
            .Select(transaction => MapToProcessedTransaction(transaction))
            .FirstOrDefaultAsync() ?? throw new NotFoundError();

        return transaction;
    }

    public async Task<ProcessedTransaction> CreateTransactionAsync(Guid credentialId, TransactionRequest transactionRequest)
    {
        var transaction = new Transaction
        {
            Category = transactionRequest.Category,
            Description = transactionRequest.Description,
            Timestamp = transactionRequest.Timestamp.ToUniversalTime(),
            Value = transactionRequest.Value,
            CredentialId = credentialId
        };

        await dbContext.Transactions.AddAsync(transaction);

        await dbContext.SaveChangesAsync();

        return MapToProcessedTransaction(transaction);
    }

    public async Task<ProcessedTransaction> UpdateTransactionAsync(Guid transactionId, Guid credentialId, TransactionRequest transactionRequest)
    {
        var existingTransaction = await dbContext.Transactions
            .Where(transaction => transaction.Id == transactionId
                && transaction.CredentialId == credentialId)
            .FirstOrDefaultAsync() ?? throw new NotFoundError();

        existingTransaction.Category = transactionRequest.Category;
        existingTransaction.Description = transactionRequest.Description;
        existingTransaction.Value = transactionRequest.Value;
        existingTransaction.Timestamp = transactionRequest.Timestamp.ToUniversalTime();

        await dbContext.SaveChangesAsync();

        return MapToProcessedTransaction(existingTransaction);
    }

    public async Task DeleteTransactionAsync(Guid transactionId, Guid credentialId)
    {
        var affectedRows = await dbContext.Transactions
            .Where(transaction => transaction.Id == transactionId
                && transaction.CredentialId == credentialId)
            .ExecuteDeleteAsync();

        if (affectedRows == 0)
        {
            throw new NotFoundError();
        }
    }
}
