use axum::{
    debug_handler,
    extract::Query,
    http::StatusCode,
    middleware,
    response::{IntoResponse, Response},
    routing::get,
    Extension, Json, Router,
};
use chrono::{DateTime, Utc};
use serde::Deserialize;
use uuid::Uuid;

use crate::{errors::Error, middlewares, services::report_service};

pub fn routes() -> Router {
    Router::new()
        .route("/", get(get_report))
        .route_layer(middleware::from_fn(middlewares::authenticate))
}

#[derive(Deserialize)]
struct ReportQueryParams {
    category: Option<String>,
    from: Option<DateTime<Utc>>,
    to: Option<DateTime<Utc>>,
}

#[debug_handler]
async fn get_report(
    Extension(credential_id): Extension<Uuid>,
    Query(query): Query<ReportQueryParams>,
) -> Result<Response, Error> {
    let from_naive = query.from.map(|dt| dt.naive_utc());
    let to_naive = query.to.map(|dt| dt.naive_utc());

    let report = report_service::get_report(credential_id, query.category, from_naive, to_naive)
        .map_err(|_| Error::Unexpected)?;

    Ok((StatusCode::OK, Json(report)).into_response())
}
