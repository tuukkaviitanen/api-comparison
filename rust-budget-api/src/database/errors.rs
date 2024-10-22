#[derive(Debug)]
pub enum DatabaseError {
    PoolMutexLockFailed,
    PoolUninitialized,
    ConnectionFailed,
}
