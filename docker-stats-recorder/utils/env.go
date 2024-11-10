package utils

import "os"

var InfluxAddr = os.Getenv("INFLUX_URL")
var InfluxDb = os.Getenv("INFLUX_DB")
