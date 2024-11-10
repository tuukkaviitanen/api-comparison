package database

import (
	"docker-stats-recorder/models"
	"docker-stats-recorder/utils"
	"fmt"

	_ "github.com/influxdata/influxdb1-client" // this is important because of the bug in go mod
	client "github.com/influxdata/influxdb1-client/v2"
)

func SaveToInflux(stats models.RefinedDockerStats) {
	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr: utils.InfluxAddr,
	})

	if err != nil {
		fmt.Println("Error creating InfluxDB Client: ", err.Error())
	}

	defer c.Close()

	bp, err := client.NewBatchPoints(client.BatchPointsConfig{
		Database:  utils.InfluxDb,
		Precision: "s",
	})

	if err != nil {
		fmt.Println("Error creating batch points: ", err.Error())
		return
	}

	tags := map[string]string{"container_name": stats.Name}
	fields := map[string]interface{}{
		"cpu_percentage":    stats.CPUPerc,
		"memory_percentage": stats.MemPerc,
	}

	pt, err := client.NewPoint("docker_stats", tags, fields, stats.Timestamp)
	if err != nil {
		fmt.Println("Error creating point: ", err.Error())
		return
	}

	bp.AddPoint(pt)

	if err := c.Write(bp); err != nil {
		fmt.Println("Error writing batch points: ", err.Error())
	}
}
