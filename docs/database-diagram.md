# Budget Tracking API database schema

```mermaid
erDiagram

Credentials {
    uuid id PK
    varchar(50) username
    varchar(50) passwordHash
}

Transactions {
    uuid id PK
    varchar(50) userId FK
    varchar(50) category
    varchar(200) description
    decimal value
    timestamp(3) timestamp
}

Credentials ||--|{ Transactions: has

```
