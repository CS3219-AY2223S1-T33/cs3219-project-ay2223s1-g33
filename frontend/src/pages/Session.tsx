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
  Grid
  // Textarea,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
// import useWebSocket from "react-use-websocket";
import InvalidSession from "./InvalidSession";
import { RootState } from "../app/store";
import EditorTabs from "../components/editor/EditorTabs";
import { leaveRoom } from "../feature/matching/matchingSlice";
import SessionNavbar from "../components/ui/navbar/SessionNavbar";
// import { CONNECTION_MAP } from "../constants";
import Editor from "../components/editor/Editor";

function Session() {
  const roomToken = useSelector((state: RootState) => state.matching.roomToken);
  const username = useSelector((state: RootState) => state.user.user?.username);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // const { sendMessage, lastMessage, readyState } = useWebSocket(
  //   "ws://localhost:5001/ws"
  // );
  // This is a temporary state variable to track the websocket communication
  // const [inputVal, setInputVal] = useState("");

  // Continually listens for new messages sent and updates them accordingly
  // useEffect(() => {
  //   if (lastMessage !== null) {
  //     // ! lastMessage.data comes in as a blob, hence we must convert it to text
  //     lastMessage.data.text().then((x: any) => setInputVal(x));
  //   }
  // }, [lastMessage]);

  const leaveSessionHandler = () => {
    console.log("Leaving session");
    dispatch(leaveRoom());
    navigate("/");
  };

  // const sendHandler = () => {
  //   sendMessage(inputVal);
  // };

  if (!roomToken || !username) {
    return <InvalidSession leaveSessionHandler={leaveSessionHandler} />;
  }

  return (
    <>
      {/* Navbar for session */}
      <SessionNavbar
        // sendHandler={sendHandler}
        // status={CONNECTION_MAP[readyState]}
        sendHandler={() => console.log("WIP")}
        onOpen={onOpen}
        status="Open"
      />

      <Grid templateColumns="1fr 2fr" mx="auto">
        <EditorTabs />
        {/* Code Editor */}
        <Grid templateRows="7% 7fr auto" h="91vh">
          {/* Code Editor Settings */}
          <Flex direction="row" bg="gray.100" px={12} py={2}>
            Code Editor options
          </Flex>
          {/* Editor - I may find a more IDE-like component for this */}
          {/* <Textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            resize="none"
            h="100%"
          /> */}
          <Editor />
          {/* Test case window */}
          <Grid templateRows="1fr 3fr 1fr">
            <Text fontSize="lg">Testcases</Text>
            <Box>Content</Box>
            <Flex direction="row-reverse" px={12} pb={4}>
              <Button
                // onClick={sendHandler}
                onClick={() => console.log("WIP")}
              >
                Submit code
              </Button>
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
      {/* TODO: Modal when other user leaves the session */}
    </>
  );
}

export default Session;
