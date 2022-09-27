import {
  Server as GrpcServer,
  ServerCredentials,
} from '@grpc/grpc-js';
import Logger from '../utils/logger';
import CollabTunnelPubSub from '../tunneller/collab_tunnel_handler';

const hostAddress = '0.0.0.0';

class StreamServer {
  grpcPort: number;

  grpcServer: GrpcServer;

  constructor(grpcPort: number) {
    this.grpcPort = grpcPort;
    this.grpcServer = new GrpcServer();
  }

  bind(): void {
    this.grpcServer.bindAsync(
      `${hostAddress}:${this.grpcPort}`,
      ServerCredentials.createInsecure(),
      (err: Error | null, port: number) => {
        if (err) {
          Logger.error(`GRPC Stream Server error: ${err.message}`);
        } else {
          Logger.info(`GRPC Stream Server bound on port: ${port}`);
          this.grpcServer.start();
        }
      },
    );
  }

  registerServiceRoutes(handler: CollabTunnelPubSub): void {
    this.grpcServer.addService(handler.serviceDefinition, handler.serviceImplementation);
  }
}

function createStreamServer(grpcPort: number): StreamServer {
  return new StreamServer(grpcPort);
}

export default createStreamServer;
