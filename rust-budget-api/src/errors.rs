use axum::{
    extract::rejection::{JsonRejection, QueryRejection},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    // Authentication errors
    AuthHeaderMissing,
    AuthHeaderWrongFormat,
    AuthHeaderInvalidBase64,
    AuthInvalidCredentialsFormat,
    AuthInvalidCredentials,

    Validation(String),
    NotFound,
    UniqueConstraint,
    Unexpected,

    ValidationJson(#[from] JsonRejection),
    ValidationQuery(#[from] QueryRejection),
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
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
        Validation(message) => (
            StatusCode::BAD_REQUEST,
            format!("Validation error: {}", message),
        ),
        NotFound => (StatusCode::NOT_FOUND, "Resource not found".to_string()),
        Unexpected => (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Unexpected error occurred".to_string(),
        ),
        ValidationJson(json_rejection) => (StatusCode::BAD_REQUEST, json_rejection.body_text()),
        ValidationQuery(query_rejection) => (StatusCode::BAD_REQUEST, query_rejection.body_text()),
    }
}
