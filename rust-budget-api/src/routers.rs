mod credential_router;
mod report_router;
mod transaction_router;

use axum::Router;
use tower_http::services::ServeFile;

pub fn app() -> Router {
    Router::new()
        .nest("/credentials", credential_router::routes())
        .nest("/reports", report_router::routes())
        .nest("/transactions", transaction_router::routes())
        .nest_service("/openapi.yaml", ServeFile::new("./openapi.yaml"))
}

mod custom_validators {
    use std::collections::HashSet;
    use validator::ValidationError;

    pub fn validate_category(category: &str) -> Result<(), ValidationError> {
        // Define a set of valid categories
        let valid_categories: HashSet<&str> = [
            "health",
            "recreation",
            "food & drinks",
            "household & services",
            "other",
            "transport",
        ]
        .iter()
        .cloned()
        .collect();

        // Check if the provided category is in the set of valid categories
        if valid_categories.contains(category.to_lowercase().as_str()) {
            Ok(())
        } else {
            Err(ValidationError::new("invalid category"))
        }
    }
}
