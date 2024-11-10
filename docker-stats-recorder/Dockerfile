FROM golang:1.23.2 AS build-stage

WORKDIR /usr/src/app

COPY . .

RUN go mod download

ENV CGO_ENABLED=0
ENV GOOS=linux

RUN go build main.go

# Final image

FROM debian:bullseye-slim

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get -y install docker.io

COPY --from=build-stage /usr/src/app/main .

VOLUME ["/var/run/docker.sock"]

CMD ["./main"]
