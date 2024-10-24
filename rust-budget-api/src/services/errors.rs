#[derive(Debug)]
pub enum ServiceError {
    Database,
    NotFound,
    UniqueConstraint,
    Conversion,
}
