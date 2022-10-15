import { Flex } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import ChatMessage from "./ChatMessage";

function ChatList() {
  const chat = useSelector((state: RootState) => state.chat.chat);

  return (
    <Flex w="100%" minH="100%" flexGrow={2} direction="column-reverse">
      {chat.map((c) => (
        <ChatMessage message={c} />
      ))}
    </Flex>
  );
}

export default ChatList;
