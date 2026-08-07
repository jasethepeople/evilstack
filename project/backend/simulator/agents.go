package simulator

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	"evilstack/handlers"
	"evilstack/models"
)

var Agents = map[string]*models.Agent{
	"Claude":   {Name: "Claude", Status: "idle", CurrentTask: "", ProcessedCount: 0, AvgLatencyMs: 0},
	"DeepSeek": {Name: "DeepSeek", Status: "idle", CurrentTask: "", ProcessedCount: 0, AvgLatencyMs: 0},
	"Hermes":   {Name: "Hermes", Status: "idle", CurrentTask: "", ProcessedCount: 0, AvgLatencyMs: 0},
}

var AgentMutex sync.RWMutex

func StartAgentWorkers(taskQueue chan models.Task) {
	for agentName := range Agents {
		go func(name string) {
			for task := range taskQueue {
				AgentMutex.Lock()
				agent := Agents[name]
				agent.Status = "processing"
				agent.CurrentTask = task.ID
				AgentMutex.Unlock()

				task.Agent = name
				now := time.Now()
				task.StartedAt = &now
				task.Status = "running"

				handlers.TaskMutex.Lock()
				handlers.Tasks[task.ID] = task
				handlers.TaskMutex.Unlock()

				handlers.AddLog("INFO", fmt.Sprintf("Agent %s started task %s", name, task.ID))

				sleepDuration := time.Duration(1+rand.Intn(3)) * time.Second
				time.Sleep(sleepDuration)

				completedAt := time.Now()
				task.CompletedAt = &completedAt
				task.Status = "completed"

				handlers.TaskMutex.Lock()
				handlers.Tasks[task.ID] = task
				handlers.TaskMutex.Unlock()

				latencyMs := float64(sleepDuration.Milliseconds())

				AgentMutex.Lock()
				agent.ProcessedCount++
				if agent.AvgLatencyMs == 0 {
					agent.AvgLatencyMs = latencyMs
				} else {
					agent.AvgLatencyMs = (agent.AvgLatencyMs + latencyMs) / 2.0
				}
				agent.Status = "idle"
				agent.CurrentTask = ""
				AgentMutex.Unlock()

				handlers.AddLog("INFO", fmt.Sprintf("Agent %s completed task %s", name, task.ID))
			}
		}(agentName)
	}
}

func GetAgents() []models.Agent {
	AgentMutex.RLock()
	defer AgentMutex.RUnlock()

	result := make([]models.Agent, 0, len(Agents))
	for _, agent := range Agents {
		result = append(result, *agent)
	}
	return result
}
