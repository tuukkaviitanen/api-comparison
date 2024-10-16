package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Credential struct {
	Id uuid.UUID `gorm:"type:uuid;primary_key"`
	Username string `gorm:"type:varchar(50);unique;NOT NULL"`
	Password string `gorm:"type:varchar(64);NOT NULL"`
}

func (c *Credential) BeforeCreate(tx *gorm.DB) (err error) {
	c.Id = uuid.New()
	return
   }
