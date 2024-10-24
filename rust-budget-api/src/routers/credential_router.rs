use crate::errors::Error;
use crate::middlewares::authenticate;
use crate::services::credentials_service;
use crate::services::errors::ServiceError;
use axum::{
    debug_handler,
    http::StatusCode,
    middleware,
    response::{IntoResponse, Response},
    routing::{delete, post},
    Extension, Json, Router,
};
use axum_extra::extract::WithRejection;
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

pub fn routes() -> Router {
    Router::new().route("/", post(post_credential)).route(
        "/",
        delete(delete_credential).route_layer(middleware::from_fn(authenticate)),
    )
}

#[derive(Deserialize, Validate)]
struct CredentialRequestBody {
    #[validate(length(min = 4, max = 50))]
    username: String,
    #[validate(length(min = 8, max = 50))]
    password: String,
}

#[debug_handler]
async fn post_credential(
    WithRejection(Json(json_body), _): WithRejection<Json<CredentialRequestBody>, Error>,
) -> Result<Response, Error> {
    json_body
        .validate()
        .map_err(|error| Error::Validation(error.to_string()))?;

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
