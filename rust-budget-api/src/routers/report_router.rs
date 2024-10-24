use super::custom_validators::validate_category;
use axum::{
    debug_handler,
    extract::Query,
    http::StatusCode,
    middleware,
    response::{IntoResponse, Response},
    routing::get,
    Extension, Json, Router,
};
use axum_extra::extract::WithRejection;
use chrono::{DateTime, Utc};
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

use crate::{
    errors::Error,
    middlewares,
    services::{report_service, TransactionFilters},
};

pub fn routes() -> Router {
    Router::new()
        .route("/", get(get_report))
        .route_layer(middleware::from_fn(middlewares::authenticate))
}

#[derive(Deserialize, Validate)]
struct ReportQueryParams {
    #[validate(custom(function = "validate_category", message = "invalid category"))]
    category: Option<String>,
    from: Option<DateTime<Utc>>,
    to: Option<DateTime<Utc>>,
}

#[debug_handler]
async fn get_report(
    Extension(credential_id): Extension<Uuid>,
    WithRejection(Query(query), _): WithRejection<Query<ReportQueryParams>, Error>,
) -> Result<Response, Error> {
    query
        .validate()
        .map_err(|error| Error::Validation(error.to_string()))?;

    let from_naive = query.from.map(|dt| dt.naive_utc());
    let to_naive = query.to.map(|dt| dt.naive_utc());

    let report = report_service::get_report(
        credential_id,
        TransactionFilters::new(query.category, from_naive, to_naive),
    )
    .map_err(|_| Error::Unexpected)?;

    Ok((StatusCode::OK, Json(report)).into_response())
}
