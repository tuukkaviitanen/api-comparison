package models

type Credential struct {
	Username string `validate:"required|string|min_len:4|max_len:50"`
	Password string `validate:"required|string|min_len:8|max_len:50"`
}
