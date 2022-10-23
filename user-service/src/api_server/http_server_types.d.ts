import { Express } from 'express';
import { ApiHeaderMap, IProtocolServer } from './api_server_types';

declare type HTTPResponse = {
  jsonResponse: any;
  headers: ApiHeaderMap;
};

declare type HTTPRouteHandler = (json: any, headers: ApiHeaderMap) => Promise<HTTPResponse>;

declare interface IHTTPServer extends IProtocolServer {
  getServer(): Express;
}

export {
  HTTPResponse,
  HTTPRouteHandler,
  IHTTPServer,
};
