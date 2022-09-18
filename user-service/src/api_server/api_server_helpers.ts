import {
  ServerUnaryCall, sendUnaryData, Metadata, handleUnaryCall,
} from '@grpc/grpc-js';
import { IMessageType } from '@protobuf-ts/runtime';
import {
  IApiHandler,
  ApiCallHandler,
  ApiResponse,
  HTTPResponse,
} from './api_server_types';
import Logger from '../utils/logger';

function getGrpcRouteHandler<RequestType, ResponseType>(
  handler: IApiHandler<RequestType, ResponseType>,
): handleUnaryCall<RequestType, ResponseType> {
  return async (
    call: ServerUnaryCall<RequestType, ResponseType>,
    callback: sendUnaryData<ResponseType>,
  ) => {
    call.on('error', (args) => {
      Logger.warn(`Error on GRPC Route call: ${args}`);
    });

    const metadata = call.metadata.getMap();
    const headers: { [key: string]: string[] } = {};
    Object.keys(metadata).forEach((key: string) => {
      headers[key] = [metadata[key].toString()];
    });

    const cookies = call.metadata.get('Cookie').map((val) => val.toString());
    if (cookies.length > 0) {
      headers.Cookie = cookies;
    }

    const response: ApiResponse<ResponseType> = await handler.handle({
      request: call.request,
      headers,
    });

    const responseHeaders = new Metadata();
    Object.keys(response.headers).forEach((key: string) => {
      const values = response.headers[key];
      if (values.length === 0) {
        return;
      }

      if (key === 'Set-Cookie') {
        values.forEach((value) => responseHeaders.add(key, value));
      } else {
        responseHeaders.add(key, response.headers[key][0]);
      }
    });

    call.sendMetadata(responseHeaders);
    callback(null, response.response, undefined);
  };
}

function getHttpRouteHandler<RequestType extends object, ResponseType extends object>(
  handler: IApiHandler<RequestType, ResponseType>,
  reqType: IMessageType<RequestType>,
  respType: IMessageType<ResponseType>,
): (json: any, headers: { [key: string]: string[] }) => Promise<HTTPResponse> {
  return async (requestJson: any, headers: { [key: string]: string[] }): Promise<HTTPResponse> => {
    const requestObject = reqType.fromJson(requestJson);
    const responseObject: ApiResponse<ResponseType> = await handler.handle({
      request: requestObject,
      headers,
    });
    return {
      jsonResponse: respType.toJson(responseObject.response, {
        enumAsInteger: true,
      }),
      headers: responseObject.headers,
    };
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
