import {
  Flex,
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
  Box,
  Grid,
  Textarea,
  Heading
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { RootState } from "../app/store";
import EditorTabs from "../components/editor/EditorTabs";

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
  const {
    // sendMessage,
    lastMessage,
    readyState
  } = useWebSocket("ws://localhost:5001/ws");
  // This is a temporary state variable to track the websocket communication
  const [inputVal, setInputVal] = useState("");

  // Continually listens for new messages sent and updates them accordingly
  useEffect(() => {
    if (lastMessage !== null) {
      // ! lastMessage.data comes in as a blob, hence we must convert it to text
      lastMessage.data.text().then((x: any) => setInputVal(x));
    }
  }, [lastMessage]);

  useEffect(() => {
    console.log(readyState);
    return () => {};
  }, [readyState]);

  const leaveSessionHandler = () => {
    console.log("Leaving session");
    navigate("/");
  };

  const sendHandler = () => {
    console.log("Send websocket message: ", inputVal);
    // console.log(roomToken);
    // sendMessage(inputVal);
  };

  if (!roomToken) {
    // TODO: Refactor
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
      {/* Navbar for session */}
      <Box bg="gray.100" px={12} py={2} borderBottom="1px solid #A0AEC0">
        <Flex alignItems="center" justifyContent="space-between" h={16}>
          {/* Handles the websocket status */}
          {/* <Heading mt={10}>{`WS Status: ${CONNECTION_MAP[readyState]}`}</Heading> */}
          {/* Temporary */}
          <Text fontSize="lg">
            {`Session Status: ${CONNECTION_MAP[readyState]}`}
          </Text>

          <Flex alignItems="center">
            <HStack spacing={7}>
              {/* Temporary */}
              <Button onClick={sendHandler}>Send Stuff</Button>
              <Button onClick={onOpen} colorScheme="red">
                Leave Session
              </Button>
            </HStack>
          </Flex>
        </Flex>
      </Box>

      <Grid templateColumns="1fr 2fr" mx="auto">
        <EditorTabs />

        {/* Code Editor */}
        <Grid templateRows="7% 7fr auto" h="91vh">
          {/* Code Editor Settings */}
          <Flex direction="row" bg="gray.100" px={12} py={2}>
            Code Editor options
          </Flex>
          {/* Editor - I may find a more IDE-like component for this */}
          <Textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            resize="none"
            h="100%"
          />
          {/* Test case window */}
          <Grid templateRows="1fr 3fr 1fr">
            <Text fontSize="lg">Testcases</Text>
            <Box>Content</Box>
            {/* <Box>Run button</Box> */}
            <Flex direction="row-reverse" px={12}>
              <Button onClick={sendHandler}>Submit code</Button>
            </Flex>
          </Grid>
        </Grid>
      </Grid>
      {/* Modal for leaving the session */}
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
      {/* TODO: Modal when other user left */}
    </>
  );
}

export default Session;
