package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/mocks"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestSimpleMatching(t *testing.T) {
	easyChan := make(chan *string, 10)
	medChan := make(chan *string, 10)
	hardChan := make(chan *string, 10)

	worker := matchWorker{
		queues: &common.QueueBuffers{
			EasyQueue:   easyChan,
			MediumQueue: medChan,
			HardQueue:   hardChan,
		},
	}

	executor := worker.createMatchingContext()
	chans := []chan *string{easyChan, medChan, hardChan}

	for _, c := range chans {
		c <- pointerStringOf("A")
		assert.Nil(t, executor())
		c <- pointerStringOf("B")
		match := executor()
		assert.NotNil(t, match)
		assert.Equal(t, "A", *match.userA)
		assert.Equal(t, "B", *match.userB)
	}
}

func TestQueueIsolation(t *testing.T) {
	easyChan := make(chan *string, 10)
	medChan := make(chan *string, 10)
	hardChan := make(chan *string, 10)

	worker := matchWorker{
		queues: &common.QueueBuffers{
			EasyQueue:   easyChan,
			MediumQueue: medChan,
			HardQueue:   hardChan,
		},
	}

	executor := worker.createMatchingContext()

	easyChan <- pointerStringOf("A")
	medChan <- pointerStringOf("B")
	hardChan <- pointerStringOf("C")

	assert.Nil(t, executor()) // Ingest A
	assert.Nil(t, executor()) // Ingest B
	assert.Nil(t, executor()) // Ingest C
	hardChan <- pointerStringOf("E")
	hardChan <- pointerStringOf("F")

	match := executor() // Ingest E
	assert.NotNil(t, match)
	assert.Equal(t, "C", *match.userA)
	assert.Equal(t, "E", *match.userB)
	assert.Nil(t, executor()) // Ingest F

	medChan <- pointerStringOf("G")
	match = executor() // Ingest G
	assert.NotNil(t, match)
	assert.Equal(t, "B", *match.userA)
	assert.Equal(t, "G", *match.userB)
}

func TestUploadMatch(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	redisClient := mocks.NewMockRedisMatchmakerClient(ctrl)
	worker := matchWorker{
		redisClient: redisClient,
	}

	gomock.InOrder(
		redisClient.EXPECT().UploadMatch("A", "ASDF"),
		redisClient.EXPECT().UploadMatch("B", "ASDF"),
		redisClient.EXPECT().UploadMatch("A", "ASDF").Return(errors.New("Test error")),
		redisClient.EXPECT().UploadMatch("A", "ASDF"),
		redisClient.EXPECT().UploadMatch("B", "ASDF").Return(errors.New("Test error")),
	)

	match := &MatchmakerMatch{
		userA: pointerStringOf("A"),
		userB: pointerStringOf("B"),
		token: pointerStringOf("ASDF"),
	}

	worker.uploadMatch(nil)
	worker.uploadMatch(match)
	worker.uploadMatch(match)
	worker.uploadMatch(match)
}

func pointerStringOf(value string) *string {
	return &value
}
