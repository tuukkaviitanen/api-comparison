use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

pub enum Error {
    // Authentication errors
    AuthHeaderMissing,
    AuthHeaderWrongFormat,
    AuthHeaderInvalidBase64,
    AuthInvalidCredentialsFormat,
    AuthInvalidCredentials,
    Validation,
    NotFound,
    UniqueConstraint,
    Unexpected,
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
        AuthHeaderMissing => (
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
        UniqueConstraint => (
            StatusCode::BAD_REQUEST,
            "Unique constraint error occurred".to_string(),
        ),
        Validation => (StatusCode::BAD_REQUEST, "Validation error".to_string()),

        NotFound => (StatusCode::NOT_FOUND, "Resource not found".to_string()),
        Unexpected => (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Unexpected error occurred".to_string(),
        ),
    }
}
