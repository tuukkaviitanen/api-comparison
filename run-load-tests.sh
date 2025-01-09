#!/bin/sh
# Sequentially runs all API load tests and records the results to InfluxDB

run_tests_for() {
  docker compose -f $1 up --build --wait

  docker compose -f ./k6/docker-compose-load.yaml up --build

  docker compose -f $1 down -v
}

# Start InfluxDB and Grafana
docker compose -f ./graphs/docker-compose.yaml up --wait

# Start recording Docker stats
docker compose -f ./docker-stats-recorder/docker-compose.yaml up --build --wait

run_tests_for ./node-budget-api/docker-compose.yaml

run_tests_for ./bun-budget-api/docker-compose.yaml

run_tests_for ./cs-budget-api/docker-compose.yaml

run_tests_for ./go-budget-api/docker-compose.yaml

run_tests_for ./rust-budget-api/docker-compose.yaml

# Stop recording Docker stats
docker compose -f ./docker-stats-recorder/docker-compose.yaml down

# Stop InfluxDB and Grafana
docker compose -f ./graphs/docker-compose.yaml down