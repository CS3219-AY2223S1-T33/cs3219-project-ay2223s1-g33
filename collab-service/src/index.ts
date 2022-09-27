import loadEnvironment from './utils/env_loader';
import createStreamServer from './stream_server/stream_server';
import CollabTunnelPubSub from './tunneller/collab_tunnel_handler';
import CollabTunnelController from './tunneller/collab_tunnel_controller';

const envConfig = loadEnvironment();

const streamServer = createStreamServer(envConfig.GRPC_TUNNEL_PORT);
const controller = new CollabTunnelController(
  envConfig.REDIS_SERVER_URL,
  envConfig.JWT_ROOM_SECRET,
);

const handler = new CollabTunnelPubSub(controller);
streamServer.registerServiceRoutes(handler);
streamServer.bind();
