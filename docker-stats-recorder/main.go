package main

import (
	"bufio"
	"docker-stats-recorder/database"
	"docker-stats-recorder/models"
	"docker-stats-recorder/utils"
	"encoding/json"
	"log"
	"os/exec"
	"regexp"
	"time"
)

func main() {
	// Create docker stats command
	cmd := exec.Command("docker", "stats", "--format", "{{json .}}")

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
	var data models.UnrefinedDockerStats

	// Parse the JSON string into the map
	if err := json.Unmarshal([]byte(cleanedJsonStr), &data); err != nil {
		log.Fatalf("Error parsing JSON text '%s': %s\n", cleanedJsonStr, err)
		return
	}

	parsedCPUPerc, cpuPercErr := utils.ParsePercentage(data.CPUPerc)
	parsedMemPerc, memPercErr := utils.ParsePercentage(data.MemPerc)

	if cpuPercErr != nil {
		log.Printf("Error parsing CPU percentage: %s\n", cpuPercErr)
		return
	}

	if memPercErr != nil {
		log.Printf("Error parsing Memory percentage: %s\n", memPercErr)
		return
	}

	timestamp := time.Now().UTC()

	refinedData := models.RefinedDockerStats{Name: data.Name, CPUPerc: parsedCPUPerc, MemPerc: parsedMemPerc, Timestamp: timestamp}

	database.SaveToInflux(refinedData)

	// Print the parsed data
	log.Printf("Refined data saved: %v\n", refinedData)
}
