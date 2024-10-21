// @generated automatically by Diesel CLI.

diesel::table! {
    credentials (id) {
        id -> Uuid,
        #[max_length = 50]
        username -> Varchar,
        #[max_length = 64]
        password_hash -> Varchar,
    }
}

diesel::table! {
    transactions (id) {
        id -> Uuid,
        #[max_length = 50]
        category -> Varchar,
        #[max_length = 200]
        description -> Varchar,
        value -> Numeric,
        timestamp -> Timestamp,
        credential_id -> Uuid,
    }
}

diesel::joinable!(transactions -> credentials (credential_id));

diesel::allow_tables_to_appear_in_same_query!(
    credentials,
    transactions,
);
