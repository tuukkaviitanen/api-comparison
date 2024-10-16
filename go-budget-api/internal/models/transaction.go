package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Transaction struct {
	gorm.Model

	Id uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	Category string `gorm:"type:varchar(50);unique"`
	Description string `gorm:"type:varchar(200)"`
	Value float32 `gorm:"type:decimal"`
	Timestamp time.Time `gorm:"type:timestamp(3)"`
}