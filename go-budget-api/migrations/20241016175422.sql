-- Create "credentials" table
CREATE TABLE "public"."credentials" (
  "id" uuid NOT NULL,
  "username" character varying(50) NOT NULL,
  "password" character varying(64) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "uni_credentials_username" UNIQUE ("username")
);
-- Create "transactions" table
CREATE TABLE "public"."transactions" (
  "id" uuid NOT NULL,
  "category" character varying(50) NOT NULL,
  "description" character varying(200) NOT NULL,
  "value" numeric NOT NULL,
  "timestamp" timestamp(3) NOT NULL,
  "credential_id" uuid NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_transactions_credential" FOREIGN KEY ("credential_id") REFERENCES "public"."credentials" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);
