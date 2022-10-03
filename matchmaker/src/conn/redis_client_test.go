package conn

import (
	"context"
	"cs3219-project-ay2223s1-g33/matchmaker/common"
	"testing"
	"time"

	"github.com/go-redis/redis/v9"
	"github.com/stretchr/testify/assert"
)

func TestPartitionMesssages_ValidityCheck(t *testing.T) {
	client := redisMatchmakerClient{}
	ctx := context.Background()

	testMessages := []redis.XMessage{
		{
			ID: "1-0",
			Values: map[string]interface{}{
				"diff": "[1]",
			},
		},
		{
			ID: "2-0",
			Values: map[string]interface{}{
				"user": "testA@email.com",
			},
		},
		{
			ID: "3-0",
			Values: map[string]interface{}{
				"user": "testA@email.com",
				"diff": "asdf",
			},
		},
	}

	expired, inQueue := client.partitionMesssages(ctx, testMessages, time.UnixMilli(10))
	assert.Equal(t, 0, len(expired))
	assert.Equal(t, 0, len(inQueue))
}

func TestPartitionMesssages_ExpiryTest(t *testing.T) {
	client := redisMatchmakerClient{
		queueLifespan: 30 * time.Second,
	}
	ctx := context.Background()

	testMessages := []redis.XMessage{
		{
			ID: "1-0",
			Values: map[string]interface{}{
				"user": "testA@email.com",
				"diff": "[1]",
			},
		},
		{
			ID: "2-0",
			Values: map[string]interface{}{
				"user": "testB@email.com",
				"diff": "[1,2]",
			},
		},
		{
			ID: "3-0",
			Values: map[string]interface{}{
				"user": "testC@email.com",
				"diff": "[2,3]",
			},
		},
	}

	expired, inQueue := client.partitionMesssages(ctx, testMessages, time.UnixMilli(2).Add(client.queueLifespan))
	assert.Equal(t, 2, len(expired))
	assert.Equal(t, 1, len(inQueue))
	assert.Contains(t, expired, &common.QueueItem{
		StreamId:     "1-0",
		Username:     "testA@email.com",
		Difficulties: []int{1},
	})
	assert.Contains(t, expired, &common.QueueItem{
		StreamId:     "2-0",
		Username:     "testB@email.com",
		Difficulties: []int{1, 2},
	})
	assert.Contains(t, inQueue, &common.QueueItem{
		StreamId:     "3-0",
		Username:     "testC@email.com",
		Difficulties: []int{2, 3},
	})
}

func TestGetTimestampFromid(t *testing.T) {
	assert.Equal(t, time.UnixMilli(100), *getTimestampFromMessageId(pointerStringOf("100-2")))
	assert.Equal(t, time.UnixMilli(123), *getTimestampFromMessageId(pointerStringOf("123-0222asdfwer")))
	assert.Equal(t, time.UnixMilli(456), *getTimestampFromMessageId(pointerStringOf("456")))
	assert.Nil(t, getTimestampFromMessageId(pointerStringOf("asdf-wer")))
	assert.Nil(t, getTimestampFromMessageId(pointerStringOf("asdf-123")))
	assert.Nil(t, getTimestampFromMessageId(pointerStringOf("asdf")))
}

func pointerStringOf(value string) *string {
	return &value
}
