const enum ConnectionFlag {
  NONE,
  JOIN,
  ACK,
}

declare type TunnelMessage = {
  sender: string,
  nick: string,
  data: Uint8Array,
  flag: ConnectionFlag,
};

declare type TunnelInternalMessage = {
  sender: string,
  nick: string,
  data: Array<number>,
  flag: ConnectionFlag,
};

export {
  ConnectionFlag,
  TunnelMessage,
  TunnelInternalMessage,
};
