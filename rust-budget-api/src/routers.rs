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
