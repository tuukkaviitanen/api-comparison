package models

import "time"

type TransactionRequest struct {
	Category    string    `filter:"lowercase" validate:"required|in:health,recreation,food & drinks,household & services,other,transport" message:"category is invalid"`
	Description string    `validate:"required|min_len:4|max_len:200"`
	Value       float64   `validate:"required|float|min:-1000000000|max:1000000000"`
	Timestamp   time.Time `validate:"required"`
}
