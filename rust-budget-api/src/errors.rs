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
    NotFoundError,
    UniqueError,
    UnexpectedError,
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let (status_code, error_message) = parse_error(self);

        (status_code, Json(json!({"error": error_message}))).into_response()
    }
}

fn parse_error(error: Error) -> (StatusCode, String) {
    use Error::*;

    const AUTH_ERROR_PREFIX: &str = "Authentication error:";

    match error {
        AuthHeaderInvalidBase64 => (
            StatusCode::UNAUTHORIZED,
            format!("{} Invalid base64", AUTH_ERROR_PREFIX),
        ),
        AuthHeaderMissingError => (
            StatusCode::UNAUTHORIZED,
            format!("{} Authorization header missing", AUTH_ERROR_PREFIX),
        ),
        AuthHeaderWrongFormat => (
            StatusCode::UNAUTHORIZED,
            format!("{} Authorization header wrong format", AUTH_ERROR_PREFIX),
        ),
        AuthInvalidCredentials => (
            StatusCode::UNAUTHORIZED,
            format!("{} Invalid credentials", AUTH_ERROR_PREFIX),
        ),
        AuthInvalidCredentialsFormat => (
            StatusCode::BAD_REQUEST,
            format!("{} Invalid credentials format", AUTH_ERROR_PREFIX),
        ),
        UniqueError => (
            StatusCode::BAD_REQUEST,
            format!("Unique constraint error occurred"),
        ),
        NotFoundError => (StatusCode::NOT_FOUND, format!("Resource not found")),
        UnexpectedError => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Unexpected error occurred"),
        ),
    }
}
