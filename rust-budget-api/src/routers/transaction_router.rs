use std::str::FromStr;

use super::custom_validators::{
    validate_category, validate_order, validate_sort, validate_value_precision,
};
use crate::{
    errors::Error,
    middlewares::authenticate,
    services::{errors::ServiceError, transaction_service, TransactionFilters},
};
use axum::{
    extract::{Path, Query},
    http::StatusCode,
    middleware,
    response::{IntoResponse, Response},
    routing::{delete, get, post, put},
    Extension, Json, Router,
};
use axum_extra::extract::WithRejection;
use bigdecimal::BigDecimal;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

pub fn routes() -> Router {
    Router::new()
        .route("/", get(get_transactions))
        .route("/:transactionId", get(get_single_transaction))
        .route("/", post(post_transaction))
        .route("/:transactionId", put(put_transaction))
        .route("/:transactionId", delete(delete_transaction))
        .route_layer(middleware::from_fn(authenticate))
}

#[derive(Deserialize, Validate)]
struct GetTransactionsQueryParams {
    #[validate(custom(function = "validate_category", message = "invalid category"))]
    category: Option<String>,
    from: Option<DateTime<Utc>>,
    to: Option<DateTime<Utc>>,
    #[serde(default = "default_sort")]
    #[validate(custom(function = "validate_sort", message = "invalid sort"))]
    sort: String,
    #[serde(default = "default_order")]
    #[validate(custom(function = "validate_order", message = "invalid order"))]
    order: String,
    #[serde(default = "default_skip")]
    #[validate(range(min = 0))]
    skip: u32,
    #[serde(default = "default_limit")]
    #[validate(range(min = 1))]
    limit: u32,
}

fn default_sort() -> String {
    "timestamp".to_string()
}

fn default_order() -> String {
    "desc".to_string()
}

fn default_skip() -> u32 {
    0
}

fn default_limit() -> u32 {
    10
}

async fn get_transactions(
    Extension(credential_id): Extension<Uuid>,
    WithRejection(Query(query), _): WithRejection<Query<GetTransactionsQueryParams>, Error>,
) -> Result<Response, Error> {
    let category_lowercase = query.category.map(|c| c.to_lowercase());
    let from_naive = query.from.map(|dt| dt.naive_utc());
    let to_naive = query.to.map(|dt| dt.naive_utc());
    let sort_lowercase = query.sort.to_lowercase();
    let order_lowercase = query.order.to_lowercase();

    transaction_service::get_transactions(
        credential_id,
        TransactionFilters::new(category_lowercase, from_naive, to_naive),
        sort_lowercase,
        order_lowercase,
        query.skip,
        query.limit,
    )
    .map_err(|_| Error::Unexpected)
    .map(|transactions| (StatusCode::OK, Json(transactions)).into_response())
}

async fn get_single_transaction(
    Extension(credential_id): Extension<Uuid>,
    WithRejection(Path(transaction_id), _): WithRejection<Path<Uuid>, Error>,
) -> Result<Response, Error> {
    transaction_service::get_single_transaction(transaction_id, credential_id)
        .map_err(|error| match error {
            ServiceError::NotFound => Error::NotFound,
            _ => Error::Unexpected,
        })
        .map(|transaction| (StatusCode::OK, Json(transaction)).into_response())
}

#[derive(Deserialize, Validate)]
struct TransactionRequestBody {
    #[validate(custom(function = "validate_category", message = "invalid category"))]
    pub category: String,
    #[validate(length(min = 4, max = 200))]
    pub description: String,
    #[validate(range(min = -1_000_000_000.0, max = 1_000_000_000.0))]
    #[validate(custom(
        function = "validate_value_precision",
        message = "invalid value precision"
    ))]
    pub value: f64,
    pub timestamp: DateTime<Utc>,
}

async fn post_transaction(
    Extension(credential_id): Extension<Uuid>,
    WithRejection(Json(body), _): WithRejection<Json<TransactionRequestBody>, Error>,
) -> Result<Response, Error> {
    // Parsing from float causes floating point errors
    let decimal_value = BigDecimal::from_str(&body.value.to_string())
        .map_err(|_| Error::Validation("Invalid value".to_string()))?;

    transaction_service::create_transaction(
        credential_id,
        body.category.to_lowercase(),
        body.description,
        decimal_value,
        body.timestamp.naive_utc(),
    )
    .map_err(|_| Error::Unexpected)
    .map(|transaction| (StatusCode::CREATED, Json(transaction)).into_response())
}

async fn put_transaction(
    Extension(credential_id): Extension<Uuid>,
    WithRejection(Path(transaction_id), _): WithRejection<Path<Uuid>, Error>,
    WithRejection(Json(body), _): WithRejection<Json<TransactionRequestBody>, Error>,
) -> Result<Response, Error> {
    let decimal_value = BigDecimal::from_str(&body.value.to_string())
        .map_err(|_| Error::Validation("Invalid value".to_string()))?;

    transaction_service::update_transaction(
        transaction_id,
        credential_id,
        body.category.to_lowercase(),
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
    WithRejection(Path(transaction_id), _): WithRejection<Path<Uuid>, Error>,
) -> Result<Response, Error> {
    transaction_service::delete_transaction(transaction_id, credential_id)
        .map_err(|error| match error {
            ServiceError::NotFound => Error::NotFound,
            _ => Error::Unexpected,
        })
        .map(|_| StatusCode::NO_CONTENT.into_response())
}
