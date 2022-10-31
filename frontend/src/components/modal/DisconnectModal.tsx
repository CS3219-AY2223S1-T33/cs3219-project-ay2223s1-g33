import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button
} from "@chakra-ui/react";
import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  leaveSessionHandler: () => void;
};

function DisconnectModal({ isOpen, onClose, leaveSessionHandler }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Oh no!</ModalHeader>
        <ModalCloseButton />

        <ModalBody>You got disconnected from the server.</ModalBody>
        <ModalFooter>
          <Button colorScheme="red" onClick={leaveSessionHandler}>
            Leave Session
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default DisconnectModal;
