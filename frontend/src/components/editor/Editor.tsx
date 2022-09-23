import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import * as Y from "yjs";
import React, { useEffect } from "react";
import { WebsocketProvider } from "y-websocket-peerprep";
import { yCollab } from "y-codemirror.next";

let providerSet = false;

type Props = {
  yText: Y.Text;
  provider: WebsocketProvider;
  undoManager: Y.UndoManager;
  nickname: string;
};

function Editor({ yText, provider, undoManager, nickname }: Props) {
  useEffect(() => {
    if (!providerSet) {
      provider.awareness.setLocalStateField("user", {
        name: nickname,
        color: "#6eeb83",
        colorLight: "#6eeb8333",
      });
      providerSet = true;
    }

    return () => {};
  }, []);

  return (
    <CodeMirror
      value=""
      height="100%"
      extensions={[
        javascript({ jsx: true }),
        yCollab(yText, provider.awareness, { undoManager }),
      ]}
    />
  );
}

export default Editor;
