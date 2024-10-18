package models

import "time"

type GetTransactionQuery struct {
	Category *string    `form:"category" filter:"lowercase" validate:"in:health,recreation,food & drinks,household & services,other,transport" message:"category is invalid"`
	From     *time.Time `form:"from"`
	To       *time.Time `form:"to"`
	Sort     string     `form:"sort,default=timestamp" filter:"lowercase" validate:"in:category,timestamp" message:"invalid sort column"`
	Order    string     `form:"order,default=desc" filter:"lowercase" validate:"in:asc,desc" message:"invalid order"`
	Limit    int        `form:"limit,default=10" validate:"min:1"`
	Skip     int        `form:"skip,default=0" validate:"min:0"`
}
