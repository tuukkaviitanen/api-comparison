use axum::{http::StatusCode, routing::get, Router};

pub fn routes() -> Router {
    Router::new().route("/", get(|| async { StatusCode::OK }))
}
