/* eslint-disable */
// @generated by protobuf-ts 2.8.0 with parameter server_grpc1,client_grpc1,eslint_disable,long_type_number
// @generated from protobuf file "question-service.proto" (package "question_service", syntax proto3)
// tslint:disable
import { QuestionService } from "./question-service";
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { DeleteQuestionResponse } from "./question-service";
import type { DeleteQuestionRequest } from "./question-service";
import type { EditQuestionResponse } from "./question-service";
import type { EditQuestionRequest } from "./question-service";
import type { CreateQuestionResponse } from "./question-service";
import type { CreateQuestionRequest } from "./question-service";
import type { GetQuestionResponse } from "./question-service";
import type { GetQuestionRequest } from "./question-service";
import * as grpc from "@grpc/grpc-js";
/**
 * @generated from protobuf service question_service.QuestionService
 */
export interface IQuestionServiceClient {
    /**
     * @generated from protobuf rpc: GetQuestion(question_service.GetQuestionRequest) returns (question_service.GetQuestionResponse);
     */
    getQuestion(input: GetQuestionRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetQuestionResponse) => void): grpc.ClientUnaryCall;
    getQuestion(input: GetQuestionRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: GetQuestionResponse) => void): grpc.ClientUnaryCall;
    getQuestion(input: GetQuestionRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: GetQuestionResponse) => void): grpc.ClientUnaryCall;
    getQuestion(input: GetQuestionRequest, callback: (err: grpc.ServiceError | null, value?: GetQuestionResponse) => void): grpc.ClientUnaryCall;
    /**
     * @generated from protobuf rpc: CreateQuestion(question_service.CreateQuestionRequest) returns (question_service.CreateQuestionResponse);
     */
    createQuestion(input: CreateQuestionRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: CreateQuestionResponse) => void): grpc.ClientUnaryCall;
    createQuestion(input: CreateQuestionRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: CreateQuestionResponse) => void): grpc.ClientUnaryCall;
    createQuestion(input: CreateQuestionRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: CreateQuestionResponse) => void): grpc.ClientUnaryCall;
    createQuestion(input: CreateQuestionRequest, callback: (err: grpc.ServiceError | null, value?: CreateQuestionResponse) => void): grpc.ClientUnaryCall;
    /**
     * @generated from protobuf rpc: EditQuestion(question_service.EditQuestionRequest) returns (question_service.EditQuestionResponse);
     */
    editQuestion(input: EditQuestionRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: EditQuestionResponse) => void): grpc.ClientUnaryCall;
    editQuestion(input: EditQuestionRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: EditQuestionResponse) => void): grpc.ClientUnaryCall;
    editQuestion(input: EditQuestionRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: EditQuestionResponse) => void): grpc.ClientUnaryCall;
    editQuestion(input: EditQuestionRequest, callback: (err: grpc.ServiceError | null, value?: EditQuestionResponse) => void): grpc.ClientUnaryCall;
    /**
     * @generated from protobuf rpc: DeleteQuestion(question_service.DeleteQuestionRequest) returns (question_service.DeleteQuestionResponse);
     */
    deleteQuestion(input: DeleteQuestionRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: DeleteQuestionResponse) => void): grpc.ClientUnaryCall;
    deleteQuestion(input: DeleteQuestionRequest, metadata: grpc.Metadata, callback: (err: grpc.ServiceError | null, value?: DeleteQuestionResponse) => void): grpc.ClientUnaryCall;
    deleteQuestion(input: DeleteQuestionRequest, options: grpc.CallOptions, callback: (err: grpc.ServiceError | null, value?: DeleteQuestionResponse) => void): grpc.ClientUnaryCall;
    deleteQuestion(input: DeleteQuestionRequest, callback: (err: grpc.ServiceError | null, value?: DeleteQuestionResponse) => void): grpc.ClientUnaryCall;
}
/**
 * @generated from protobuf service question_service.QuestionService
 */
export class QuestionServiceClient extends grpc.Client implements IQuestionServiceClient {
    private readonly _binaryOptions: Partial<BinaryReadOptions & BinaryWriteOptions>;
    constructor(address: string, credentials: grpc.ChannelCredentials, options: grpc.ClientOptions = {}, binaryOptions: Partial<BinaryReadOptions & BinaryWriteOptions> = {}) {
        super(address, credentials, options);
        this._binaryOptions = binaryOptions;
    }
    /**
     * @generated from protobuf rpc: GetQuestion(question_service.GetQuestionRequest) returns (question_service.GetQuestionResponse);
     */
    getQuestion(input: GetQuestionRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetQuestionResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: GetQuestionResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: GetQuestionResponse) => void)): grpc.ClientUnaryCall {
        const method = QuestionService.methods[0];
        return this.makeUnaryRequest<GetQuestionRequest, GetQuestionResponse>(`/${QuestionService.typeName}/${method.name}`, (value: GetQuestionRequest): Buffer => Buffer.from(method.I.toBinary(value, this._binaryOptions)), (value: Buffer): GetQuestionResponse => method.O.fromBinary(value, this._binaryOptions), input, (metadata as any), (options as any), (callback as any));
    }
    /**
     * @generated from protobuf rpc: CreateQuestion(question_service.CreateQuestionRequest) returns (question_service.CreateQuestionResponse);
     */
    createQuestion(input: CreateQuestionRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: CreateQuestionResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: CreateQuestionResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: CreateQuestionResponse) => void)): grpc.ClientUnaryCall {
        const method = QuestionService.methods[1];
        return this.makeUnaryRequest<CreateQuestionRequest, CreateQuestionResponse>(`/${QuestionService.typeName}/${method.name}`, (value: CreateQuestionRequest): Buffer => Buffer.from(method.I.toBinary(value, this._binaryOptions)), (value: Buffer): CreateQuestionResponse => method.O.fromBinary(value, this._binaryOptions), input, (metadata as any), (options as any), (callback as any));
    }
    /**
     * @generated from protobuf rpc: EditQuestion(question_service.EditQuestionRequest) returns (question_service.EditQuestionResponse);
     */
    editQuestion(input: EditQuestionRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: EditQuestionResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: EditQuestionResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: EditQuestionResponse) => void)): grpc.ClientUnaryCall {
        const method = QuestionService.methods[2];
        return this.makeUnaryRequest<EditQuestionRequest, EditQuestionResponse>(`/${QuestionService.typeName}/${method.name}`, (value: EditQuestionRequest): Buffer => Buffer.from(method.I.toBinary(value, this._binaryOptions)), (value: Buffer): EditQuestionResponse => method.O.fromBinary(value, this._binaryOptions), input, (metadata as any), (options as any), (callback as any));
    }
    /**
     * @generated from protobuf rpc: DeleteQuestion(question_service.DeleteQuestionRequest) returns (question_service.DeleteQuestionResponse);
     */
    deleteQuestion(input: DeleteQuestionRequest, metadata: grpc.Metadata | grpc.CallOptions | ((err: grpc.ServiceError | null, value?: DeleteQuestionResponse) => void), options?: grpc.CallOptions | ((err: grpc.ServiceError | null, value?: DeleteQuestionResponse) => void), callback?: ((err: grpc.ServiceError | null, value?: DeleteQuestionResponse) => void)): grpc.ClientUnaryCall {
        const method = QuestionService.methods[3];
        return this.makeUnaryRequest<DeleteQuestionRequest, DeleteQuestionResponse>(`/${QuestionService.typeName}/${method.name}`, (value: DeleteQuestionRequest): Buffer => Buffer.from(method.I.toBinary(value, this._binaryOptions)), (value: Buffer): DeleteQuestionResponse => method.O.fromBinary(value, this._binaryOptions), input, (metadata as any), (options as any), (callback as any));
    }
}