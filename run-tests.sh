#!/bin/sh
# Sequentially runs all API load tests and records the results to InfluxDB

# Start InfluxDB and Grafana
docker compose -f ./graphs/docker-compose.yaml up -d

# Start recording Docker stats
docker compose -f ./docker-stats-recorder/docker-compose.yaml up --build --wait

# Node

## Start API
docker compose -f ./node-budget-api/docker-compose.yaml up --build --wait

## Run tests
docker compose -f ./k6/docker-compose-load.yaml up --build

## Stop API
docker compose -f ./node-budget-api/docker-compose.yaml down -v

# Bun

## Start API
docker compose -f ./bun-budget-api/docker-compose.yaml up --build --wait

## Run tests
docker compose -f ./k6/docker-compose-load.yaml up --build

## Stop API
docker compose -f ./bun-budget-api/docker-compose.yaml down -v

# C#

## Start API
docker compose -f ./cs-budget-api/docker-compose.yaml up --build --wait

## Run tests
docker compose -f ./k6/docker-compose-load.yaml up --build

## Stop API
docker compose -f ./cs-budget-api/docker-compose.yaml down -v

# Go

## Start API
docker compose -f ./go-budget-api/docker-compose.yaml up --build --wait

## Run tests
docker compose -f ./k6/docker-compose-load.yaml up --build

## Stop API
docker compose -f ./go-budget-api/docker-compose.yaml down -v

# Rust

## Start API
docker compose -f ./rust-budget-api/docker-compose.yaml up --build --wait

## Run tests
docker compose -f ./k6/docker-compose-load.yaml up --build

## Stop API
docker compose -f ./rust-budget-api/docker-compose.yaml down -v

# Stop recording Docker stats
docker compose -f ./docker-stats-recorder/docker-compose.yaml down

# Stop InfluxDB and Grafana
docker compose -f ./graphs/docker-compose.yaml down