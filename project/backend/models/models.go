package models

import "time"

type TelemetrySnapshot struct {
	Timestamp       int64   `json:"timestamp"`
	CPU             float64 `json:"cpu"`
	Memory          float64 `json:"memory"`
	Goroutines      int     `json:"goroutines"`
	Requests        int64   `json:"requests"`
	TokensPerSecond float64 `json:"tokensPerSecond"`
}

type Task struct {
	ID          string                 `json:"id"`
	Type        string                 `json:"type"` // analysis|generation|refactor|deploy
	Payload     map[string]interface{} `json:"payload"`
	Status      string                 `json:"status"` // pending|running|completed|failed
	Agent       string                 `json:"agent"`
	CreatedAt   time.Time              `json:"createdAt"`
	StartedAt   *time.Time             `json:"startedAt,omitempty"`
	CompletedAt *time.Time             `json:"completedAt,omitempty"`
}

type Agent struct {
	Name           string  `json:"name"`
	Status         string  `json:"status"` // idle|processing|error
	CurrentTask    string  `json:"currentTask"`
	ProcessedCount int     `json:"processedCount"`
	AvgLatencyMs   float64 `json:"avgLatencyMs"`
}

type Config struct {
	Port    int    `json:"port"`
	Version string `json:"version"`
}

type LogEntry struct {
	Timestamp time.Time `json:"timestamp"`
	Level     string    `json:"level"`   // INFO|WARN|ERROR
	Message   string    `json:"message"`
}
