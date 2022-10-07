package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"sort"
)

type MatchWorker interface {
	PipeTo(handler MatchResultHandler)
	HandleQueueItems(input []*common.QueueItem)
}

//go:generate mockgen -destination=../mocks/mock_match_result_handler.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/matchmaker/worker MatchResultHandler
type MatchResultHandler interface {
	HandleMatches(matches []*common.QueueItemsMatch)
}

type matchWorker struct {
	outputHandler MatchResultHandler
}

func NewMatchWorker() MatchWorker {
	return &matchWorker{}
}

func (worker *matchWorker) PipeTo(handler MatchResultHandler) {
	worker.outputHandler = handler
}

func (worker *matchWorker) HandleQueueItems(items []*common.QueueItem) {
	bufferMap := make(map[int]*common.QueueItem)
	matches := make([]*common.QueueItemsMatch, 0, len(items)/2)

	for _, item := range items {
		match := worker.tryMatch(bufferMap, item)
		if match != nil {
			matches = append(matches, match)
		}
	}

	if worker.outputHandler == nil {
		return
	}

	worker.outputHandler.HandleMatches(matches)
}

func (worker *matchWorker) tryMatch(buffer map[int]*common.QueueItem, item *common.QueueItem) *common.QueueItemsMatch {
	difficulties := item.Difficulties
	sort.Ints(difficulties)

	// Matching Strategy: Hardest First
	for i := len(difficulties) - 1; i >= 0; i-- {
		difficulty := difficulties[i]

		bufferedItem, found := buffer[difficulty]
		if found {
			worker.flushBuffer(buffer, bufferedItem)
			return &common.QueueItemsMatch{
				UserA:      bufferedItem,
				UserB:      item,
				Difficulty: difficulty,
			}
		}
	}

	// No match, add to buffer
	for _, difficulty := range difficulties {
		buffer[difficulty] = item
	}
	return nil
}

func (worker *matchWorker) flushBuffer(buffer map[int]*common.QueueItem, item *common.QueueItem) {
	for k := range buffer {
		if buffer[k] == item {
			delete(buffer, k)
		}
	}
}
