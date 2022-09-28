import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import React from "react";

type Props = {
  isDisconnectModalOpen: boolean;
  onCloseDisconnectModal: () => void;
  leaveSessionHandler: () => void;
};

function DisconnectModal({
  isDisconnectModalOpen,
  onCloseDisconnectModal,
  leaveSessionHandler,
}: Props) {
  return (
    <Modal
      isOpen={isDisconnectModalOpen}
      onClose={onCloseDisconnectModal}
      size="xl"
      isCentered
      closeOnOverlayClick
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
