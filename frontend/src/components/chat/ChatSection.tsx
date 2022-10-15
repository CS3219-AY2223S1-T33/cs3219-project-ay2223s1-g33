import { Flex } from "@chakra-ui/react";
import React from "react";
import ChatInput from "./ChatInput";
import ChatList from "./ChatList";

type Props = {
  sendTextMessage: (content: string) => void;
};
function ChatSection({ sendTextMessage }: Props) {
  return (
    <Flex h="80vh" w="100%" flexDir="column">
      <ChatList />
      <ChatInput sendTextMessage={sendTextMessage} />
    </Flex>
  );
}

export default ChatSection;
