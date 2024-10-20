use axum::{http::StatusCode, routing::get, Router};

pub fn routes() -> Router {
    return Router::new().route("/", get(|| async { StatusCode::OK }));
}
