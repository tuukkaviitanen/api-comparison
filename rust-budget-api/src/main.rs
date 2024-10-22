mod database;
mod errors;
mod middlewares;
pub mod models;
mod routers;
pub mod schema;
mod services;

use database::initialize_connection_pool;
use std::env;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let port = env::var("PORT").unwrap_or(String::from("8080"));

    initialize_connection_pool(database_url);

    let app = routers::app();

    let address = format!("0.0.0.0:{}", port);

    println!("Starting listening to {}", address);

    let listener = TcpListener::bind(address).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
