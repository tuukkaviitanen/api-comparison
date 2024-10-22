#[derive(Debug)]
pub enum DatabaseError {
    DatabaseConnectionPoolMutexLockFailed,
    DatabaseConnectionPoolUninitialized,
    DatabaseConnectionFailed,
}
