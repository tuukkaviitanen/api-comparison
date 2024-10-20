mod router;

use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let app = router::app();

    let listener = TcpListener::bind("0.0.0.0:8080").await.unwrap();

    axum::serve(listener, app).await.unwrap();
}
