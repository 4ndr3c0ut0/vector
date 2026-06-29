FROM golang:1.23-alpine AS build

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o /bin/vector-api ./cmd/server

FROM alpine:3.20

WORKDIR /app
COPY --from=build /bin/vector-api /usr/local/bin/vector-api

ENV PORT=8080
EXPOSE 8080

CMD ["vector-api"]
