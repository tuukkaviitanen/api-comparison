pub mod errors;

use diesel::{
    r2d2::{ConnectionManager, Pool, PooledConnection},
    PgConnection,
};
use errors::DatabaseError;
use std::sync::Arc;
use tokio::sync::OnceCell;

pub type DbConnectionPool = Pool<ConnectionManager<PgConnection>>;
pub type DbConnection = PooledConnection<ConnectionManager<PgConnection>>;

static CONNECTION_POOL: OnceCell<Arc<DbConnectionPool>> = OnceCell::const_new();

pub fn initialize_connection_pool(database_url: String) {
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let pool = Pool::builder()
        .max_size(100)
        .min_idle(Some(5))
        .test_on_check_out(true)
        .build(manager)
        .expect("Could not build database connection pool");

    CONNECTION_POOL.set(Arc::new(pool)).unwrap();
}

pub fn get_connection() -> Result<DbConnection, DatabaseError> {
    let pool = CONNECTION_POOL
        .get()
        .ok_or(DatabaseError::PoolUninitialized)?;
    pool.get().map_err(|_| DatabaseError::ConnectionFailed)
}
