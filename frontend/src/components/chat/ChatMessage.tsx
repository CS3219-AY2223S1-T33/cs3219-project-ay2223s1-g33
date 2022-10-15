import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { Chat } from "../../feature/chat/chatSlice";

type Props = {
  message: Chat;
};

function ChatMessage({ message }: Props) {
  const { message: content, from } = message;

  return (
    <Flex direction="column">
      <Text fontWeight="bold">{from}</Text>
      <Text>{content}</Text>
    </Flex>
  );
}

export default ChatMessage;
