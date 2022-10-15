import React from "react";
import ChatInput from "./ChatInput";
import ChatList from "./ChatList";

type Props = {
  sendTextMessage: (content: string) => void;
};
function ChatSection({ sendTextMessage }: Props) {
  return (
    <>
      <ChatList />
      <ChatInput sendTextMessage={sendTextMessage} />
    </>
  );
}

export default ChatSection;
