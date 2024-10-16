package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Credential struct {
	gorm.Model

	Id uuid.UUID `gorm:"type:uuid;primary_key"`
	Username string `gorm:"type:varchar(50);unique"`
	Password string `gorm:"type:varchar(64)"`
}

func (b *Credential) BeforeCreate(tx *gorm.DB) (err error) {
	b.Id = uuid.New()
	return
   }