package models

import "time"

type ReportRequest struct {
	Category *string    `form:"category" filter:"lowercase" validate:"in:health,recreation,food & drinks,household & services,other,transport" message:"category is invalid"`
	From     *time.Time `form:"from"`
	To       *time.Time `form:"to"`
}
