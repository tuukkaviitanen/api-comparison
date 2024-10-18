package services_test

import (
	"budget-api/internal/models"
	"budget-api/internal/services"
	"fmt"
	"reflect"
	"testing"
)

type TestCase struct {
	Values         []float64
	ExpectedReport models.BudgetReport
}

var testCases = []TestCase{
	{
		Values: []float64{50, -25, 150, -150},
		ExpectedReport: models.BudgetReport{
			TransactionsSum:   25,
			ExpensesSum:       -175,
			IncomesSum:        200,
			TransactionsCount: 4,
			ExpensesCount:     2,
			IncomesCount:      2,
		},
	},
	{
		Values: []float64{0, 0, 0, 50, -50},
		ExpectedReport: models.BudgetReport{
			TransactionsSum:   0,
			ExpensesSum:       -50,
			IncomesSum:        50,
			TransactionsCount: 5,
			ExpensesCount:     1,
			IncomesCount:      1,
		},
	},
	{
		Values: []float64{0.5, -5.5, 100.25},
		ExpectedReport: models.BudgetReport{
			TransactionsSum:   95.25,
			ExpensesSum:       -5.5,
			IncomesSum:        100.75,
			TransactionsCount: 3,
			ExpensesCount:     1,
			IncomesCount:      2,
		},
	},
	{
		Values:         []float64{},
		ExpectedReport: models.BudgetReport{},
	},
}

func TestReportService(t *testing.T) {

	for _, testCase := range testCases {
		t.Run(fmt.Sprintf("Should generate correct report with: %+v", testCase.Values), func(t *testing.T) {
			report := services.GenerateReport(&testCase.Values)

			isAsExpected := reflect.DeepEqual(report, &testCase.ExpectedReport)

			if !isAsExpected {
				t.Fatalf("Report is not same as expected.\nReceived: %+v\nExpected: %+v\n", report, testCase.ExpectedReport)
			}
		})

	}

}
