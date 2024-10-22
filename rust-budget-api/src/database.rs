mod errors;

use diesel::{
    r2d2::{ConnectionManager, Pool, PooledConnection},
    PgConnection,
};
use errors::DatabaseError;
use lazy_static::lazy_static;
use std::sync::Mutex;

pub type DbConnectionPool = Pool<ConnectionManager<PgConnection>>;
pub type DbConnection = PooledConnection<ConnectionManager<PgConnection>>;

lazy_static! {
    static ref CONNECTION_POOL: Mutex<Option<DbConnectionPool>> = Mutex::new(None);
}

pub fn initialize_connection_pool(database_url: String) {
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let pool = Pool::builder()
        .test_on_check_out(true)
        .build(manager)
        .expect("Could not build database connection pool");

    let mut context = CONNECTION_POOL.lock().unwrap();
    *context = Some(pool);
}

pub fn get_connection() -> Result<DbConnection, DatabaseError> {
    let pool = CONNECTION_POOL
        .lock()
        .map_err(|_| DatabaseError::DatabaseConnectionPoolMutexLockFailed)?;

    if let Some(pool) = &*pool {
        pool.get()
            .map_err(|_| DatabaseError::DatabaseConnectionFailed)
    } else {
        Err(DatabaseError::DatabaseConnectionPoolUninitialized)
    }
}
