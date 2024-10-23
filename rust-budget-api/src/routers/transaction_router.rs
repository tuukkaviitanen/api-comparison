use std::str::FromStr;

use crate::{
    errors::Error,
    middlewares::authenticate,
    services::{errors::ServiceError, transaction_service},
};
use axum::{
    extract::Path,
    http::StatusCode,
    middleware,
    response::{IntoResponse, Response},
    routing::{delete, get, post, put},
    Extension, Json, Router,
};
use bigdecimal::BigDecimal;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use uuid::Uuid;

pub fn routes() -> Router {
    Router::new()
        .route("/", get(get_transactions))
        .route("/:transactionId", get(get_single_transaction))
        .route("/", post(post_transaction))
        .route("/:transactionId", put(put_transaction))
        .route("/:transactionId", delete(delete_transaction))
        .route_layer(middleware::from_fn(authenticate))
}

async fn get_transactions(Extension(credential_id): Extension<Uuid>) -> Result<Response, Error> {
    transaction_service::get_transactions(credential_id)
        .map_err(|_| Error::Unexpected)
        .map(|transactions| (StatusCode::OK, Json(transactions)).into_response())
}

async fn get_single_transaction(
    Extension(credential_id): Extension<Uuid>,
    Path(transaction_id): Path<Uuid>,
) -> Result<Response, Error> {
    transaction_service::get_single_transaction(transaction_id, credential_id)
        .map_err(|error| match error {
            ServiceError::NotFound => Error::NotFound,
            _ => Error::Unexpected,
        })
        .map(|transaction| (StatusCode::OK, Json(transaction)).into_response())
}

#[derive(Deserialize)]
struct TransactionRequestBody {
    pub category: String,
    pub description: String,
    pub value: f64,
    pub timestamp: DateTime<Utc>,
}

async fn post_transaction(
    Extension(credential_id): Extension<Uuid>,
    Json(body): Json<TransactionRequestBody>,
) -> Result<Response, Error> {
    // Parsing from float causes floating point errors
    let decimal_value =
        BigDecimal::from_str(&body.value.to_string()).map_err(|_| Error::Validation)?;

    transaction_service::create_transaction(
        credential_id,
        body.category,
        body.description,
        decimal_value,
        body.timestamp.naive_utc(),
    )
    .map_err(|_| Error::Unexpected)
    .map(|transaction| (StatusCode::CREATED, Json(transaction)).into_response())
}

async fn put_transaction(
    Extension(credential_id): Extension<Uuid>,
    Path(transaction_id): Path<Uuid>,
    Json(body): Json<TransactionRequestBody>,
) -> Result<Response, Error> {
    let decimal_value =
        BigDecimal::from_str(&body.value.to_string()).map_err(|_| Error::Validation)?;

    transaction_service::update_transaction(
        transaction_id,
        credential_id,
        body.category,
        body.description,
        decimal_value,
        body.timestamp.naive_utc(),
    )
    .map_err(|error| match error {
        ServiceError::NotFound => Error::NotFound,
        _ => Error::Unexpected,
    })
    .map(|transaction| (StatusCode::OK, Json(transaction)).into_response())
}

async fn delete_transaction(
    Extension(credential_id): Extension<Uuid>,
    Path(transaction_id): Path<Uuid>,
) -> Result<Response, Error> {
    transaction_service::delete_transaction(transaction_id, credential_id)
        .map_err(|error| match error {
            ServiceError::NotFound => Error::NotFound,
            _ => Error::Unexpected,
        })
        .map(|_| StatusCode::NO_CONTENT.into_response())
}
