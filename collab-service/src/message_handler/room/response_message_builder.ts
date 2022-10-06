import {
  CollabTunnelRequestFlags,
  CollabTunnelResponse,
  CollabTunnelResponseFlags,
} from '../../proto/collab-service';

/*
 * Creates unauthorized error response message
 */
function makeUnauthorizedMessage(): CollabTunnelResponse {
  return {
    data: Buffer.from([]),
    flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_UNAUTHORIZED,
  };
}

/*
 * Creates normal response message for data forwarding
 */
function makeDataResponse(data: Uint8Array): CollabTunnelResponse {
  return CollabTunnelResponse.create({
    data: Buffer.from(data),
    flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_NONE,
  });
}

/*
 * Creates heartbeat response message for gateway upkeep
 */
function makeHeartbeatResponse(): CollabTunnelResponse {
  return CollabTunnelResponse.create({
    data: Buffer.from([]),
    flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_HEARTBEAT,
  });
}

function isHeartbeat(flag: number): boolean {
  /* eslint no-bitwise: ["error", { "allow": ["&"] }] */
  return (flag & CollabTunnelRequestFlags.COLLAB_REQUEST_FLAG_HEARTBEAT)
    === CollabTunnelRequestFlags.COLLAB_REQUEST_FLAG_HEARTBEAT;
}

export {
  makeUnauthorizedMessage,
  makeDataResponse,
  makeHeartbeatResponse,
  isHeartbeat,
};
