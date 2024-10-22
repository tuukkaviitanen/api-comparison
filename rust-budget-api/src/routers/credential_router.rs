use crate::errors::Error;
use crate::middlewares::authenticate;
use crate::services::credentials_service;
use crate::services::errors::ServiceError;
use axum::{
    http::StatusCode,
    middleware,
    response::{IntoResponse, Response},
    routing::{delete, post},
    Json, Router,
};

pub fn routes() -> Router {
    Router::new().route("/", post(post_credential)).route(
        "/",
        delete(|| async { StatusCode::NO_CONTENT }).route_layer(middleware::from_fn(authenticate)),
    )
}

#[derive(serde::Deserialize)]
struct CredentialRequestBody {
    username: String,
    password: String,
}

async fn post_credential(Json(json_body): Json<CredentialRequestBody>) -> Result<Response, Error> {
    credentials_service::create_credential(json_body.username, json_body.password)
        .map_err(|error| match error {
            ServiceError::UniqueConstraintError => Error::UniqueError,
            _ => Error::UnexpectedError,
        })
        .map(|_| (StatusCode::NO_CONTENT).into_response())
}
