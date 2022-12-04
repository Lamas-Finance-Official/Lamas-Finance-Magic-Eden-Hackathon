FROM rust:1.64-slim-buster AS builder

RUN apt-get update -y
RUN apt-get install -y pkg-config openssl libssl-dev libmariadb-dev-compat libmariadb-dev

COPY ./src ./src
COPY ./Cargo.* ./

RUN cargo build --release

FROM debian:buster-slim

WORKDIR /app

RUN apt-get update -y
RUN apt-get install -y openssl libmariadb-dev-compat libmariadb-dev

COPY --from=builder ./target/release/vrf-server ./vrf-server

COPY ./migrations ./migrations
COPY ./vrf-config.toml ./

CMD [ "./vrf-server" ]
