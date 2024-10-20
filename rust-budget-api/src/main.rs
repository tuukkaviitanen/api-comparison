mod app;

use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let app = app::create_router();

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();

    axum::serve(listener, app).await.unwrap();
}
