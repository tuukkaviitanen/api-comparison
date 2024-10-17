package entities

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Credential struct {
	Id           string `gorm:"type:uuid;primary_key"`
	Username     string `gorm:"type:varchar(50);unique;NOT NULL"`
	PasswordHash string `gorm:"type:varchar(64);NOT NULL"`
}

func (c *Credential) BeforeCreate(tx *gorm.DB) (err error) {
	c.Id = uuid.New().String()
	return
}
