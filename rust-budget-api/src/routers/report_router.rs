use axum::{http::StatusCode, middleware, routing::get, Router};

use crate::middlewares;

pub fn routes() -> Router {
    Router::new()
        .route("/", get(|| async { StatusCode::OK }))
        .route_layer(middleware::from_fn(middlewares::authenticate))
}
