import loadEnvironment from './utils/env_loader';
import createStreamServer from './stream_server/stream_server';
import CollabTunnelRouter from './tunneller/collab_service_router';
import CollabTunnelController from './tunneller/collab_tunnel_controller';

const envConfig = loadEnvironment();

const streamServer = createStreamServer(envConfig.GRPC_PORT);
const controller = new CollabTunnelController(
  envConfig.REDIS_SERVER_URL,
  envConfig.JWT_ROOM_SECRET,
);

const router = new CollabTunnelRouter(controller);
streamServer.registerServiceRoutes(router);
streamServer.bind();
