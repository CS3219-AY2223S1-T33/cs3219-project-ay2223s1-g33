import { Server as GrpcServer, ServerCredentials } from '@grpc/grpc-js';
import { tunnelServiceDefinition } from '../proto/tunnel-service.grpc-server';
import {
  TunnelServiceRequest,
  TunnelServiceResponse,
} from '../proto/tunnel-service';
import Logger from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let count = -1;
const allUsers = ['user1', 'user2'];
const usersInChat: any[] = [];
const observers: any[] = [];

function doOpenStream(call : any) {
  // When user joins
  count += 1;
  count %= 2;
  const user = allUsers[count];
  const userExist = usersInChat.find((_user) => _user === user);
  if (!userExist) {
    // eslint-disable-next-line no-console
    console.log(`Added ${user}`);
    usersInChat.push(user);
    observers.push({ call });
  }

  // When data is detected
  call.on('data', (request : TunnelServiceRequest) => {
    observers.forEach((observer) => {
      const response = TunnelServiceResponse.create(
        {
          data: request.data,
        },
      );
      observer.call.write(response);
    });
  });

  // When stream ends
  call.on('end', () => {
    call.end();
  });
}

function getServer() {
  const server = new GrpcServer();
  server.addService(tunnelServiceDefinition, {
    OpenStream: doOpenStream,
  });
  return server;
}

function setServer() {
  // If this is run as a script, start a server on an unused port
  const tunnelServer = getServer();
  tunnelServer.bindAsync(
    '0.0.0.0:9090',
    ServerCredentials.createInsecure(),
    (err: Error | null, port: number) => {
      if (err) {
        Logger.error(`GRPC Streaming Server error: ${err.message}`);
      } else {
        Logger.info(`GRPC Streaming Server bound on port: ${port}`);
        tunnelServer.start();
      }
    },
  );
}

export default setServer;
