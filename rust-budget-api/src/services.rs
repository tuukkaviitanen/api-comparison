pub mod errors;

pub mod credentials_service {
    use crate::{database, models::Credential, schema::credentials::dsl::*};
    use diesel::prelude::*;

    use super::errors::ServiceError;

    pub fn get_credential_id(
        username_param: String,
        password_param: String,
    ) -> Result<String, ServiceError> {
        let mut db_connection =
            database::get_connection().map_err(|_| ServiceError::DatabaseConnectionFailed)?;

        let password_hash_param = password_param;

        let credential = credentials
            .filter(username.eq(username_param))
            .filter(password_hash.eq(password_hash_param))
            .first::<Credential>(&mut db_connection)
            .map_err(|_| ServiceError::NotFoundError)?;

        return Ok(credential.id.to_string());
    }
}
