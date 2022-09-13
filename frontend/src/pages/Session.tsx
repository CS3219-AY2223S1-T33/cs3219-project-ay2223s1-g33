import {
  Flex,
  Heading,
  Button,
  Text,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
  ModalContent,
  ModalFooter,
  useDisclosure,
  HStack,
  Code
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

function Session() {
  const roomToken = useSelector((state: RootState) => state.matching.roomToken);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // This is a temporary state variable to track the websocket communication
  // eslint-disable-next-line
  const [logs, setLogs] = useState<string[]>([]);

  const leaveSessionHandler = () => {
    console.log("Leaving session");
    navigate("/");
  };

  if (!roomToken) {
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

  return (
    <>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        w="100vw"
        h="100vh"
      >
        <Heading>This is the session room</Heading>
        <Text size="xl">Token</Text>
        <Code overflowWrap="break-word" w="65%">
          {roomToken}
        </Code>
        <Button onClick={onOpen}>Leave Session</Button>

        <Heading mt={10}>WS Log</Heading>
        {logs.map((l) => (
          <Text>{l}</Text>
        ))}
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leaving soon?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            Leaving this session will also terminate this session with your
            buddy.
          </ModalBody>
          <ModalFooter>
            <HStack gap={4}>
              <Button variant="outline" colorScheme="green" onClick={onClose}>
                Continue Session
              </Button>
              <Button colorScheme="red" onClick={leaveSessionHandler}>
                Leave Session
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Session;
