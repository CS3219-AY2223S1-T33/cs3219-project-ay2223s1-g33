import { ServerDuplexStreamImpl } from '@grpc/grpc-js/build/src/server-call';
import assert from 'assert';
import { Subscription } from './tunnel_pubsub_types';
import { TunnelServiceRequest, TunnelServiceResponse } from '../proto/tunnel-service';

class CollabSubscription implements Subscription<TunnelServiceRequest> {
  call: ServerDuplexStreamImpl<TunnelServiceRequest, TunnelServiceResponse>;

  constructor(call: ServerDuplexStreamImpl<TunnelServiceRequest, TunnelServiceResponse>) {
    this.call = call;
  }

  push(request: TunnelServiceRequest) {
    assert(this.call);
    const response = TunnelServiceResponse.create(
      {
        data: request.data,
      },
    );
    this.call.write(response);
  }
}

export default CollabSubscription;
