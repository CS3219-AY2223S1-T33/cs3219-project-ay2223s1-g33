import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  HStack,
  Button
} from "@chakra-ui/react";
import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  leaveSessionHandler: () => void;
};

function LeaveModal({ isOpen, onClose, leaveSessionHandler }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Leaving soon?</ModalHeader>
        <ModalCloseButton />

        <ModalBody>Are you sure you want to leave the session?</ModalBody>
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
  );
}

export default LeaveModal;
