import { IMessageType } from '@protobuf-ts/runtime';
import {
  IApiHandler,
  TypedApiHandler,
} from './api_server_types';

// eslint-disable-next-line import/prefer-default-export
export function fromApiHandler<RequestType extends object, ResponseType extends object>(
  handler: IApiHandler<RequestType, ResponseType>,
  reqType: IMessageType<RequestType>,
  respType: IMessageType<ResponseType>,
): TypedApiHandler<RequestType, ResponseType> {
  return {
    handler,
    reqType,
    respType,
  };
}
