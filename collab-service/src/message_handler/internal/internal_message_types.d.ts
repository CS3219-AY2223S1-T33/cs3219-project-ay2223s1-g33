const enum ConnectionOpCode {
  DATA,
  JOIN,
  ACK,
  ROOM_DISCOVER,
  ROOM_HELLO,
}

declare type TunnelMessage = {
  sender: string,
  data: Uint8Array,
  flag: ConnectionOpCode,
};

declare type TunnelInternalMessage = {
  sender: string,
  data: Array<number>,
  flag: ConnectionOpCode,
};

export {
  ConnectionOpCode,
  TunnelMessage,
  TunnelInternalMessage,
};
