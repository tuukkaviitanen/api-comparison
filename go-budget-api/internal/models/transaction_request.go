package models

import "time"

type TransactionRequest struct {
	Id          string
	Category    string
	Description string
	Value       float32
	Timestamp   time.Time
}
