// @generated by protobuf-ts 2.8.0 with parameter server_grpc1
// @generated from protobuf file "user-service.proto" (package "user_service", syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { PasswordUser } from "./types";
/**
 * @generated from protobuf message user_service.GetUserRequest
 */
export interface GetUserRequest {
    /**
     * @generated from protobuf field: common.PasswordUser user = 1;
     */
    user?: PasswordUser;
}
/**
 * @generated from protobuf message user_service.GetUserResponse
 */
export interface GetUserResponse {
    /**
     * @generated from protobuf field: common.PasswordUser user = 1;
     */
    user?: PasswordUser;
    /**
     * @generated from protobuf field: string error_message = 2;
     */
    errorMessage: string;
}
/**
 * @generated from protobuf message user_service.CreateUserRequest
 */
export interface CreateUserRequest {
    /**
     * @generated from protobuf field: common.PasswordUser user = 1;
     */
    user?: PasswordUser;
}
/**
 * @generated from protobuf message user_service.CreateUserResponse
 */
export interface CreateUserResponse {
    /**
     * @generated from protobuf field: common.PasswordUser user = 1;
     */
    user?: PasswordUser;
}
/**
 * @generated from protobuf message user_service.EditUserRequest
 */
export interface EditUserRequest {
    /**
     * @generated from protobuf field: common.PasswordUser user = 1;
     */
    user?: PasswordUser;
}
/**
 * @generated from protobuf message user_service.EditUserResponse
 */
export interface EditUserResponse {
    /**
     * @generated from protobuf field: common.PasswordUser user = 1;
     */
    user?: PasswordUser;
    /**
     * @generated from protobuf field: string error_message = 2;
     */
    errorMessage: string;
}
/**
 * @generated from protobuf message user_service.DeleteUserRequest
 */
export interface DeleteUserRequest {
    /**
     * @generated from protobuf field: uint64 user_id = 1;
     */
    userId: bigint;
}
/**
 * @generated from protobuf message user_service.DeleteUserResponse
 */
export interface DeleteUserResponse {
    /**
     * @generated from protobuf field: string error_message = 1;
     */
    errorMessage: string;
}
// @generated message type with reflection information, may provide speed optimized methods
class GetUserRequest$Type extends MessageType<GetUserRequest> {
    constructor() {
        super("user_service.GetUserRequest", [
            { no: 1, name: "user", kind: "message", T: () => PasswordUser }
        ]);
    }
    create(value?: PartialMessage<GetUserRequest>): GetUserRequest {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetUserRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetUserRequest): GetUserRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* common.PasswordUser user */ 1:
                    message.user = PasswordUser.internalBinaryRead(reader, reader.uint32(), options, message.user);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: GetUserRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* common.PasswordUser user = 1; */
        if (message.user)
            PasswordUser.internalBinaryWrite(message.user, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message user_service.GetUserRequest
 */
export const GetUserRequest = new GetUserRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class GetUserResponse$Type extends MessageType<GetUserResponse> {
    constructor() {
        super("user_service.GetUserResponse", [
            { no: 1, name: "user", kind: "message", T: () => PasswordUser },
            { no: 2, name: "error_message", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<GetUserResponse>): GetUserResponse {
        const message = { errorMessage: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetUserResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetUserResponse): GetUserResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* common.PasswordUser user */ 1:
                    message.user = PasswordUser.internalBinaryRead(reader, reader.uint32(), options, message.user);
                    break;
                case /* string error_message */ 2:
                    message.errorMessage = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: GetUserResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* common.PasswordUser user = 1; */
        if (message.user)
            PasswordUser.internalBinaryWrite(message.user, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* string error_message = 2; */
        if (message.errorMessage !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.errorMessage);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message user_service.GetUserResponse
 */
export const GetUserResponse = new GetUserResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CreateUserRequest$Type extends MessageType<CreateUserRequest> {
    constructor() {
        super("user_service.CreateUserRequest", [
            { no: 1, name: "user", kind: "message", T: () => PasswordUser }
        ]);
    }
    create(value?: PartialMessage<CreateUserRequest>): CreateUserRequest {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<CreateUserRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CreateUserRequest): CreateUserRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* common.PasswordUser user */ 1:
                    message.user = PasswordUser.internalBinaryRead(reader, reader.uint32(), options, message.user);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: CreateUserRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* common.PasswordUser user = 1; */
        if (message.user)
            PasswordUser.internalBinaryWrite(message.user, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message user_service.CreateUserRequest
 */
export const CreateUserRequest = new CreateUserRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class CreateUserResponse$Type extends MessageType<CreateUserResponse> {
    constructor() {
        super("user_service.CreateUserResponse", [
            { no: 1, name: "user", kind: "message", T: () => PasswordUser }
        ]);
    }
    create(value?: PartialMessage<CreateUserResponse>): CreateUserResponse {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<CreateUserResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: CreateUserResponse): CreateUserResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* common.PasswordUser user */ 1:
                    message.user = PasswordUser.internalBinaryRead(reader, reader.uint32(), options, message.user);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: CreateUserResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* common.PasswordUser user = 1; */
        if (message.user)
            PasswordUser.internalBinaryWrite(message.user, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message user_service.CreateUserResponse
 */
export const CreateUserResponse = new CreateUserResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class EditUserRequest$Type extends MessageType<EditUserRequest> {
    constructor() {
        super("user_service.EditUserRequest", [
            { no: 1, name: "user", kind: "message", T: () => PasswordUser }
        ]);
    }
    create(value?: PartialMessage<EditUserRequest>): EditUserRequest {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<EditUserRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: EditUserRequest): EditUserRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* common.PasswordUser user */ 1:
                    message.user = PasswordUser.internalBinaryRead(reader, reader.uint32(), options, message.user);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: EditUserRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* common.PasswordUser user = 1; */
        if (message.user)
            PasswordUser.internalBinaryWrite(message.user, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message user_service.EditUserRequest
 */
export const EditUserRequest = new EditUserRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class EditUserResponse$Type extends MessageType<EditUserResponse> {
    constructor() {
        super("user_service.EditUserResponse", [
            { no: 1, name: "user", kind: "message", T: () => PasswordUser },
            { no: 2, name: "error_message", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<EditUserResponse>): EditUserResponse {
        const message = { errorMessage: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<EditUserResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: EditUserResponse): EditUserResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* common.PasswordUser user */ 1:
                    message.user = PasswordUser.internalBinaryRead(reader, reader.uint32(), options, message.user);
                    break;
                case /* string error_message */ 2:
                    message.errorMessage = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: EditUserResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* common.PasswordUser user = 1; */
        if (message.user)
            PasswordUser.internalBinaryWrite(message.user, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* string error_message = 2; */
        if (message.errorMessage !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.errorMessage);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message user_service.EditUserResponse
 */
export const EditUserResponse = new EditUserResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class DeleteUserRequest$Type extends MessageType<DeleteUserRequest> {
    constructor() {
        super("user_service.DeleteUserRequest", [
            { no: 1, name: "user_id", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 0 /*LongType.BIGINT*/ }
        ]);
    }
    create(value?: PartialMessage<DeleteUserRequest>): DeleteUserRequest {
        const message = { userId: 0n };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<DeleteUserRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeleteUserRequest): DeleteUserRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint64 user_id */ 1:
                    message.userId = reader.uint64().toBigInt();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: DeleteUserRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* uint64 user_id = 1; */
        if (message.userId !== 0n)
            writer.tag(1, WireType.Varint).uint64(message.userId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message user_service.DeleteUserRequest
 */
export const DeleteUserRequest = new DeleteUserRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class DeleteUserResponse$Type extends MessageType<DeleteUserResponse> {
    constructor() {
        super("user_service.DeleteUserResponse", [
            { no: 1, name: "error_message", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<DeleteUserResponse>): DeleteUserResponse {
        const message = { errorMessage: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<DeleteUserResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: DeleteUserResponse): DeleteUserResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string error_message */ 1:
                    message.errorMessage = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: DeleteUserResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string error_message = 1; */
        if (message.errorMessage !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.errorMessage);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message user_service.DeleteUserResponse
 */
export const DeleteUserResponse = new DeleteUserResponse$Type();