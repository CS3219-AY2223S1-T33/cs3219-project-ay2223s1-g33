package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/mocks"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestInQueueProcessing(t *testing.T) {
	easyChan := make(chan *string, 10)
	medChan := make(chan *string, 10)
	hardChan := make(chan *string, 10)

	worker := fetchWorker{
		queues: &common.QueueBuffers{
			EasyQueue:   easyChan,
			MediumQueue: medChan,
			HardQueue:   hardChan,
		},
	}

	items := []*common.QueueItem{
		{
			Username:   "A",
			Difficulty: common.DifficultyEasy,
		},
		{
			Username:   "B",
			Difficulty: common.DifficultyMedium,
		},
		{
			Username:   "C",
			Difficulty: common.DifficultyHard,
		},
	}

	worker.processInQueue(items)
	assertChanFound(t, easyChan)
	assertChanFound(t, medChan)
	assertChanFound(t, hardChan)
	assertChanEmpty(t, easyChan)
	assertChanEmpty(t, medChan)
	assertChanEmpty(t, hardChan)
}

func TestExpiredQueueProcessing(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	redisClient := mocks.NewMockRedisMatchmakerClient(ctrl)
	worker := fetchWorker{
		redisClient: redisClient,
	}

	gomock.InOrder(
		redisClient.EXPECT().UploadFailures([]string{"A", "B", "C"}),
		redisClient.EXPECT().UploadFailures([]string{"A", "B", "C"}).Return(errors.New("Testing error")),
	)

	items := []*common.QueueItem{
		{
			Username:   "A",
			Difficulty: 1,
		},
		{
			Username:   "B",
			Difficulty: 1,
		},
		{
			Username:   "C",
			Difficulty: 1,
		},
	}

	worker.processExpired(items)
	worker.processExpired(items)
}

func TestQueueDemuxing(t *testing.T) {
	easyChan := make(chan *string, 10)
	medChan := make(chan *string, 10)
	hardChan := make(chan *string, 10)

	worker := fetchWorker{
		queues: &common.QueueBuffers{
			EasyQueue:   easyChan,
			MediumQueue: medChan,
			HardQueue:   hardChan,
		},
	}

	worker.addToQueue(&common.QueueItem{
		Username:   "A",
		Difficulty: common.DifficultyEasy,
	})

	assertChanFound(t, easyChan)
	assertChanEmpty(t, easyChan)
	assertChanEmpty(t, medChan)
	assertChanEmpty(t, hardChan)

	worker.addToQueue(&common.QueueItem{
		Username:   "A",
		Difficulty: common.DifficultyMedium,
	})

	assertChanEmpty(t, easyChan)
	assertChanFound(t, medChan)
	assertChanEmpty(t, medChan)
	assertChanEmpty(t, hardChan)

	worker.addToQueue(&common.QueueItem{
		Username:   "A",
		Difficulty: common.DifficultyHard,
	})

	assertChanEmpty(t, easyChan)
	assertChanEmpty(t, medChan)
	assertChanFound(t, hardChan)
	assertChanEmpty(t, hardChan)

	worker.addToQueue(&common.QueueItem{
		Username:   "A",
		Difficulty: 100,
	})

	assertChanEmpty(t, easyChan)
	assertChanEmpty(t, medChan)
	assertChanEmpty(t, hardChan)
}

func assertChanFound(t *testing.T, channel chan *string) {
	select {
	case item := <-channel:
		assert.NotNil(t, item)
	default:
		t.FailNow()
	}
}

func assertChanEmpty(t *testing.T, channel chan *string) {
	select {
	case <-channel:
		t.FailNow()
	default:
	}
}
