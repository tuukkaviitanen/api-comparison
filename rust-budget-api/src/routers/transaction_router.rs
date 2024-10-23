use std::str::FromStr;

use crate::{errors::Error, middlewares::authenticate, services::transaction_service};
use axum::{
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
        .route("/:transactionId", get(|| async { StatusCode::OK }))
        .route("/", post(post_transaction))
        .route("/:transactionId", put(|| async { StatusCode::OK }))
        .route(
            "/:transactionId",
            delete(|| async { StatusCode::NO_CONTENT }),
        )
        .route_layer(middleware::from_fn(authenticate))
}

async fn get_transactions(Extension(credential_id): Extension<Uuid>) -> Result<Response, Error> {
    transaction_service::get_transactions(credential_id)
        .map_err(|error| match error {
            _ => Error::Unexpected,
        })
        .map(|transactions| (StatusCode::OK, Json(transactions)).into_response())
}

#[derive(Deserialize)]
struct PostTransactionBody {
    pub category: String,
    pub description: String,
    pub value: f64,
    pub timestamp: DateTime<Utc>,
}

async fn post_transaction(
    Extension(credential_id): Extension<Uuid>,
    Json(body): Json<PostTransactionBody>,
) -> Result<Response, Error> {
    println!("This is the value: {}", body.value);

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
    .map_err(|error| match error {
        _ => Error::Unexpected,
    })
    .map(|transaction| (StatusCode::CREATED, Json(transaction)).into_response())
}
