public record BudgetReport
(
    decimal transactions_sum,
    decimal expenses_sum,
    decimal incomes_sum,
    int transactions_count,
    int expenses_count,
    int incomes_count
);