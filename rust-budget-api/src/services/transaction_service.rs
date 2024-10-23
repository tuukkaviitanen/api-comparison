use crate::{database, models::Transaction, schema::transactions::dsl};
use bigdecimal::BigDecimal;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::Serialize;
use uuid::Uuid;

use super::errors::ServiceError;

#[derive(Serialize)]
pub struct ProcessedTransaction {
    pub id: Uuid,
    pub category: String,
    pub description: String,
    pub value: BigDecimal,
    pub timestamp: NaiveDateTime,
}

pub fn get_transactions(credential_id: Uuid) -> Result<Vec<ProcessedTransaction>, ServiceError> {
    let mut db_connection = database::get_connection().map_err(|error| {
        println!(
            "[get_transactions] Database connection error occurred, {:#?}",
            error
        );
        ServiceError::Database
    })?;

    let transactions = dsl::transactions
        .filter(dsl::credential_id.eq(credential_id))
        .select(Transaction::as_select())
        .load::<Transaction>(&mut db_connection)
        .map_err(|_| ServiceError::Database)?;

    let processed_transactions = transactions.iter().map(map_processed_transaction).collect();

    Ok(processed_transactions)
}

fn map_processed_transaction(t: &Transaction) -> ProcessedTransaction {
    ProcessedTransaction {
        id: t.id,
        category: t.category.clone(),
        description: t.description.clone(),
        value: t.value.clone(),
        timestamp: t.timestamp,
    }
}
