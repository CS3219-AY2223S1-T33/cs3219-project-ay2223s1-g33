package util

//go:generate mockgen -destination=../mocks/grpc_mock.go -build_flags=-mod=mod -package=mocks cs3219-project-ay2223s1-g33/gateway/proto SessionServiceClient
//go:generate mockgen -destination=../mocks/http_mock.go -build_flags=-mod=mod -package=mocks net/http ResponseWriter Handler
