package models

import "time"

type GetTransactionQuery struct {
	Category *string    `form:"category"`
	From     *time.Time `form:"from"`
	To       *time.Time `form:"to"`
	Sort     string     `form:"sort,default=timestamp"`
	Order    string     `form:"order,default=desc"`
	Limit    int        `form:"limit,default=10"`
	Skip     int        `form:"skip,default=0"`
}
