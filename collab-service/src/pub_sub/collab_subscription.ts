import { ServerDuplexStreamImpl } from '@grpc/grpc-js/build/src/server-call';
import assert from 'assert';
import { Subscription } from './collab_tunnel_pubsub_types';
import { CollabTunnelRequest, CollabTunnelResponse } from '../proto/collab-service';

class CollabSubscription implements Subscription<CollabTunnelRequest> {
  call: ServerDuplexStreamImpl<CollabTunnelRequest, CollabTunnelResponse>;

  constructor(call: ServerDuplexStreamImpl<CollabTunnelRequest, CollabTunnelResponse>) {
    this.call = call;
  }

  push(request: CollabTunnelRequest) {
    assert(this.call);
    const response = CollabTunnelResponse.create(
      {
        data: request.data,
      },
    );
    this.call.write(response);
  }

  isHandler(data: any) {
    return this.call === data;
  }
}

export default CollabSubscription;
