package models

import "time"

type ProcessedTransaction struct {
	Id          string    `json:"id"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	Value       float32   `json:"value"`
	Timestamp   time.Time `json:"timestamp"`
}
