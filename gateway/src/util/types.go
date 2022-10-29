package util

import (
	"errors"
	"net/http"
)

//go:generate mockgen -destination=../mocks/types_mock.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/gateway/util Disposable,PipeOutput,PipeInput,ThroughPipe,DisposablePipeInput,DisposableThroughPipe

type Disposable interface {
	Dispose()
}

type PipeOutput interface {
	PipeTo(to PipeInput)
}

type PipeInput interface {
	Receive(item *HTTPContext) error
}

type ThroughPipe interface {
	PipeInput
	PipeOutput
}

type DisposablePipeInput interface {
	PipeInput
	Disposable
}

type DisposableThroughPipe interface {
	ThroughPipe
	Disposable
}

type BasePipeOutput struct {
	output PipeInput
}

func (stage *BasePipeOutput) PipeTo(to PipeInput) {
	stage.output = to
}

func (stage *BasePipeOutput) WriteToDownstream(item *HTTPContext) error {
	if stage.output == nil {
		return errors.New("No Pipe Downstream")
	}

	return stage.output.Receive(item)
}

type HTTPContext struct {
	Response http.ResponseWriter
	Request  *http.Request
}
