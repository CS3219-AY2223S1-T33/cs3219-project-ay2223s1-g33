/* eslint-disable */
// @generated by protobuf-ts 2.8.0 with parameter server_grpc1,client_grpc1,eslint_disable,long_type_number
// @generated from protobuf file "history-service.proto" (package "history_service", syntax proto3)
// tslint:disable
import { GetAttemptSubmissionResponse } from "./history-service";
import { GetAttemptSubmissionRequest } from "./history-service";
import { GetAttemptHistoryResponse } from "./history-service";
import { GetAttemptHistoryRequest } from "./history-service";
import type * as grpc from "@grpc/grpc-js";
/**
 * @generated from protobuf service history_service.HistoryService
 */
export interface IHistoryService extends grpc.UntypedServiceImplementation {
    /**
     * @generated from protobuf rpc: GetAttemptHistory(history_service.GetAttemptHistoryRequest) returns (history_service.GetAttemptHistoryResponse);
     */
    getAttemptHistory: grpc.handleUnaryCall<GetAttemptHistoryRequest, GetAttemptHistoryResponse>;
    /**
     * @generated from protobuf rpc: GetAttemptSubmission(history_service.GetAttemptSubmissionRequest) returns (history_service.GetAttemptSubmissionResponse);
     */
    getAttemptSubmission: grpc.handleUnaryCall<GetAttemptSubmissionRequest, GetAttemptSubmissionResponse>;
}
/**
 * @grpc/grpc-js definition for the protobuf service history_service.HistoryService.
 *
 * Usage: Implement the interface IHistoryService and add to a grpc server.
 *
 * ```typescript
 * const server = new grpc.Server();
 * const service: IHistoryService = ...
 * server.addService(historyServiceDefinition, service);
 * ```
 */
export const historyServiceDefinition: grpc.ServiceDefinition<IHistoryService> = {
    getAttemptHistory: {
        path: "/history_service.HistoryService/GetAttemptHistory",
        originalName: "GetAttemptHistory",
        requestStream: false,
        responseStream: false,
        responseDeserialize: bytes => GetAttemptHistoryResponse.fromBinary(bytes),
        requestDeserialize: bytes => GetAttemptHistoryRequest.fromBinary(bytes),
        responseSerialize: value => Buffer.from(GetAttemptHistoryResponse.toBinary(value)),
        requestSerialize: value => Buffer.from(GetAttemptHistoryRequest.toBinary(value))
    },
    getAttemptSubmission: {
        path: "/history_service.HistoryService/GetAttemptSubmission",
        originalName: "GetAttemptSubmission",
        requestStream: false,
        responseStream: false,
        responseDeserialize: bytes => GetAttemptSubmissionResponse.fromBinary(bytes),
        requestDeserialize: bytes => GetAttemptSubmissionRequest.fromBinary(bytes),
        responseSerialize: value => Buffer.from(GetAttemptSubmissionResponse.toBinary(value)),
        requestSerialize: value => Buffer.from(GetAttemptSubmissionRequest.toBinary(value))
    }
};
