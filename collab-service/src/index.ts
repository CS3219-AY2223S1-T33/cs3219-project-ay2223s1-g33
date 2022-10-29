import loadEnvironment from './utils/env_loader';
import createStreamServer from './stream_server/stream_server';
import CollabTunnelRouter from './tunneller/collab_service_router';
import { createCollabTunnelController } from './tunneller/collab_tunnel_controller';
import Logger from './utils/logger';
import Constants from './constants';

const version = `${Constants.VERSION_MAJOR}.${Constants.VERSION_MINOR}.${Constants.VERSION_REVISION}`;
Logger.info(`Starting Collab Service [V${version}]`);
const envConfig = loadEnvironment();

const streamServer = createStreamServer(envConfig.GRPC_PORT);

const collabController = createCollabTunnelController(
  envConfig.REDIS_SERVER_URL,
  envConfig.QUESTION_SERVICE_URL,
  envConfig.HISTORY_SERVICE_URL,
  envConfig.ROOM_SIGNING_SECRET,
);

const router = new CollabTunnelRouter(collabController);
streamServer.registerServiceRoutes(router);
streamServer.bind();
