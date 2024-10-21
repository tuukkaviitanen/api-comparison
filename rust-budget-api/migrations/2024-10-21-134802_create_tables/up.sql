CREATE TABLE credentials (
  "id" uuid NOT NULL,
  "username" varchar(50) NOT NULL,
  "password" varchar(64) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uni_credentials_username" UNIQUE ("username")
);

CREATE TABLE transactions (
  "id" uuid NOT NULL,
  "category" varchar(50) NOT NULL,
  "description" varchar(200) NOT NULL,
  "value" decimal NOT NULL,
  "timestamp" timestamp(3) NOT NULL,
  "credential_id" uuid NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_transactions_credential" FOREIGN KEY ("credential_id") REFERENCES credentials ("id") ON UPDATE CASCADE ON DELETE CASCADE
);
