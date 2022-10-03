package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/mocks"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
)

func TestInQueueProcessing(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	worker := fetchWorker{}
	mockHandler := mocks.NewMockFetchResultHandler(ctrl)

	items := []*common.QueueItem{
		{
			Username:     "A",
			Difficulties: []int{1},
		},
		{
			Username:     "B",
			Difficulties: []int{2},
		},
		{
			Username:     "C",
			Difficulties: []int{3},
		},
	}

	mockHandler.EXPECT().HandleQueueItems(items)

	worker.processInQueue(items)

	worker.PipeTo(mockHandler)
	worker.processInQueue(items)
	worker.processInQueue(nil)
}

func TestExpiredQueueProcessing(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	redisClient := mocks.NewMockRedisMatchmakerClient(ctrl)
	worker := fetchWorker{
		redisClient: redisClient,
	}

	items := []*common.QueueItem{
		{
			Username:     "A",
			Difficulties: []int{1},
		},
		{
			Username:     "B",
			Difficulties: []int{1},
		},
		{
			Username:     "C",
			Difficulties: []int{1},
		},
	}

	gomock.InOrder(
		redisClient.EXPECT().UploadFailures([]string{"A", "B", "C"}),
		redisClient.EXPECT().UploadFailures([]string{"A", "B", "C"}).Return(errors.New("Testing error")),
	)

	gomock.InOrder(
		redisClient.EXPECT().DeleteQueueItems(items),
		redisClient.EXPECT().DeleteQueueItems(items).Return(errors.New("Testing error")),
	)

	worker.processExpired(items)
	worker.processExpired(items)
}
