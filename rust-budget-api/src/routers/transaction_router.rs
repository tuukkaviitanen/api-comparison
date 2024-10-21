use axum::{
    http::StatusCode,
    routing::{delete, get, post, put},
    Router,
};

pub fn routes() -> Router {
    Router::new()
        .route("/", get(|| async { StatusCode::OK }))
        .route("/:transactionId", get(|| async { StatusCode::OK }))
        .route("/", post(|| async { StatusCode::CREATED }))
        .route("/:transactionId", put(|| async { StatusCode::OK }))
        .route(
            "/:transactionId",
            delete(|| async { StatusCode::NO_CONTENT }),
        )
}
