package models

import "time"

type UnrefinedDockerStats struct {
	Name      string
	Container string
	BlockIO   string
	CPUPerc   string
	MemPerc   string
	MemUsage  string
	NetIO     string
	PIDs      string
}

type RefinedDockerStats struct {
	Name      string
	CPUPerc   float64
	MemPerc   float64
	Timestamp time.Time
}
