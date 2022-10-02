import { CollabTunnelResponse, CollabTunnelResponseFlags } from '../proto/collab-service';

function createUnauthorizedMessage(): CollabTunnelResponse {
  const emptyByte = new Uint8Array(0);
  return {
    data: emptyByte,
    flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_UNAUTHORIZED,
  };
}
export default createUnauthorizedMessage;
