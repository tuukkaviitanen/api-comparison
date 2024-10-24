use super::FinalBudgetReport;
use bigdecimal::BigDecimal;
use std::str::FromStr;

use super::generate_report;

macro_rules! report_test_cases {
    ($($name:ident: ($input:expr, $expected:expr),)*) => {
    $(
        #[test]
        fn $name() {
            // Convert the f64 vector to BigDecimal vector
            let big_decimal_values: Vec<BigDecimal> = $input.iter().map(|&x: &f64| BigDecimal::from_str(&x.to_string()).unwrap()).collect();

            assert_eq!($expected, generate_report(big_decimal_values).unwrap());
        }
    )*
    }
}

report_test_cases! {
    test_mixed_transactions1: (vec![50.0, -25.0, 150.0, -150.0], FinalBudgetReport {
        transactions_sum: 25.0,
        expenses_sum: -175.0,
        incomes_sum: 200.0,
        transactions_count: 4,
        expenses_count: 2,
        incomes_count: 2,
    }),
    test_mixed_transactions2: (vec![0.0, 0.0, 0.0, 50.0, -50.0], FinalBudgetReport {
        transactions_sum: 0.0,
        expenses_sum: -50.0,
        incomes_sum: 50.0,
        transactions_count: 5,
        expenses_count: 1,
        incomes_count: 1,
    }),
    test_mixed_transactions3: (vec![0.5, -5.5, 100.25], FinalBudgetReport {
        transactions_sum: 95.25,
        expenses_sum: -5.5,
        incomes_sum: 100.75,
        transactions_count: 3,
        expenses_count: 1,
        incomes_count: 2,
    }),
    test_empty_report: (vec![], FinalBudgetReport {
        transactions_sum: 0.0,
        expenses_sum: 0.0,
        incomes_sum: 0.0,
        transactions_count: 0,
        expenses_count: 0,
        incomes_count: 0,
    }),
}
