package handlers

import (
	"encoding/json"
	"net/http"

	"evilstack/models"
)

var GetAgentsFunc func() []models.Agent

func ListAgentsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if GetAgentsFunc != nil {
		json.NewEncoder(w).Encode(GetAgentsFunc())
	} else {
		json.NewEncoder(w).Encode([]models.Agent{})
	}
}
