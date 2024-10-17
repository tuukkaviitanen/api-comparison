-- Rename a column from "password" to "password_hash"
ALTER TABLE "public"."credentials" RENAME COLUMN "password" TO "password_hash";
