package util

import "time"

//go:generate mockgen -destination=../mocks/mock_clock.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/session-service/util Clock
type Clock interface {
	Now() time.Time
}

type RealClock struct {
}

func (RealClock) Now() time.Time {
	return time.Now()
}

var realClock RealClock = RealClock{}

func GetRealClock() Clock {
	return &realClock
}
