import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { Chat } from "../../types/types";

type Props = {
  message: Chat;
};

function ChatMessage({ message }: Props) {
  const { message: content, from } = message;

  return (
    <Flex direction="column" py={2} borderBottom="1px solid gray">
      <Text fontWeight="bold">{from}</Text>
      <Text>{content}</Text>
    </Flex>
  );
}

export default ChatMessage;
