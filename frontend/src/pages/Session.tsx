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
  useDisclosure
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";

function Session() {
  const navigate = useNavigate();
  const params = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const leaveSessionHandler = () => {
    // TODO Add a modal for confirmation
    console.log("Leaving session");
    navigate("/");
  };

  return (
    <>
      <Flex
        direction="column"
        w="100vw"
        h="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Heading>This is the session room</Heading>
        <Text>{`Hardcoded ID: ${params.sessionId}`}</Text>
        {/* <Button onClick={onOpen}>Open Modal</Button> */}
        <Button onClick={onOpen}>Leave Session</Button>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leaving soon?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            Leaving this session will also terminate this session with your
            buddy.
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" colorScheme="green" onClick={onClose}>
              Continue Session
            </Button>
            <Button colorScheme="red" onClick={leaveSessionHandler}>
              Leave Session
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Session;
