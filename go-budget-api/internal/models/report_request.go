package models

import "time"

type ReportRequest struct {
	Category *string    `form:"category"`
	From     *time.Time `form:"from"`
	To       *time.Time `form:"to"`
}
