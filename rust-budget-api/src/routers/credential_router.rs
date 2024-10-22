use crate::errors::Error;
use crate::middlewares::authenticate;
use crate::services::credentials_service;
use crate::services::errors::ServiceError;
use axum::{
    http::StatusCode,
    middleware,
    response::{IntoResponse, Response},
    routing::{delete, post},
    Extension, Json, Router,
};
use uuid::Uuid;

pub fn routes() -> Router {
    Router::new().route("/", post(post_credential)).route(
        "/",
        delete(delete_credential).route_layer(middleware::from_fn(authenticate)),
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
            ServiceError::UniqueConstraint => Error::UniqueConstraint,
            _ => Error::Unexpected,
        })
        .map(|_| (StatusCode::NO_CONTENT).into_response())
}

async fn delete_credential(Extension(credential_id): Extension<Uuid>) -> Result<Response, Error> {
    credentials_service::delete_credential(credential_id)
        .map_err(|error| match error {
            ServiceError::NotFound => Error::NotFound,
            _ => Error::Unexpected,
        })
        .map(|_| (StatusCode::NO_CONTENT).into_response())
}
