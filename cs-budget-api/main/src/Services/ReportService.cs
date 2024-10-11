using Data;
using Microsoft.EntityFrameworkCore;
using Models;

namespace Services;

public class ReportService(DatabaseContext dbContext)
{

    private static BudgetReport MapBudgetReport(List<decimal> transactionValues)
    {
        var budgetReport = transactionValues.Aggregate(new BudgetReport(0, 0, 0, 0, 0, 0), (incompleteReport, value) =>
        {
            var isExpense = value < 0;
            var isIncome = value > 0;

            return new BudgetReport(
                transactions_sum: incompleteReport.transactions_sum + value,
                transactions_count: incompleteReport.transactions_count + 1,
                incomes_sum: isIncome ? incompleteReport.incomes_sum + value : incompleteReport.incomes_sum,
                incomes_count: isIncome ? incompleteReport.incomes_count + 1 : incompleteReport.incomes_count,
                expenses_sum: isExpense ? incompleteReport.expenses_sum + value : incompleteReport.expenses_sum,
                expenses_count: isExpense ? incompleteReport.expenses_count + 1 : incompleteReport.expenses_count
            );
        });

        return budgetReport;
    }

    public async Task<BudgetReport> GenerateReportAsync(Guid credentialId, string? category, DateTimeOffset? to, DateTimeOffset? from)
    {
        var transactionValues = await dbContext.Transactions
            .Where(transaction => transaction.CredentialId == credentialId
                && (category == null || transaction.Category == category)
                && (from == null || transaction.Timestamp >= from)
                && (to == null || transaction.Timestamp <= to))
            .Select(transaction => transaction.Value)
            .ToListAsync();

        var budgetReport = MapBudgetReport(transactionValues);

        return budgetReport;
    }
}
