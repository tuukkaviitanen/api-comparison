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
    UniqueError,
    UnexpectedError,
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": parse_error_message(self)})),
        )
            .into_response()
    }
}

fn parse_error_message(error: Error) -> String {
    use Error::*;

    const AUTH_ERROR_PREFIX: &str = "Authentication error:";

    match error {
        AuthHeaderInvalidBase64 => format!("{} Invalid base64", AUTH_ERROR_PREFIX),
        AuthHeaderMissingError => {
            format!("{} Authorization header missing", AUTH_ERROR_PREFIX)
        }
        AuthHeaderWrongFormat => {
            format!("{} Authorization header wrong format", AUTH_ERROR_PREFIX)
        }
        AuthInvalidCredentials => format!("{} Invalid credentials", AUTH_ERROR_PREFIX),
        AuthInvalidCredentialsFormat => {
            format!("{} Invalid credentials format", AUTH_ERROR_PREFIX)
        }
        UnexpectedError => format!("Unexpected error occurred"),
        UniqueError => format!("Unique constraint error occurred"),
    }
}
