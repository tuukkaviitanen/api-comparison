use chrono::NaiveDateTime;

pub mod credentials_service;
pub mod errors;
pub mod report_service;
pub mod transaction_service;

pub struct TransactionFilters {
    category: Option<String>,
    from: Option<NaiveDateTime>,
    to: Option<NaiveDateTime>,
}

impl TransactionFilters {
    pub fn new(
        category: Option<String>,
        from: Option<NaiveDateTime>,
        to: Option<NaiveDateTime>,
    ) -> Self {
        TransactionFilters { category, from, to }
    }
}
