package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"evilstack/models"
)

var Tasks = make(map[string]models.Task)
var TaskQueue = make(chan models.Task, 64)
var TaskMutex sync.RWMutex
var RequestCount int64 = 0

type createTaskRequest struct {
	Type    string                 `json:"type"`
	Payload map[string]interface{} `json:"payload"`
}

func generateUUID() string {
	b := make([]byte, 16)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}

func GetRequestCount() int64 {
	return atomic.LoadInt64(&RequestCount)
}

func CreateTaskHandler(w http.ResponseWriter, r *http.Request) {
	atomic.AddInt64(&RequestCount, 1)

	var req createTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	task := models.Task{
		ID:        generateUUID(),
		Type:      req.Type,
		Payload:   req.Payload,
		Status:    "pending",
		Agent:     "",
		CreatedAt: time.Now(),
	}

	TaskMutex.Lock()
	Tasks[task.ID] = task
	TaskMutex.Unlock()

	select {
	case TaskQueue <- task:
	default:
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

func ListTasksHandler(w http.ResponseWriter, r *http.Request) {
	atomic.AddInt64(&RequestCount, 1)

	TaskMutex.RLock()
	taskList := make([]models.Task, 0, len(Tasks))
	for _, t := range Tasks {
		taskList = append(taskList, t)
	}
	TaskMutex.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(taskList)
}
