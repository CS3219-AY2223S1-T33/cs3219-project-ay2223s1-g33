package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/mocks"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestSimpleMatching(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockHandler := mocks.NewMockMatchResultHandler(ctrl)
	worker := matchWorker{}

	gomock.InOrder(
		mockHandler.EXPECT().HandleMatches(gomock.Eq([]*common.QueueItemsMatch{
			{
				UserA: &common.QueueItem{
					Username:     "A",
					Difficulties: []int{1},
				},
				UserB: &common.QueueItem{
					Username:     "B",
					Difficulties: []int{1},
				},
				Difficulty: 1,
			},
		})),
		mockHandler.EXPECT().HandleMatches(gomock.Eq([]*common.QueueItemsMatch{
			{
				UserA: &common.QueueItem{
					Username:     "A",
					Difficulties: []int{2},
				},
				UserB: &common.QueueItem{
					Username:     "B",
					Difficulties: []int{2},
				},
				Difficulty: 2,
			},
		})),
		mockHandler.EXPECT().HandleMatches(gomock.Eq([]*common.QueueItemsMatch{
			{
				UserA: &common.QueueItem{
					Username:     "A",
					Difficulties: []int{3},
				},
				UserB: &common.QueueItem{
					Username:     "B",
					Difficulties: []int{3},
				},
				Difficulty: 3,
			},
		})),
	)

	items := []*common.QueueItem{
		{
			Username:     "A",
			Difficulties: []int{1},
		},
		{
			Username:     "B",
			Difficulties: []int{1},
		},
	}
	worker.HandleQueueItems(items)
	worker.PipeTo(mockHandler)

	for i := 0; i < 3; i++ {
		items = []*common.QueueItem{
			{
				Username:     "A",
				Difficulties: []int{i + 1},
			},
			{
				Username:     "B",
				Difficulties: []int{i + 1},
			},
		}
		worker.HandleQueueItems(items)
	}
}

func TestMultiDifficultyMatching(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockHandler := mocks.NewMockMatchResultHandler(ctrl)
	worker := matchWorker{
		outputHandler: mockHandler,
	}

	gomock.InOrder(
		mockHandler.EXPECT().HandleMatches(gomock.Any()).Do(func(matches []*common.QueueItemsMatch) {
			assert.Equal(t, 2, len(matches))

			t.Log(matches[0].UserA.Username)
			t.Log(matches[0].UserB.Username)
			assert.Equal(t, "B", matches[0].UserA.Username)
			assert.Equal(t, "C", matches[0].UserB.Username)
			assert.Equal(t, 3, matches[0].Difficulty)

			assert.Equal(t, "A", matches[1].UserA.Username)
			assert.Equal(t, "D", matches[1].UserB.Username)
			assert.Equal(t, 1, matches[1].Difficulty)
		}),
	)

	items := []*common.QueueItem{
		{
			Username:     "A",
			Difficulties: []int{1, 2},
		},
		{
			Username:     "B",
			Difficulties: []int{3},
		},
		{
			Username:     "C",
			Difficulties: []int{2, 3},
		},
		{
			Username:     "D",
			Difficulties: []int{1},
		},
		{
			Username:     "E",
			Difficulties: []int{3, 1},
		},
	}

	worker.HandleQueueItems(items)
}

func TestQueueIsolation(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockHandler := mocks.NewMockMatchResultHandler(ctrl)
	mockHandler.EXPECT().HandleMatches(gomock.Eq([]*common.QueueItemsMatch{})).Times(6)
	worker := matchWorker{
		outputHandler: mockHandler,
	}

	for i := 0; i < 3; i++ {
		difficultyA := i + 1
		difficultyB := ((i + 1) % 3) + 1
		items := []*common.QueueItem{
			{
				Username:     "A",
				Difficulties: []int{difficultyA},
			},
			{
				Username:     "B",
				Difficulties: []int{difficultyB},
			},
		}
		worker.HandleQueueItems(items)
	}

	for i := 0; i < 3; i++ {
		difficultyA := i + 1
		difficultyB := ((i + 2) % 3) + 1
		items := []*common.QueueItem{
			{
				Username:     "A",
				Difficulties: []int{difficultyA},
			},
			{
				Username:     "B",
				Difficulties: []int{difficultyB},
			},
		}
		worker.HandleQueueItems(items)
	}
}
