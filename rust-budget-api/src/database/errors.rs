#[derive(Debug)]
pub enum DatabaseError {
    PoolUninitialized,
    ConnectionFailed,
}
