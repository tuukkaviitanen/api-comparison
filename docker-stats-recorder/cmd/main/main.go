package main

import (
	"bufio"
	"encoding/json"
	"log"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

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
	Name    string
	CPUPerc float64
	MemPerc float64
}

func main() {
	// Create docker stats command
	cmd := exec.Command("docker", "stats", "--format", "json")

	// Get the output pipe
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Fatalln("Error creating StdoutPipe:", err)
		return
	}

	// Start the command
	if err := cmd.Start(); err != nil {
		log.Fatalln("Error starting command:", err)
		return
	}

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		go handleStat(scanner.Text())
	}
}

// Define a regular expression to match ANSI escape codes
const ansiEscapePattern = `\x1b\[[0-9;]*[a-zA-Z]`

var ansiEscapeRegex = regexp.MustCompile(ansiEscapePattern)

func handleStat(jsonString string) {
	// Remove ANSI escape codes from the JSON string
	cleanedJsonStr := ansiEscapeRegex.ReplaceAllString(jsonString, "")

	// Define a variable to hold the parsed JSON data
	var data UnrefinedDockerStats

	// Parse the JSON string into the map
	if err := json.Unmarshal([]byte(cleanedJsonStr), &data); err != nil {
		log.Fatalf("Error parsing JSON: %s\n", err)
		return
	}

	parsedCPUPerc, cpuPercErr := parsePercentage(data.CPUPerc)
	parsedMemPerc, memPercErr := parsePercentage(data.MemPerc)

	if cpuPercErr != nil {
		log.Printf("Error parsing CPU percentage: %s\n", cpuPercErr)
		return
	}

	if memPercErr != nil {
		log.Printf("Error parsing Memory percentage: %s\n", memPercErr)
		return
	}

	refinedData := RefinedDockerStats{Name: data.Name, CPUPerc: parsedCPUPerc, MemPerc: parsedMemPerc}

	// Print the parsed data
	log.Printf("Refined data: %v\n", refinedData)
}

func parsePercentage(percentageStr string) (float64, error) {
	// Remove the '%' sign from the end of the string
	cleanedStr := strings.TrimSuffix(percentageStr, "%")

	// Parse the cleaned string to float64
	parsedFloat, err := strconv.ParseFloat(cleanedStr, 64)
	if err != nil {
		return 0, err
	}

	return parsedFloat, nil
}
