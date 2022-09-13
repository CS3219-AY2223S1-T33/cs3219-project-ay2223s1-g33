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
  Code,
  Input
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { RootState } from "../app/store";

const CONNECTION_MAP = {
  [ReadyState.CONNECTING]: "Connecting",
  [ReadyState.OPEN]: "Open",
  [ReadyState.CLOSING]: "Closing",
  [ReadyState.CLOSED]: "Closed",
  [ReadyState.UNINSTANTIATED]: "Uninstantiated"
};

function Session() {
  const roomToken = useSelector((state: RootState) => state.matching.roomToken);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    "ws://localhost:5001/ws"
  );
  // This is a temporary state variable to track the websocket communication
  const [inputVal, setInputVal] = useState("");

  // Continually listens for new messages sent and updates them accordingly
  useEffect(() => {
    if (lastMessage !== null) {
      // ! lastMessage.data comes in as a blob, hence we must convert it to text
      lastMessage.data.text().then((x: any) => setInputVal(x));
    }
  }, [lastMessage]);

  const leaveSessionHandler = () => {
    console.log("Leaving session");
    navigate("/");
  };

  const sendHandler = () => {
    sendMessage(inputVal);
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

        <Heading mt={10}>{`WS Status: ${CONNECTION_MAP[readyState]}`}</Heading>
        <Input
          type="text"
          onChange={(e) => setInputVal(e.target.value)}
          value={inputVal}
        />
        <Button onClick={sendHandler}>Send</Button>
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
