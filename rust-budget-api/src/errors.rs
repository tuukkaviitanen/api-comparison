use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

pub enum Error {
    // Authentication errors
    AuthHeaderMissingError,
    AuthHeaderWrongFormat,
    AuthHeaderInvalidBase64,
    AuthInvalidCredentialsFormat,
    AuthInvalidCredentials,
    // ValidationError,
    // NotFoundError,
    // UniqueError,
    UnexpectedError,
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Unexpected error"})),
        )
            .into_response()
    }
}
