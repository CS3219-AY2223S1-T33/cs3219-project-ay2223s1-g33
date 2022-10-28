package util

import (
	"errors"
	"net/http"
)

type Disposable interface {
	Dispose()
}

type PipeOutput[T any] interface {
	PipeTo(to PipeInput[T])
}

type PipeInput[T any] interface {
	Receive(item T) error
}

type ThroughPipe[T any, U any] interface {
	PipeInput[T]
	PipeOutput[U]
}

type DisposablePipeInput[T any] interface {
	PipeInput[T]
	Disposable
}

type DispoableThroughPipe[T any, U any] interface {
	ThroughPipe[T, U]
	Disposable
}

type BasePipeOutput[T any] struct {
	output PipeInput[T]
}

func (stage *BasePipeOutput[T]) PipeTo(to PipeInput[T]) {
	stage.output = to
}

func (stage *BasePipeOutput[T]) WriteToDownstream(item T) error {
	if stage.output == nil {
		return errors.New("No Pipe Downstream")
	}

	return stage.output.Receive(item)
}

type HTTPContext struct {
	Response http.ResponseWriter
	Request  *http.Request
}
