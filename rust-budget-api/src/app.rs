use axum::{routing::get, Router};

pub fn create_router() -> Router {
    return Router::new().route("/", get(|| async { "Hello world!" }));
}
