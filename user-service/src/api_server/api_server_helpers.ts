import {
  ServerUnaryCall,
  sendUnaryData,
  Metadata,
  handleUnaryCall,
} from '@grpc/grpc-js';
import { IMessageType } from '@protobuf-ts/runtime';
import { IApiHandler, ApiCallHandler } from './api_server_types';
import Logger from '../utils/logger';

function getGrpcRouteHandler<RequestType, ResponseType>(
  handler: IApiHandler<RequestType, ResponseType>,
): handleUnaryCall<RequestType, ResponseType> {
  return (
    call: ServerUnaryCall<RequestType, ResponseType>,
    callback: sendUnaryData<ResponseType>,
  ) => {
    call.on('error', (args) => {
      Logger.warn(`Error on GRPC Route call: ${args}`);
    });

    const response = handler.handle(call.request);

    const responseHeaders = new Metadata();
    responseHeaders.add('server-header', 'server header value');
    call.sendMetadata(responseHeaders);

    callback(null, response, undefined);
  };
}

function getHttpRouteHandler<RequestType extends object, ResponseType extends object>(
  handler: IApiHandler<RequestType, ResponseType>,
  reqType: IMessageType<RequestType>,
  respType: IMessageType<ResponseType>,
): ((object: any) => any) {
  return (requestJson: any): any => {
    let requestObject: RequestType;
    try {
      requestObject = reqType.fromJson(requestJson);
    } catch {
      return respType.create();
    }
    const responseObject = handler.handle(requestObject);
    return respType.toJson(responseObject);
  };
}

// eslint-disable-next-line import/prefer-default-export
export function fromApiHandler<RequestType extends object, ResponseType extends object>(
  handler: IApiHandler<RequestType, ResponseType>,
  reqType: IMessageType<RequestType>,
  respType: IMessageType<ResponseType>,
): ApiCallHandler<RequestType, ResponseType> {
  return {
    handler,
    grpcRouteHandler: getGrpcRouteHandler(handler),
    httpRouteHandler: getHttpRouteHandler(handler, reqType, respType),
  };
}
