import {
  CollabTunnelRequestFlags,
  CollabTunnelResponse,
  CollabTunnelResponseFlags,
} from '../../proto/collab-service';

/*
 * Creates unauthorized error response message
 */
function makeUnauthorizedResponse(): CollabTunnelResponse {
  return {
    data: Buffer.from([]),
    flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_UNAUTHORIZED,
  };
}

/*
 * Creates normal response message for data forwarding
 * @param data
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

/*
 * Checks if message flag is a heartbeat
 * @param flag
 */
function isHeartbeat(flag: number): boolean {
  /* eslint no-bitwise: ["error", { "allow": ["&"] }] */
  return (flag & CollabTunnelRequestFlags.COLLAB_REQUEST_FLAG_HEARTBEAT)
    === CollabTunnelRequestFlags.COLLAB_REQUEST_FLAG_HEARTBEAT;
}

export {
  makeUnauthorizedResponse,
  makeDataResponse,
  makeHeartbeatResponse,
  isHeartbeat,
};
