use crate::{database, models::Transaction, schema::transactions::dsl};
use bigdecimal::{BigDecimal, ToPrimitive};
use chrono::{DateTime, NaiveDateTime, Utc};
use diesel::prelude::*;
use serde::Serialize;
use uuid::Uuid;

use super::errors::ServiceError;

#[derive(Serialize)]
pub struct ProcessedTransaction {
    pub id: Uuid,
    pub category: String,
    pub description: String,
    pub value: f64,
    pub timestamp: DateTime<Utc>,
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

    let processed_transactions: Result<Vec<ProcessedTransaction>, ServiceError> = transactions
        .iter()
        .map(|t| map_processed_transaction(t))
        .collect();

    Ok(processed_transactions?)
}

pub fn create_transaction(
    credential_id: Uuid,
    category: String,
    description: String,
    value: BigDecimal,
    timestamp: NaiveDateTime,
) -> Result<ProcessedTransaction, ServiceError> {
    let mut db_connection = database::get_connection().map_err(|error| {
        println!(
            "[create_transaction] Database connection error occurred, {:#?}",
            error
        );
        ServiceError::Database
    })?;

    let new_transaction = Transaction {
        id: Uuid::new_v4(),
        credential_id,
        category,
        description,
        value,
        timestamp,
    };

    diesel::insert_into(dsl::transactions)
        .values(&new_transaction)
        .execute(&mut db_connection)
        .map_err(|_| ServiceError::Database)?;

    Ok(map_processed_transaction(&new_transaction)?)
}

fn map_processed_transaction(t: &Transaction) -> Result<ProcessedTransaction, ServiceError> {
    let primitive_value = t.value.to_f64().ok_or_else(|| ServiceError::Conversion)?;

    Ok(ProcessedTransaction {
        id: t.id,
        category: t.category.clone(),
        description: t.description.clone(),
        value: primitive_value,
        timestamp: t.timestamp.and_utc(),
    })
}
