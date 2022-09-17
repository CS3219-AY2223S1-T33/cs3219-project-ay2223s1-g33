/* eslint-disable */
// @generated by protobuf-ts 2.8.0 with parameter server_grpc1,client_grpc1,eslint_disable,long_type_number
// @generated from protobuf file "types.proto" (package "common", syntax proto3)
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
/**
 * @generated from protobuf message common.User
 */
export interface User {
    /**
     * @generated from protobuf field: uint64 user_id = 1;
     */
    userId: number;
    /**
     * @generated from protobuf field: string username = 2;
     */
    username: string;
    /**
     * @generated from protobuf field: string nickname = 3;
     */
    nickname: string;
}
/**
 * @generated from protobuf message common.PasswordUser
 */
export interface PasswordUser {
    /**
     * @generated from protobuf field: common.User user_info = 1;
     */
    userInfo?: User;
    /**
     * @generated from protobuf field: string password = 2;
     */
    password: string;
}
/**
 * @generated from protobuf message common.Question
 */
export interface Question {
    /**
     * @generated from protobuf field: uint64 question_id = 1;
     */
    questionId: number;
    /**
     * @generated from protobuf field: string name = 2;
     */
    name: string;
    /**
     * @generated from protobuf field: common.QuestionDifficulty difficulty = 3;
     */
    difficulty: QuestionDifficulty;
    /**
     * @generated from protobuf field: string content = 4;
     */
    content: string;
    /**
     * @generated from protobuf field: string solution = 5;
     */
    solution: string;
}
/**
 * @generated from protobuf enum common.QuestionDifficulty
 */
export enum QuestionDifficulty {
    /**
     * @generated from protobuf enum value: QUESTION_DIFFICULTY_UNUSED = 0;
     */
    UNUSED = 0,
    /**
     * @generated from protobuf enum value: QUESTION_DIFFICULTY_EASY = 1;
     */
    EASY = 1,
    /**
     * @generated from protobuf enum value: QUESTION_DIFFICULTY_MEDIUM = 2;
     */
    MEDIUM = 2,
    /**
     * @generated from protobuf enum value: QUESTION_DIFFICULTY_HARD = 3;
     */
    HARD = 3
}
// @generated message type with reflection information, may provide speed optimized methods
class User$Type extends MessageType<User> {
    constructor() {
        super("common.User", [
            { no: 1, name: "user_id", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 2, name: "username", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "nickname", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<User>): User {
        const message = { userId: 0, username: "", nickname: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<User>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: User): User {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint64 user_id */ 1:
                    message.userId = reader.uint64().toNumber();
                    break;
                case /* string username */ 2:
                    message.username = reader.string();
                    break;
                case /* string nickname */ 3:
                    message.nickname = reader.string();
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
    internalBinaryWrite(message: User, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* uint64 user_id = 1; */
        if (message.userId !== 0)
            writer.tag(1, WireType.Varint).uint64(message.userId);
        /* string username = 2; */
        if (message.username !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.username);
        /* string nickname = 3; */
        if (message.nickname !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.nickname);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message common.User
 */
export const User = new User$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PasswordUser$Type extends MessageType<PasswordUser> {
    constructor() {
        super("common.PasswordUser", [
            { no: 1, name: "user_info", kind: "message", T: () => User },
            { no: 2, name: "password", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<PasswordUser>): PasswordUser {
        const message = { password: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PasswordUser>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PasswordUser): PasswordUser {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* common.User user_info */ 1:
                    message.userInfo = User.internalBinaryRead(reader, reader.uint32(), options, message.userInfo);
                    break;
                case /* string password */ 2:
                    message.password = reader.string();
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
    internalBinaryWrite(message: PasswordUser, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* common.User user_info = 1; */
        if (message.userInfo)
            User.internalBinaryWrite(message.userInfo, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* string password = 2; */
        if (message.password !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.password);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message common.PasswordUser
 */
export const PasswordUser = new PasswordUser$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Question$Type extends MessageType<Question> {
    constructor() {
        super("common.Question", [
            { no: 1, name: "question_id", kind: "scalar", T: 4 /*ScalarType.UINT64*/, L: 2 /*LongType.NUMBER*/ },
            { no: 2, name: "name", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "difficulty", kind: "enum", T: () => ["common.QuestionDifficulty", QuestionDifficulty, "QUESTION_DIFFICULTY_"] },
            { no: 4, name: "content", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "solution", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<Question>): Question {
        const message = { questionId: 0, name: "", difficulty: 0, content: "", solution: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Question>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Question): Question {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint64 question_id */ 1:
                    message.questionId = reader.uint64().toNumber();
                    break;
                case /* string name */ 2:
                    message.name = reader.string();
                    break;
                case /* common.QuestionDifficulty difficulty */ 3:
                    message.difficulty = reader.int32();
                    break;
                case /* string content */ 4:
                    message.content = reader.string();
                    break;
                case /* string solution */ 5:
                    message.solution = reader.string();
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
    internalBinaryWrite(message: Question, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* uint64 question_id = 1; */
        if (message.questionId !== 0)
            writer.tag(1, WireType.Varint).uint64(message.questionId);
        /* string name = 2; */
        if (message.name !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.name);
        /* common.QuestionDifficulty difficulty = 3; */
        if (message.difficulty !== 0)
            writer.tag(3, WireType.Varint).int32(message.difficulty);
        /* string content = 4; */
        if (message.content !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.content);
        /* string solution = 5; */
        if (message.solution !== "")
            writer.tag(5, WireType.LengthDelimited).string(message.solution);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message common.Question
 */
export const Question = new Question$Type();