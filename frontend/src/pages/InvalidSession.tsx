import { Button, Flex, Heading } from "@chakra-ui/react";
import React from "react";

type Props = {
  leaveSessionHandler: () => void;
};

function InvalidSession({ leaveSessionHandler }: Props) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      w="100vw"
      h="100vh"
    >
      <Heading>Error: Expected Room Token</Heading>
      <Button colorScheme="red" onClick={leaveSessionHandler}>
        Leave Session
      </Button>
    </Flex>
  );
}

export default InvalidSession;
