package common

type QueueItemsMatch struct {
	UserA      *QueueItem
	UserB      *QueueItem
	Difficulty int
}

type QueueItem struct {
	StreamId     string
	Username     string
	Difficulties []int
}

const (
	DifficultyUnused = iota
	DifficultyEasy
	DifficultyMedium
	DifficultyHard
)
