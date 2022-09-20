package common

type QueueBuffers struct {
	EasyQueue   chan *string
	MediumQueue chan *string
	HardQueue   chan *string
}

type QueueItem struct {
	Username   string
	Difficulty int
}

const (
	DifficultyUnused = iota
	DifficultyEasy
	DifficultyMedium
	DifficultyHard
)
