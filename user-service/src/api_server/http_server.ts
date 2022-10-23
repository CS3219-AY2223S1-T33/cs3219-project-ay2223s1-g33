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
  ApiResponse,
  ApiService,
  IApiHandler,
} from './api_server_types';
import { HTTPResponse, IHTTPServer } from './http_server_types';

const HOST_ADDRESS = '0.0.0.0';

class HTTPServer implements IHTTPServer {
  httpPort: number;

  httpServer: Express;

  httpRouter: Router;

  constructor(httpPort: number) {
    this.httpPort = httpPort;

    this.httpServer = express();
    this.httpServer.use(cors());
    this.httpRouter = Router();
    this.httpServer.use('/grpc', this.httpRouter);
  }

  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void {
    Object.keys(apiService.serviceHandlerDefinition).forEach((key) => {
      const typedHandler = apiService.serviceHandlerDefinition[key];
      const httpHandler = HTTPServer.adaptToHTTP(
        typedHandler.handler,
        typedHandler.reqType,
        typedHandler.respType,
      );
      this.httpRouter.post(`/${key}`, jsonParseMiddleware, async (req: Request, resp: Response) => {
        const normalizedHeaders: ApiHeaderMap = {};

        Object.keys(req.headers).forEach((headerName: string) => {
          const value = req.headers[headerName];
          if (typeof value === 'string') {
            normalizedHeaders[headerName] = [value];
          }
        });

        try {
          const response = await httpHandler(req.body, normalizedHeaders);
          Object.keys(response.headers).forEach((headerName: string) => {
            resp.header(headerName, response.headers[headerName]);
          });
          resp.json(response.jsonResponse);
        } catch {
          resp.status(400).json({});
        }
      });
    });
  }

  static adaptToHTTP<RequestType extends object, ResponseType extends object>(
    handler: IApiHandler<RequestType, ResponseType>,
    reqType: IMessageType<RequestType>,
    respType: IMessageType<ResponseType>,
  ): (json: any, headers: { [key: string]: string[] }) => Promise<HTTPResponse> {
    return async (requestJson: any, headers: ApiHeaderMap): Promise<HTTPResponse> => {
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

  bind() {
    this.httpServer.listen(this.httpPort, HOST_ADDRESS, () => {
      Logger.info(`API server is running at http://${HOST_ADDRESS}:${this.httpPort}`);
    });
  }

  getServer(): Express {
    return this.httpServer;
  }
}

export default function makeHTTPServer(httpPort: number): IHTTPServer {
  return new HTTPServer(httpPort);
}
