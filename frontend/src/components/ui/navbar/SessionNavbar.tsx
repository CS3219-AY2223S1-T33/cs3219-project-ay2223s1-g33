import { Box, Flex, HStack, Button, Text } from "@chakra-ui/react";
import React from "react";

type Props = {
  sendHandler: () => void;
  onOpen: () => void;
  status: string;
};

function SessionNavbar({ sendHandler, onOpen, status }: Props) {
  return (
    <Box bg="gray.100" px={12} py={2} borderBottom="1px solid #A0AEC0">
      <Flex alignItems="center" justifyContent="space-between" h={16}>
        {/* Handles the websocket status */}
        <Text fontSize="lg">{`Session Status: ${status}`}</Text>

        <Flex alignItems="center">
          <HStack spacing={7}>
            {/* Temporary button for testing */}
            <Button onClick={sendHandler}>Send Stuff</Button>
            <Button onClick={onOpen} colorScheme="red">
              Leave Session
            </Button>
          </HStack>
        </Flex>
      </Flex>
    </Box>
  );
}

export default SessionNavbar;
