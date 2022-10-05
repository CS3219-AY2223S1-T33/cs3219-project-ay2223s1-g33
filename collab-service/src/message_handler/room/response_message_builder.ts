import { CollabTunnelResponse, CollabTunnelResponseFlags } from '../../proto/collab-service';

function makeUnauthorizedMessage(): CollabTunnelResponse {
  const emptyByte = new Uint8Array(0);
  return {
    data: emptyByte,
    flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_UNAUTHORIZED,
  };
}

// Creates collab response to be sent to client
function makeDataResponse(data: Uint8Array): CollabTunnelResponse {
  return CollabTunnelResponse.create({
    data: Buffer.from(data),
    flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_NONE,
  });
}

export {
  makeUnauthorizedMessage,
  makeDataResponse,
};
