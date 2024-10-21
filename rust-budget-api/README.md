# Go Budget API

## Local development dependencies

- Task
  - For running complex commands with easier commands
- Docker
  - For running the server and the external services, for running database commands with diesel_cli
- rustup
  - For installing new dependencies and cargo cli tools, running the linter and formatter

## Diesel CLI setup

- Diesel CLI usually requires some tricky setup, including some database driver shared libraries
- I'm using `willsquire/diesel-cli` docker image to run the environment diesel CLI is run in, so none of this setup is needed
- I'm also using Taskfile, to simplify running the commands, so running diesel cli is done like this `task diesel -- <subcommands and flags>`
  - Example of initial setup commands: `task diesel -- --database-url=postgresql://user:password@postgres/budget_api setup`
