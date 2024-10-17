package models

type BudgetReport struct {
	TransactionsSum   float32 `json:"transactions_sum"`
	ExpensesSum       float32 `json:"expenses_sum"`
	IncomesSum        float32 `json:"incomes_sum"`
	TransactionsCount int32   `json:"transactions_count"`
	ExpensesCount     int32   `json:"expenses_count"`
	IncomesCount      int32   `json:"incomes_count"`
}
