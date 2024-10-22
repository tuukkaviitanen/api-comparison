use crate::middlewares::authenticate;
use axum::{
    http::StatusCode,
    middleware,
    routing::{delete, post},
    Router,
};

pub fn routes() -> Router {
    Router::new()
        .route("/", post(|| async { StatusCode::NO_CONTENT }))
        .route(
            "/",
            delete(|| async { StatusCode::NO_CONTENT })
                .route_layer(middleware::from_fn(authenticate)),
        )
}
