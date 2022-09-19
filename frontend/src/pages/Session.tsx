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
} from "@chakra-ui/react";
import * as Y from "yjs";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WebsocketProvider } from "y-websocket";
import InvalidSession from "./InvalidSession";
import { RootState } from "../app/store";
import EditorTabs from "../components/editor/EditorTabs";
import { leaveRoom } from "../feature/matching/matchingSlice";
import SessionNavbar from "../components/ui/navbar/SessionNavbar";
import Editor from "../components/editor/Editor";

let isInit = false;
function Session() {
  const roomToken = useSelector((state: RootState) => state.matching.roomToken);
  const nickname = useSelector((state: RootState) => state.user.user?.nickname);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [yDoc, setYDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<WebsocketProvider>();
  const [yText, setYText] = useState<Y.Text>();
  const [undoManager, setundoManager] = useState<Y.UndoManager>();

  useEffect(() => {
    if (!isInit) {
      // Yjs initialisation
      const tempyDoc = new Y.Doc();
      const params: { [x: string]: string } = {
        room: roomToken === undefined ? "" : roomToken,
      };

      // First 2 params builds the room session: ws://localhost:5001/ + ws
      const tempprovider = new WebsocketProvider(
        "ws://localhost:5001/api/",
        "roomws",
        tempyDoc,
        { params, disableBc: true }
      );

      // If the connection is terminated, it should not attempt to reconnect
      tempprovider.shouldConnect = false;

      const tempyText = tempyDoc.getText("codemirror");
      const tempundoManager = new Y.UndoManager(tempyText);

      // Sets the initialised values to the react state
      setYDoc(tempyDoc);
      setProvider(tempprovider);
      setYText(tempyText);
      setundoManager(tempundoManager);
      isInit = true;
    }
    return () => {};
  }, []);

  const leaveSessionHandler = () => {
    // Destroy websocket and yDoc instance
    provider?.destroy();
    yDoc?.destroy();
    // Clears the room session token
    dispatch(leaveRoom());

    // Just in case for rejoins
    isInit = false;
    navigate("/");
  };

  if (!roomToken || !nickname) {
    return <InvalidSession leaveSessionHandler={leaveSessionHandler} />;
  }

  const collabDefined = yText && provider && undoManager;

  // Naive way of handling websocket states - to be improved
  const isWSOpen = provider ? provider.wsconnected : false;

  return (
    <>
      {/* Navbar for session */}
      <SessionNavbar onOpen={onOpen} status={isWSOpen ? "Open" : "Closed"} />

      <Grid templateColumns="1fr 2fr" mx="auto">
        <EditorTabs />
        {/* Code Editor */}
        <Grid templateRows="7% 7fr auto" h="91vh">
          {/* Code Editor Settings */}
          <Flex direction="row" bg="gray.100" px={12} py={2}>
            Code Editor options
          </Flex>
          {/* Editor - I may find a more IDE-like component for this */}
          {collabDefined && (
            <Editor
              yText={yText}
              provider={provider}
              undoManager={undoManager}
              nickname={nickname}
            />
          )}
          {/* Test case window */}
          <Grid templateRows="1fr 3fr 1fr">
            <Text fontSize="lg">Testcases</Text>
            <Box>Content</Box>
            <Flex direction="row-reverse" px={12} pb={4}>
              <Button onClick={() => console.log("WIP")}>Submit code</Button>
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
      {/* TODO: Popup when other user leaves the session */}
    </>
  );
}

export default Session;
