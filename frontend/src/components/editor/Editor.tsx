import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import * as Y from "yjs";
import React, { useEffect } from "react";
import { WebsocketProvider } from "y-websocket";
import { yCollab } from "y-codemirror.next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

const yDoc = new Y.Doc();
// First 2 params builds the room session: ws://localhost:5001/ + ws
const provider = new WebsocketProvider("ws://localhost:5001/", "ws", yDoc);
const yText = yDoc.getText("codemirror");
const undoManager = new Y.UndoManager(yText);

function Editor() {
  const username = useSelector((state: RootState) => state.user.user?.username);

  useEffect(() => {
    provider.awareness.setLocalStateField("user", {
      name: username ?? "Anonymous user",
      color: "#1be7ff",
      colorLight: "#1be7ff33"
    });

    return () => {};
  }, []);

  return (
    <CodeMirror
      value={`console.log("Hello World")`}
      height="100%"
      extensions={[
        javascript({ jsx: true }),
        yCollab(yText, provider.awareness, { undoManager })
      ]}
      // extensions={[javascript({ jsx: true })], yCollab(ytext, provider.awareness, {undoManager})}
      // onChange={codeChangeHandler}
    />
  );
}

export default Editor;
