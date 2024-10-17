package services

import "errors"

var (
	ErrUnique   = errors.New("not unique")
	ErrNotFound = errors.New("not found")
)
