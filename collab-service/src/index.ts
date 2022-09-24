import loadEnvironment from './utils/env_loader';
import createStreamServer from './stream_server/stream_server';
import CollabTunnelPubSub from './tunneller/collab_tunnel_redis';

const envConfig = loadEnvironment();

const streamServer = createStreamServer(envConfig.GRPC_TUNNEL_PORT);
streamServer.registerServiceRoutes(new CollabTunnelPubSub());
streamServer.bind();
