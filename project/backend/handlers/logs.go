package handlers

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"evilstack/models"
)

var Logs = make([]models.LogEntry, 0, 100)
var LogMutex sync.RWMutex

func AddLog(level, message string) {
	LogMutex.Lock()
	defer LogMutex.Unlock()

	entry := models.LogEntry{
		Timestamp: time.Now(),
		Level:     level,
		Message:   message,
	}

	if len(Logs) >= 100 {
		Logs = append(Logs[1:], entry)
	} else {
		Logs = append(Logs, entry)
	}
}

func ListLogsHandler(w http.ResponseWriter, r *http.Request) {
	LogMutex.RLock()
	defer LogMutex.RUnlock()

	start := 0
	if len(Logs) > 50 {
		start = len(Logs) - 50
	}
	recent := make([]models.LogEntry, len(Logs)-start)
	copy(recent, Logs[start:])

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recent)
}
