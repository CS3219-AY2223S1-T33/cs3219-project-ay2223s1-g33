package main

type QueueBuffers struct {
	EasyQueue   chan *string
	MediumQueue chan *string
	HardQueue   chan *string
}

type RedisQueueObject struct {
	Username   string
	Difficulty int
}

const (
	DifficultyUnused = iota
	DifficultyEasy
	DifficultyMedium
	DifficultyHard
)
