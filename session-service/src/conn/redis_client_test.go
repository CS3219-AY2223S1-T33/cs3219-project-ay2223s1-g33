package conn

import (
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestStartOfDayRounding(t *testing.T) {
	date := time.Date(2021, 10, 4, 20, 31, 22, 0, time.UTC)
	expectedDate := time.Date(2021, 10, 4, 0, 0, 0, 0, time.UTC)
	roundedDate := getStartOfDay(date)
	assert.Equal(t, expectedDate, roundedDate)

	date = time.Date(2021, 10, 4, 23, 59, 59, 0, time.UTC)
	expectedDate = time.Date(2021, 10, 4, 0, 0, 0, 0, time.UTC)
	roundedDate = getStartOfDay(date)
	assert.Equal(t, expectedDate, roundedDate)

	date = time.Date(2021, 10, 4, 23, 4, 0, 0, time.UTC)
	expectedDate = time.Date(2021, 10, 4, 0, 0, 0, 0, time.UTC)
	roundedDate = getStartOfDay(date)
	assert.Equal(t, expectedDate, roundedDate)

	date = time.Date(2021, 10, 4, 20, 31, 22, 0, time.Local)
	expectedDate = time.Date(2021, 10, 4, 0, 0, 0, 0, time.Local)
	roundedDate = getStartOfDay(date)
	assert.Equal(t, expectedDate, roundedDate)

	date = time.Date(2021, 10, 4, 6, 31, 22, 0, time.Local)
	expectedDate = time.Date(2021, 10, 4, 0, 0, 0, 0, time.Local)
	roundedDate = getStartOfDay(date)
	assert.Equal(t, expectedDate, roundedDate)

	date = time.Date(2021, 10, 4, 6, 23, 59, 59, time.Local)
	expectedDate = time.Date(2021, 10, 4, 0, 0, 0, 0, time.Local)
	roundedDate = getStartOfDay(date)
	assert.Equal(t, expectedDate, roundedDate)
}

func TestRedisKey(t *testing.T) {
	date := time.Date(2021, 10, 4, 0, 0, 0, 0, time.UTC)
	key := getBlacklistKeyForDay(date)
	assert.Equal(t, fmt.Sprintf(redisBlacklistKeyFormat, date.Unix()), key)
}
