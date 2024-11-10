package models

type DockerStats struct {
	Name      string
	Container string
	BlockIO   string
	CPUPerc   string
	MemPerc   string
	MemUsage  string
	NetIO     string
	PIDs      string
}
