package simulator

import (
	"math"
	"math/rand"
	"time"

	"evilstack/handlers"
	"evilstack/models"
)

func randFloat(min, max float64) float64 {
	return min + rand.Float64()*(max-min)
}

func randInt(min, max int) int {
	return min + rand.Intn(max-min+1)
}

func StartTelemetrySimulator() {
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		t := float64(time.Now().Unix()) / 10.0

		snapshot := models.TelemetrySnapshot{
			Timestamp:       time.Now().Unix(),
			CPU:             20.0 + 30.0*math.Sin(t) + randFloat(0, 10),
			Memory:          40.0 + 20.0*math.Sin(t*0.7) + randFloat(0, 8),
			Goroutines:      15 + randInt(0, 25),
			Requests:        handlers.GetRequestCount(),
			TokensPerSecond: 800.0 + 400.0*math.Sin(t*1.3) + randFloat(0, 200),
		}

		select {
		case handlers.TelemetryChan <- snapshot:
		default:
		}

		handlers.AddLog("INFO", "telemetry tick")
	}
}
