package worker

import (
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"cs3219-project-ay2223s1-g33/matchmaker/mocks"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
)

func TestUploadMatch(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	redisClient := mocks.NewMockRedisMatchmakerClient(ctrl)
	worker := uploadWorker{
		redisClient: redisClient,
	}

	capturedId := ""
	gomock.InOrder(
		redisClient.EXPECT().UploadMatch("A", gomock.Any(), 1).Do(func(_ string, matchId string, _ int) error {
			capturedId = matchId
			return nil
		}),
		redisClient.EXPECT().UploadMatch("B", gomock.Any(), 1).Do(func(_ string, matchId string, _ int) error {
			if capturedId != matchId {
				t.FailNow()
			}
			return nil
		}),
		redisClient.EXPECT().UploadMatch("A", gomock.Any(), 1).Return(errors.New("Test error")),
		redisClient.EXPECT().UploadMatch("A", gomock.Any(), 1).Return(nil),
		redisClient.EXPECT().UploadMatch("B", gomock.Any(), 1).Return(errors.New("Test error")),
	)

	match := &common.QueueItemsMatch{
		UserA: &common.QueueItem{
			Username: "A",
			StreamId: "A-1",
		},
		UserB: &common.QueueItem{
			Username: "B",
			StreamId: "B-1",
		},
		Difficulty: 1,
	}

	worker.uploadMatch(nil)
	worker.uploadMatch(match)
	worker.uploadMatch(match)
	worker.uploadMatch(match)
}

func TestHandleMatches(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	redisClient := mocks.NewMockRedisMatchmakerClient(ctrl)
	worker := uploadWorker{
		redisClient: redisClient,
	}

	worker.HandleMatches([]*common.QueueItemsMatch{})

	match := &common.QueueItemsMatch{
		UserA: &common.QueueItem{
			Username: "A",
			StreamId: "A-1",
		},
		UserB: &common.QueueItem{
			Username: "B",
			StreamId: "B-1",
		},
		Difficulty: 1,
	}

	capturedId := ""
	gomock.InOrder(
		redisClient.EXPECT().UploadMatch("A", gomock.Any(), 1).Do(func(_ string, matchId string, _ int) error {
			capturedId = matchId
			return nil
		}),
		redisClient.EXPECT().UploadMatch("B", gomock.Any(), 1).Do(func(_ string, matchId string, _ int) error {
			if capturedId != matchId {
				t.FailNow()
			}
			return nil
		}),
		redisClient.EXPECT().DeleteQueueItems(gomock.Eq([]*common.QueueItem{match.UserA, match.UserB})),
	)

	worker.HandleMatches([]*common.QueueItemsMatch{match})
}
