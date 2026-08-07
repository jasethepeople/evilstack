package handlers

import (
	"encoding/json"
	"net/http"

	"evilstack/models"
)

var RuntimePort int = 0

func ConfigHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.Config{Port: RuntimePort, Version: "1.0.0"})
}
