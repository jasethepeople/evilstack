package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"evilstack/models"
)

var TelemetryChan = make(chan models.TelemetrySnapshot, 10)

func TelemetryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming not supported", http.StatusInternalServerError)
		return
	}

	for {
		select {
		case snapshot := <-TelemetryChan:
			data, err := json.Marshal(snapshot)
			if err != nil {
				continue
			}
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		case <-r.Context().Done():
			return
		}
	}
}
