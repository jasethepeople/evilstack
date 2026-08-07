package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"evilstack/handlers"
	"evilstack/simulator"
)

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func main() {
	rand.Seed(time.Now().UnixNano())

	// Wire up cross-package references
	handlers.GetAgentsFunc = simulator.GetAgents

	// Dynamic port binding
	ln, err := net.Listen("tcp", "0.0.0.0:0")
	if err != nil {
		log.Fatal(err)
	}
	port := ln.Addr().(*net.TCPAddr).Port
	handlers.RuntimePort = port
	fmt.Printf("EVIL_ENGINE_PORT=%d\n", port)

	// Start simulators
	go simulator.StartTelemetrySimulator()
	go simulator.StartAgentWorkers(handlers.TaskQueue)

	// Routes
	http.HandleFunc("/api/config", enableCORS(handlers.ConfigHandler))
	http.HandleFunc("/api/telemetry/stream", enableCORS(handlers.TelemetryHandler))
	http.HandleFunc("/api/tasks", enableCORS(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			handlers.CreateTaskHandler(w, r)
		} else {
			handlers.ListTasksHandler(w, r)
		}
	}))
	http.HandleFunc("/api/agents", enableCORS(handlers.ListAgentsHandler))
	http.HandleFunc("/api/logs", enableCORS(handlers.ListLogsHandler))

	// Graceful shutdown
	srv := &http.Server{}
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		srv.Shutdown(ctx)
	}()

	log.Printf("Evil Engine listening on :%d", port)
	if err := srv.Serve(ln); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
