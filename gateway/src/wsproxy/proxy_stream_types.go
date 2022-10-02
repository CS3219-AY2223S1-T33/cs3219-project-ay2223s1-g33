package wsproxy

import "io"

type CloseObservable interface {
	SetCloseListener(CloseObserver)
}

type CloseObserver func()

type Pipeable interface {
	PipeTo(io.WriteCloser)
}

type Closeable interface {
	Close() error
}
