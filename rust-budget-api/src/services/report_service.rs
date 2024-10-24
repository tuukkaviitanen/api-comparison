use crate::database;
use crate::models::Transaction;
use crate::schema::transactions::dsl;
use crate::services::errors::ServiceError;
use bigdecimal::BigDecimal;
use diesel::prelude::*;
use serde::Serialize;
use uuid::Uuid;

use super::TransactionFilters;

#[cfg(test)]
mod tests;

#[derive(Serialize, Debug, PartialEq)]
pub struct FinalBudgetReport {
    transactions_sum: f64,
    expenses_sum: f64,
    incomes_sum: f64,
    transactions_count: u32,
    expenses_count: u32,
    incomes_count: u32,
}

pub struct BudgetReport {
    transactions_sum: BigDecimal,
    expenses_sum: BigDecimal,
    incomes_sum: BigDecimal,
    transactions_count: u32,
    expenses_count: u32,
    incomes_count: u32,
}

impl BudgetReport {
    pub fn new() -> Self {
        BudgetReport {
            transactions_sum: BigDecimal::from(0),
            expenses_count: 0,
            expenses_sum: BigDecimal::from(0),
            incomes_count: 0,
            incomes_sum: BigDecimal::from(0),
            transactions_count: 0,
        }
    }
}

impl BudgetReport {
    pub fn to_final(&self) -> Result<FinalBudgetReport, ServiceError> {
        Ok(FinalBudgetReport {
            transactions_sum: self
                .transactions_sum
                .to_string()
                .parse::<f64>()
                .map_err(|_| ServiceError::Conversion)?,
            expenses_sum: self
                .expenses_sum
                .to_string()
                .parse::<f64>()
                .map_err(|_| ServiceError::Conversion)?,
            incomes_sum: self
                .incomes_sum
                .to_string()
                .parse::<f64>()
                .map_err(|_| ServiceError::Conversion)?,
            transactions_count: self.transactions_count,
            expenses_count: self.expenses_count,
            incomes_count: self.incomes_count,
        })
    }
}

pub fn get_report(
    credential_id: Uuid,
    filters: TransactionFilters,
) -> Result<FinalBudgetReport, ServiceError> {
    let mut db_connection = database::get_connection().map_err(|error| {
        println!(
            "[get_credential_id] Database connection error occurred, {:#?}",
            error
        );
        ServiceError::Database
    })?;

    let mut query = dsl::transactions
        .filter(dsl::credential_id.eq(credential_id))
        .into_boxed();

    if let Some(category) = filters.category {
        query = query.filter(dsl::category.eq(category));
    }

    if let Some(from) = filters.from {
        query = query.filter(dsl::timestamp.ge(from));
    }

    if let Some(to) = filters.to {
        query = query.filter(dsl::timestamp.le(to));
    }

    let results = query
        .load::<Transaction>(&mut db_connection)
        .map_err(|_| ServiceError::Database)?
        .into_iter()
        .map(|transaction| transaction.value)
        .collect::<Vec<BigDecimal>>();

    generate_report(results)
}

pub fn generate_report(values: Vec<BigDecimal>) -> Result<FinalBudgetReport, ServiceError> {
    values
        .iter()
        .fold(BudgetReport::new(), |report, next| {
            let is_expense = next.lt(&BigDecimal::from(0));
            let is_income = next.gt(&BigDecimal::from(0));

            BudgetReport {
                transactions_sum: report.transactions_sum + next,
                transactions_count: report.transactions_count + 1,
                expenses_sum: if is_expense {
                    report.expenses_sum + next
                } else {
                    report.expenses_sum
                },
                incomes_sum: if is_income {
                    report.incomes_sum + next
                } else {
                    report.incomes_sum
                },
                expenses_count: if is_expense {
                    report.expenses_count + 1
                } else {
                    report.expenses_count
                },
                incomes_count: if is_income {
                    report.incomes_count + 1
                } else {
                    report.incomes_count
                },
            }
        })
        .to_final()
}
