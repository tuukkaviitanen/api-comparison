package models

import (
	"encoding/json"
	"time"
)

type ProcessedTransaction struct {
	Id          string    `json:"id"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	Value       float64   `json:"value"`
	Timestamp   time.Time `json:"timestamp"`
}

func (u *ProcessedTransaction) MarshalJSON() ([]byte, error) {
	return json.Marshal(&struct {
		Id          string  `json:"id"`
		Category    string  `json:"category"`
		Description string  `json:"description"`
		Value       float64 `json:"value"`
		Timestamp   string  `json:"timestamp"`
	}{
		Id:          u.Id,
		Category:    u.Category,
		Description: u.Description,
		Value:       u.Value,
		Timestamp:   u.Timestamp.Format("2006-01-02T15:04:05.000Z"),
	})
}
