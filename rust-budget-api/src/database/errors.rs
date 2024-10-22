#[derive(Debug)]
pub enum DatabaseError {
    ConnectionPoolMutexLockFailed,
    ConnectionPoolUninitialized,
    ConnectionFailed,
}
