# Go Budget API

## Local development dependencies

- Docker
    - For running lint tool, the server and the external services
- Go 1.23.2
    - For installing new dependencies
- AtlasGo CLI tool
    - For generating migrations
    - Only because the docker hosted version doesn't include Go

## Deployment dependencies

- Github action: actions/setup-go@v5
    - For installing Go 1.23.2 for running linter action and tests
- Github action: golangci/golangci-lint-action@v6
    - For running the linter
- Docker
    - Runs testing environment
- Github action: grafana/setup-k6-action@v1
    - For setting up k6 for functional API tests

## Production dependencies

- Docker
    - Runs everything
