package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Transaction struct {
	Id uuid.UUID `gorm:"type:uuid;primary_key"`
	Category string `gorm:"type:varchar(50);NOT NULL"`
	Description string `gorm:"type:varchar(200);NOT NULL"`
	Value float32 `gorm:"type:decimal;NOT NULL"`
	Timestamp time.Time `gorm:"type:timestamp(3);NOT NULL"`
	Credential Credential `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CredentialId uuid.UUID `gorm:"NOT NULL"`
}

func (t *Transaction) BeforeCreate(tx *gorm.DB) (err error) {
	t.Id = uuid.New()
	return
   }
