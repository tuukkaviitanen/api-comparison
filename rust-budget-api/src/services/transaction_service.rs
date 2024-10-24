use crate::{database, models::Transaction, schema::transactions::dsl};
use bigdecimal::BigDecimal;
use chrono::{DateTime, NaiveDateTime, Utc};
use diesel::prelude::*;
use serde::Serialize;
use uuid::Uuid;

use super::{errors::ServiceError, TransactionFilters};

pub fn serialize_datetime<S>(datetime: &DateTime<Utc>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    datetime
        .to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
        .serialize(serializer)
}

#[derive(Serialize)]
pub struct ProcessedTransaction {
    pub id: Uuid,
    pub category: String,
    pub description: String,
    pub value: f64,
    #[serde(serialize_with = "serialize_datetime")]
    pub timestamp: DateTime<Utc>,
}

pub fn get_transactions(
    credential_id: Uuid,
    filters: TransactionFilters,
    sort: String,
    order: String,
    skip: u32,
    limit: u32,
) -> Result<Vec<ProcessedTransaction>, ServiceError> {
    let mut db_connection = database::get_connection().map_err(|error| {
        println!(
            "[get_transactions] Database connection error occurred, {:#?}",
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

    query = match sort.as_str() {
        "category" => match order.as_str() {
            "asc" => query.order(dsl::category.asc()),
            "desc" => query.order(dsl::category.desc()),
            _ => query,
        },
        "timestamp" => match order.as_str() {
            "asc" => query.order(dsl::timestamp.asc()),
            "desc" => query.order(dsl::timestamp.desc()),
            _ => query,
        },
        _ => query,
    };

    let transactions = query
        .offset(skip as i64)
        .limit(limit as i64)
        .select(Transaction::as_select())
        .load::<Transaction>(&mut db_connection)
        .map_err(|_| ServiceError::Database)?;

    let processed_transactions: Result<Vec<ProcessedTransaction>, ServiceError> =
        transactions.iter().map(map_processed_transaction).collect();

    processed_transactions
}

pub fn get_single_transaction(
    transaction_id: Uuid,
    credential_id: Uuid,
) -> Result<ProcessedTransaction, ServiceError> {
    let mut db_connection = database::get_connection().map_err(|error| {
        println!(
            "[get_single_transaction] Database connection error occurred, {:#?}",
            error
        );
        ServiceError::Database
    })?;

    let transaction = dsl::transactions
        .filter(dsl::id.eq(transaction_id))
        .filter(dsl::credential_id.eq(credential_id))
        .first::<Transaction>(&mut db_connection)
        .optional()
        .map_err(|_| ServiceError::Database)?
        .ok_or(ServiceError::NotFound)?;

    map_processed_transaction(&transaction)
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

    map_processed_transaction(&new_transaction)
}

pub fn update_transaction(
    transaction_id: Uuid,
    credential_id: Uuid,
    category: String,
    description: String,
    value: BigDecimal,
    timestamp: NaiveDateTime,
) -> Result<ProcessedTransaction, ServiceError> {
    let mut db_connection = database::get_connection().map_err(|error| {
        println!(
            "[update_transaction] Database connection error occurred, {:#?}",
            error
        );
        ServiceError::Database
    })?;

    let target = dsl::transactions
        .filter(dsl::id.eq(transaction_id))
        .filter(dsl::credential_id.eq(credential_id));

    let rows_updated = diesel::update(target)
        .set((
            dsl::category.eq(category),
            dsl::description.eq(description),
            dsl::value.eq(value),
            dsl::timestamp.eq(timestamp),
        ))
        .execute(&mut db_connection)
        .map_err(|_| ServiceError::Database)?;

    if rows_updated == 0 {
        return Err(ServiceError::NotFound);
    }

    let updated_transaction = dsl::transactions
        .filter(dsl::id.eq(transaction_id))
        .first::<Transaction>(&mut db_connection)
        .map_err(|_| ServiceError::Database)?;

    map_processed_transaction(&updated_transaction)
}

pub fn delete_transaction(transaction_id: Uuid, credential_id: Uuid) -> Result<(), ServiceError> {
    let mut db_connection = database::get_connection().map_err(|error| {
        println!(
            "[delete_transaction] Database connection error occurred, {:#?}",
            error
        );
        ServiceError::Database
    })?;

    let target = dsl::transactions
        .filter(dsl::id.eq(transaction_id))
        .filter(dsl::credential_id.eq(credential_id));

    let rows_deleted = diesel::delete(target)
        .execute(&mut db_connection)
        .map_err(|_| ServiceError::Database)?;

    if rows_deleted == 0 {
        Err(ServiceError::NotFound)
    } else {
        Ok(())
    }
}

fn map_processed_transaction(t: &Transaction) -> Result<ProcessedTransaction, ServiceError> {
    let primitive_value = t
        .value
        .to_string()
        .parse::<f64>()
        .map_err(|_| ServiceError::Conversion)?;

    Ok(ProcessedTransaction {
        id: t.id,
        category: t.category.clone(),
        description: t.description.clone(),
        value: primitive_value,
        timestamp: t.timestamp.and_utc(),
    })
}
