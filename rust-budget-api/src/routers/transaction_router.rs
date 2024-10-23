use crate::{errors::Error, middlewares::authenticate, services::transaction_service};
use axum::{
    http::StatusCode,
    middleware,
    response::{IntoResponse, Response},
    routing::{delete, get, post, put},
    Extension, Json, Router,
};
use uuid::Uuid;

pub fn routes() -> Router {
    Router::new()
        .route("/", get(get_transactions))
        .route("/:transactionId", get(|| async { StatusCode::OK }))
        .route("/", post(|| async { StatusCode::CREATED }))
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
