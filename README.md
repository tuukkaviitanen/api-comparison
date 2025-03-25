# A Comparison of Modern Programming Languages in REST API Development

> The source code for my thesis work

## Introduction

This repository includes the source code to all software developed in my thesis: A Comparative Analysis of Modern Programming Languages in REST API Development

The REST API described [in this OpenAPI document](docs/openapi.yaml), was implemented in 5 programming languages. The 5 implementations can be found in the following directories:

- [JavaScript/Node](node-budget-api/)
- [TypeScript/Bun](bun-budget-api/)
- [C#](cs-budget-api/)
- [Go](go-budget-api/)
- [Rust](rust-budget-api/)

The repository also includes the following directories:

- [k6](k6/)
  - Includes functional tests and 2 scenarios of load tests, all created with k6
- [graphs](graphs/)
  - Includes a docker compose file that runs an InfluxDB database and a Grafana instance for saving and monitoring the k6 load test results
- [docker-stats-recorder](docker-stats-recorder/)
  - Includes a Go application that uses the `docker stats` command to stream the Docker container resource usage statistics to the InfluxDB database
- [.github/workflows](.github/workflows/)
  - Includes the GitHub Actions workflows for each API implementation. The results from the workflows can be observed on the [Actions tab of the repository](https://github.com/tuukkaviitanen/api-comparison/actions).

## How to run the benchmark yourself?

Every implementation and the testing setup can be run on Linux with just [Docker](https://www.docker.com/) installed.

For running the load tests yourself, there are shell script files for both load test scenarios. Running the scripts will setup the whole testing environment, run the test scenario with each API implementation sequentially and remove the containers after it's done. The script files are here:

- [run-light-load-tests.sh](run-light-load-tests.sh)
- [run-heavy-load-tests.sh](run-heavy-load-tests.sh)

After one or more scenario is run, the results can be observed with Grafana, by running [the docker compose file in the `graphs` directory](graphs/docker-compose.yaml), with the command `docker compose up -d` in the [`graphs` directory](graphs/). When it's running, you can visit http://localhost:3000/d/de99snpakkwzke/budget-api-comparison to observe the results.

The graphs containers can be stopped and removed with the command `docker compose down` in the [`graphs` directory](graphs/).
