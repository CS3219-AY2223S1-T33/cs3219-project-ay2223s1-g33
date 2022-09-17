import { ReadyState } from "react-use-websocket";

const CONNECTION_MAP = {
  [ReadyState.CONNECTING]: "Connecting",
  [ReadyState.OPEN]: "Open",
  [ReadyState.CLOSING]: "Closing",
  [ReadyState.CLOSED]: "Closed",
  [ReadyState.UNINSTANTIATED]: "Uninstantiated",
};

// eslint-disable-next-line import/prefer-default-export
export { CONNECTION_MAP };
