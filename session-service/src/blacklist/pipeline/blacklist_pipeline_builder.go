package pipeline

type RedisBlacklistPipelineBuilder interface {
	Add(filter RedisBlacklistFilter) RedisBlacklistPipelineBuilder
	AddAll(filters []RedisBlacklistFilter) RedisBlacklistPipelineBuilder
	Build() RedisBlacklistPipeline
}

type redisBlacklistPipelineBuilder struct {
	filters []RedisBlacklistFilter
}

func NewRedisBlacklistPipelineBuilder() RedisBlacklistPipelineBuilder {
	return &redisBlacklistPipelineBuilder{
		filters: []RedisBlacklistFilter{},
	}
}

func (builder *redisBlacklistPipelineBuilder) Add(filter RedisBlacklistFilter) RedisBlacklistPipelineBuilder {
	if filter == nil {
		return builder
	}

	builder.filters = append(builder.filters, filter)
	return builder
}

func (builder *redisBlacklistPipelineBuilder) AddAll(filters []RedisBlacklistFilter) RedisBlacklistPipelineBuilder {
	if len(filters) == 0 {
		return builder
	}

	for _, filter := range filters {
		builder.filters = append(builder.filters, filter)
	}

	return builder
}

func (builder *redisBlacklistPipelineBuilder) Build() RedisBlacklistPipeline {
	return &redisBlacklistPipeline{
		filters: builder.filters,
	}
}
