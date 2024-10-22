use crate::errors::Error;
use crate::services::errors::ServiceError;
use axum::{extract::Request, http::HeaderMap, middleware::Next, response::Response};
use base64::Engine;
use lazy_regex::regex_captures;

pub async fn authenticate(mut request: Request, next: Next) -> Result<Response, Error> {
    let headers = request.headers();

    let authorization_header = read_auth_header(headers)?;

    let encoded_auth_string = parse_basic_auth_header(authorization_header)?;

    let decoded_auth_string = decode_base64(encoded_auth_string)?;

    let (username, password) = parse_credentials(decoded_auth_string)?;

    let credential_id = crate::services::credentials_service::get_credential_id(username, password)
        .map_err(|error| match error {
            ServiceError::NotFoundError => Error::AuthInvalidCredentials,
            ServiceError::DatabaseConnectionFailed => Error::UnexpectedError,
        })?;

    request.extensions_mut().insert(credential_id);

    Ok(next.run(request).await)
}

fn read_auth_header(headers: &HeaderMap) -> Result<String, Error> {
    headers
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string())
        .ok_or_else(|| Error::AuthHeaderMissingError)
}

fn parse_basic_auth_header(header: String) -> Result<String, Error> {
    let (_whole, auth_string) =
        regex_captures!(r#"^basic (.+)"#i, &header).ok_or(Error::AuthHeaderWrongFormat)?;

    return Ok(auth_string.to_string());
}

fn decode_base64(base64_string: String) -> Result<String, Error> {
    base64::prelude::BASE64_STANDARD
        .decode(base64_string)
        .ok()
        .and_then(|bytes| String::from_utf8(bytes).ok())
        .ok_or_else(|| Error::AuthHeaderInvalidBase64)
}

fn parse_credentials(auth_string: String) -> Result<(String, String), Error> {
    let (_whole, username, password) =
        regex_captures!(r#"(.+):(.+)"#, &auth_string).ok_or(Error::AuthInvalidCredentialsFormat)?;

    return Ok((username.to_string(), password.to_string()));
}
