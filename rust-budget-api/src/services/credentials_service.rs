use crate::{database, models::Credential, schema::credentials::dsl::*};
use diesel::prelude::*;
use sha2::Digest;
use uuid::Uuid;

use super::errors::ServiceError;

pub fn get_credential_id(
    username_param: String,
    password_param: String,
) -> Result<Uuid, ServiceError> {
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

    return Ok(credential.id);
}

pub fn create_credential(
    username_param: String,
    password_param: String,
) -> Result<(), ServiceError> {
    let mut db_connection = database::get_connection().map_err(|error| {
        println!(
            "[create_credential] Database connection error occurred, {:#?}",
            error
        );
        ServiceError::DatabaseError
    })?;

    let password_hash_param = generate_password_hash(password_param);

    let new_credential = Credential {
        id: uuid::Uuid::new_v4(),
        username: username_param,
        password_hash: password_hash_param,
    };

    diesel::insert_into(credentials)
        .values(&new_credential)
        .execute(&mut db_connection)
        .map_err(|error| match error {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::UniqueViolation,
                _,
            ) => ServiceError::UniqueConstraintError,
            _ => {
                println!("[create_credential] Database query error, {:#?}", error);
                ServiceError::DatabaseError
            }
        })?;

    return Ok(());
}

pub fn delete_credential(id_param: Uuid) -> Result<(), ServiceError> {
    let mut db_connection = database::get_connection().map_err(|error| {
        println!(
            "[delete_credential] Database connection error occurred, {:#?}",
            error
        );
        ServiceError::DatabaseError
    })?;

    let affected_rows = diesel::delete(credentials.filter(id.eq(id_param)))
        .execute(&mut db_connection)
        .map_err(|error| {
            println!("[delete_credential] Database query error, {:#?}", error);
            ServiceError::DatabaseError
        })?;

    if affected_rows == 0 {
        return Err(ServiceError::NotFoundError);
    }

    return Ok(());
}

fn generate_password_hash(password: String) -> String {
    let mut hasher = sha2::Sha256::new();

    hasher.update(password);

    let result = hasher.finalize();

    format!("{:x}", result)
}
