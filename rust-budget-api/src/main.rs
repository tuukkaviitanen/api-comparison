mod router;
use std::env;

use diesel::{Connection, PgConnection};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let port = env::var("PORT").unwrap_or(String::from("8080"));

    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url));

    let app = router::app();

    let address = format!("0.0.0.0:{}", port);

    println!("Starting listening to {}", address);

    let listener = TcpListener::bind(address).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
