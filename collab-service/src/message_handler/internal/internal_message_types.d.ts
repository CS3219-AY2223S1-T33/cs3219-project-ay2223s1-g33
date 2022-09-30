const enum ConnectionFlag {
  DATA,
  JOIN,
  ACK,
}

declare type TunnelMessage = {
  sender: string,
  data: Uint8Array,
  flag: ConnectionFlag,
};

declare type TunnelInternalMessage = {
  sender: string,
  data: Array<number>,
  flag: ConnectionFlag,
};

export {
  ConnectionFlag,
  TunnelMessage,
  TunnelInternalMessage,
};
