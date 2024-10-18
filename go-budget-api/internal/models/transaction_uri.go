package models

type TransactionUri struct {
	TransactionId string `uri:"transactionId" validate:"uuid"`
}
