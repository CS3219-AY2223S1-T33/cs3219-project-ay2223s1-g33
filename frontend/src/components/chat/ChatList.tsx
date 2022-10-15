import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import ChatMessage from "./ChatMessage";

// const CHAT = [
//   { from: "Johnny", message: "Hello" },
//   { from: "Thomas", message: "Hello" }
// ];

function ChatList() {
  const chat = useSelector((state: RootState) => state.chat.chat);

  return (
    <>
      {chat.map((c) => (
        <ChatMessage message={c} />
      ))}
    </>
  );
}

export default ChatList;
