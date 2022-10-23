import { UntypedServiceImplementation } from '@grpc/grpc-js';
import { IMessageType } from '@protobuf-ts/runtime';
import cors from 'cors';
import express, {
  Express,
  Request,
  Response,
  Router,
} from 'express';
import Logger from '../utils/logger';
import jsonParseMiddleware from '../utils/json_middleware';
import {
  ApiHeaderMap,
  ApiService,
  IApiHandler,
} from './api_server_types';
import { HTTPResponse, IHTTPServer } from './http_server_types';

const HOST_ADDRESS = '0.0.0.0';

export default class HTTPServer implements IHTTPServer {
  httpPort: number;

  httpServer: Express;

  httpRouter: Router;

  private constructor(httpPort: number) {
    this.httpPort = httpPort;

    this.httpServer = express();
    this.httpServer.use(cors());
    this.httpRouter = Router();
    this.httpServer.use('/grpc', this.httpRouter);
  }

  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void {
    Object.keys(apiService.serviceHandlerDefinition).forEach((key) => {
      const typedHandler = apiService.serviceHandlerDefinition[key];
      const httpHandler = HTTPServer.adaptToHTTPhandler(
        typedHandler.handler,
        typedHandler.reqType,
        typedHandler.respType,
      );

      this.httpRouter.post(`/${key}`, jsonParseMiddleware, async (req: Request, resp: Response) => {
        try {
          const response = await httpHandler(req);
          if (response.status) {
            resp.status(response.status);
          }
          if (response.headers) {
            const respHeaders: ApiHeaderMap = response.headers;
            Object.keys(respHeaders).forEach((x) => {
              if (x in respHeaders) {
                resp.setHeader(key, respHeaders[x]);
              }
            });
          }
          resp.json(response.jsonResponse);
        } catch {
          resp.status(500).json({});
        }
      });
    });
  }

  static adaptToHTTPhandler<RequestType extends object, ResponseType extends object>(
    handler: IApiHandler<RequestType, ResponseType>,
    reqType: IMessageType<RequestType>,
    respType: IMessageType<ResponseType>,
  ): (req: Request) => Promise<HTTPResponse> {
    return async (req: Request): Promise<HTTPResponse> => {
      const headers = HTTPServer.parseIncomingHeaders(req);
      let requestObject: RequestType;
      try {
        requestObject = reqType.fromJson(req.body);
      } catch {
        return {
          status: 400,
          jsonResponse: {},
        };
      }

      const responseObject = await handler.handle({
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

  static parseIncomingHeaders(req: Request): ApiHeaderMap {
    const normalizedHeaders: ApiHeaderMap = {};
    Object.keys(req.headers).forEach((headerName: string) => {
      const value = req.headers[headerName];
      if (typeof value === 'string') {
        normalizedHeaders[headerName] = [value];
      }
    });

    return normalizedHeaders;
  }

  bind() {
    this.httpServer.listen(this.httpPort, HOST_ADDRESS, () => {
      Logger.info(`API server is running at http://${HOST_ADDRESS}:${this.httpPort}`);
    });
  }

  getServer(): Express {
    return this.httpServer;
  }

  static create(httpPort: number): IHTTPServer {
    return new HTTPServer(httpPort);
  }
}
