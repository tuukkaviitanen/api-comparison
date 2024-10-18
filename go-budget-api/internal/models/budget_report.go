package models

type BudgetReport struct {
	TransactionsSum   float64 `json:"transactions_sum"`
	ExpensesSum       float64 `json:"expenses_sum"`
	IncomesSum        float64 `json:"incomes_sum"`
	TransactionsCount int32   `json:"transactions_count"`
	ExpensesCount     int32   `json:"expenses_count"`
	IncomesCount      int32   `json:"incomes_count"`
}
