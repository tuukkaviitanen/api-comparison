use axum::{
    http::StatusCode,
    routing::{delete, post},
    Router,
};

pub fn routes() -> Router {
    Router::new()
        .route("/", post(|| async { StatusCode::NO_CONTENT }))
        .route("/", delete(|| async { StatusCode::NO_CONTENT }))
}
