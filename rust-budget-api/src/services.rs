pub mod errors;

pub mod credentials_service {
    use crate::{database, models::Credential, schema::credentials::dsl::*};
    use diesel::prelude::*;
    use sha2::Digest;

    use super::errors::ServiceError;

    pub fn get_credential_id(
        username_param: String,
        password_param: String,
    ) -> Result<String, ServiceError> {
        let mut db_connection = database::get_connection().map_err(|error| {
            println!(
                "[get_credential_id] Database connection error occurred, {:#?}",
                error
            );
            ServiceError::DatabaseError
        })?;

        let password_hash_param = generate_password_hash(password_param);

        let credential = credentials
            .filter(username.eq(username_param))
            .filter(password_hash.eq(password_hash_param))
            .first::<Credential>(&mut db_connection)
            .optional()
            .map_err(|error| {
                println!("[get_credential_id] Database query error, {:#?}", error);
                ServiceError::DatabaseError
            })?
            .ok_or_else(|| ServiceError::NotFoundError)?;

        return Ok(credential.id.to_string());
    }

    fn generate_password_hash(password: String) -> String {
        let mut hasher = sha2::Sha256::new();

        hasher.update(password);

        let result = hasher.finalize();

        format!("{:x}", result)
    }
}
