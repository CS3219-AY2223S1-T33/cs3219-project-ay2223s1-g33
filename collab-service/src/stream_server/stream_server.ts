import {
  KeyCertPair,
  Server as GrpcServer,
  ServerCredentials,
} from '@grpc/grpc-js';
import Logger from '../utils/logger';
import CollabTunnelPubSub from '../tunneller/collab_service_router';

const hostAddress = '0.0.0.0';

class StreamServer {
  grpcPort: number;

  grpcServer: GrpcServer;

  grpcCertPair: KeyCertPair | undefined;

  constructor(grpcPort: number, grpcCert?: Buffer, grpcKey?: Buffer) {
    this.grpcPort = grpcPort;
    this.grpcServer = new GrpcServer();
    if (grpcCert && grpcKey) {
      this.grpcCertPair = {
        cert_chain: grpcCert,
        private_key: grpcKey,
      };
    } else {
      this.grpcCertPair = undefined;
    }
  }

  bind(): void {
    let creds: ServerCredentials;
    if (this.grpcCertPair) {
      Logger.info('GRPC operating in secure mode');
      creds = ServerCredentials.createSsl(null, [this.grpcCertPair], true);
    } else {
      Logger.warn('GRPC operating in insecure mode');
      creds = ServerCredentials.createInsecure();
    }
    this.grpcServer.bindAsync(
      `${hostAddress}:${this.grpcPort}`,
      creds,
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

function createStreamServer(grpcPort: number, grpcCert?: Buffer, grpcKey?: Buffer): StreamServer {
  return new StreamServer(grpcPort, grpcCert, grpcKey);
}

export default createStreamServer;
